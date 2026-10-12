import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { isAdmin, isAuthorized } from '../middleware/auth.middleware.js';
import { setUserBlocked, listUsers, updateUser } from '../controllers/admin.controller.js';
import nodemailer from 'nodemailer';

// Prevent the existing mail module's startup verification from using the network.
const createTransport = nodemailer.createTransport;
nodemailer.createTransport = () => ({ verify: async () => true });
const { login, refreshTokenController, Signup } = await import('../controllers/user.controllers.js');
nodemailer.createTransport = createTransport;

const original = { findByIdAndUpdate: User.findByIdAndUpdate, findById: User.findById, findOne: User.findOne, findOneAndUpdate: User.findOneAndUpdate, find: User.find, create: User.create };
afterEach(() => Object.assign(User, original));
function response() {
  return { statusCode: 200, cookies: [], status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, clearCookie(name) { this.cookies.push(name); return this; }, cookie() { return this; } };
}
const id = '507f1f77bcf86cd799439011';

test('only administrators can pass the admin guard', () => {
  for (const role of ['user', undefined]) {
    const res = response();
    isAdmin({ user: { role } }, res, () => assert.fail('access granted'));
    assert.equal(res.statusCode, 403);
  }
  let passed = false;
  isAdmin({ user: { role: 'admin' } }, response(), () => { passed = true; });
  assert.ok(passed);
});

test('blocked users cannot use an existing access token', async () => {
  process.env.JWT_SECRET_USER = 'test-only-secret';
  User.findById = () => ({ select: async () => ({ email: 'test@example.com', isBlocked: true }) });
  const res = response();
  await isAuthorized({ cookies: { accessToken: jwt.sign({ id }, process.env.JWT_SECRET_USER) } }, res, () => assert.fail('access granted'));
  assert.equal(res.body.code, 'ACCOUNT_BLOCKED');
  assert.equal(res.cookies.length, 2);
});

test('blocked users cannot login or refresh', async () => {
  const user = { _id: id, email: 'test@example.com', isBlocked: true, password: await bcrypt.hash('password', 4) };
  User.findOne = () => ({ ...user, select: async () => user });
  const res = response();
  await login({ body: { email: user.email, username: 'test', password: 'password' } }, res);
  assert.equal(res.body.code, 'ACCOUNT_BLOCKED');
  const refreshed = response();
  await refreshTokenController({ cookies: { refreshToken: jwt.sign({ id }, process.env.JWT_SECRET_USER) } }, refreshed);
  assert.equal(refreshed.body.code, 'ACCOUNT_BLOCKED');
});

test('block and unblock enforce validation and protect self', async () => {
  for (const [target, isBlocked, status] of [['invalid', true, 400], [id, 'true', 400], [id, true, 403]]) {
    const res = response();
    await setUserBlocked({ params: { id: target }, body: { isBlocked }, user: { _id: id } }, res);
    assert.equal(res.statusCode, status);
  }
});

test('blocking revokes refresh token and excludes admin targets; unblocking restores access flag', async () => {
  for (const blocked of [true, false]) {
    User.findOneAndUpdate = (filter, update) => {
      assert.deepEqual(filter.role, { $ne: 'admin' });
      assert.equal(update.$set.isBlocked, blocked);
      if (blocked) assert.equal(update.$set.refreshToken, null);
      return { select: () => ({ lean: async () => ({ _id: id, isBlocked: blocked }) }) };
    };
    const res = response();
    await setUserBlocked({ params: { id }, body: { isBlocked: blocked }, user: { _id: 'another-admin' } }, res);
    assert.equal(res.body.user.isBlocked, blocked);
  }
});

test('admin list includes editable FBR tokens but excludes login credentials', async () => {
  User.find = () => ({ select(fields) {
    assert.equal(fields, 'username email BusinessName role isBlocked FBRToken createdAt invoiceDate Address Province NTNCNIC');
    return { sort: () => ({ lean: async () => [{ email: 'test@example.com' }] }) };
  } });
  const res = response();
  await listUsers({}, res);
  assert.equal(res.body.users.length, 1);
});

test('user updates reject invalid, empty, or non-editable fields', async () => {
  User.findByIdAndUpdate = () => assert.fail('invalid update reached database');
  for (const body of [undefined, {}, { username: ' ' }, { email: 'invalid' }, { FBRToken: '' }, { role: 'owner' }, { password: 'changed' }, { isBlocked: true }, { BusinessName: 'changed' }, { Address: ' ' }, { Province: '' }, { NTNCNIC: 'invalid' }, { NTNCNIC: -1 }]) {
    const res = response();
    await updateUser({ params: { id }, body, user: { _id: 'another-admin' } }, res);
    assert.equal(res.statusCode, 400);
  }
  const res = response();
  await updateUser({ params: { id: 'invalid' }, body: { username: 'Name' } }, res);
  assert.equal(res.statusCode, 400);
});

test('administrators cannot demote themselves', async () => {
  const res = response();
  await updateUser({ params: { id }, body: { role: 'user' }, user: { _id: id } }, res);
  assert.equal(res.statusCode, 403);
});

test('updates save the four allowed fields and return the updated user', async () => {
  User.findOne = async (filter) => {
    assert.equal(filter._id.$ne, id);
    assert.equal(filter.email.$options, 'i');
    return null;
  };
  const fields = { username: 'Updated name', email: 'updated@example.com', FBRToken: 'new-token', role: 'admin' };
  User.findByIdAndUpdate = (target, update, options) => {
    assert.equal(target, id);
    assert.deepEqual(update, { $set: fields });
    assert.equal(options.runValidators, true);
    return { select: () => ({ lean: async () => ({ _id: id, ...fields }) }) };
  };
  const res = response();
  await updateUser({ params: { id }, body: { ...fields, username: ' Updated name ' }, user: { _id: id } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.username, fields.username);
});

test('updates report missing users and duplicate email conflicts', async () => {
  const req = { params: { id }, body: { email: 'updated@example.com' }, user: { _id: 'another-admin' } };
  User.findOne = async () => ({ _id: 'existing' });
  const duplicate = response();
  await updateUser(req, duplicate);
  assert.equal(duplicate.statusCode, 409);
  User.findOne = async () => null;
  User.findByIdAndUpdate = () => ({ select: () => ({ lean: async () => null }) });
  const missing = response();
  await updateUser(req, missing);
  assert.equal(missing.statusCode, 404);
  User.findByIdAndUpdate = () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); };
  const raced = response();
  await updateUser(req, raced);
  assert.equal(raced.statusCode, 409);
});

test('public signup ignores an injected admin role or account status', async () => {
  User.findOne = async () => null;
  User.create = async fields => {
    assert.equal(fields.role, undefined);
    assert.equal(fields.isBlocked, undefined);
    return { ...fields, _id: id };
  };
  const res = response();
  await Signup({ body: { NTNCNIC: 1234567, FBRToken: 'test', BusinessName: 'test', Province: 'Punjab', Address: 'test', email: 'test@example.com', username: 'test', password: 'password', newpassword: 'password', role: 'admin', isBlocked: false } }, res);
  assert.equal(res.statusCode, 201);
});


test('admin saves seller profile fields using existing user model names', async () => {
  User.findByIdAndUpdate = (target, update, options) => {
    assert.equal(target, id);
    assert.deepEqual(update.$set, { Address: 'Main Road', Province: 'Punjab', NTNCNIC: 1234567 });
    assert.equal(options.runValidators, true);
    return { select: () => ({ lean: async () => ({ _id: id, ...update.$set }) }) };
  };
  const res = response();
  await updateUser({ params: { id }, body: { Address: ' Main Road ', Province: 'Punjab', NTNCNIC: '1234567' }, user: { _id: 'another-admin' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.Address, 'Main Road');
});
