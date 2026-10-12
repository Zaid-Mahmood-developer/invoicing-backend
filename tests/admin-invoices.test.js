import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import SalesInvoice from '../models/saleInvoice.model.js';
import { User } from '../models/user.model.js';
import { listUserInvoices, updateUserInvoice } from '../controllers/admin.controller.js';
const original = { find: SalesInvoice.find, findOneAndUpdate: SalesInvoice.findOneAndUpdate };
const exists = User.exists;
afterEach(() => { Object.assign(SalesInvoice, original); User.exists = exists; });
const id = '507f1f77bcf86cd799439011';
const invoiceId = '507f1f77bcf86cd799439012';
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
test('list invoices is scoped to selected user and excludes tokens', async () => {
  User.exists = async () => true;
  SalesInvoice.find = (filter) => {
    assert.deepEqual(filter, { userId: id });
    return { select(fields) {
      assert.ok(!fields.includes('FBRToken'));
      return { sort: () => ({ lean: async () => [{ _id: invoiceId }] }) };
    } };
  };
  const res = response();
  await listUserInvoices({ params: { id } }, res);
  assert.equal(res.body.invoices.length, 1);
});
test('invoice updates validate dates and reject unexpected fields', async () => {
  SalesInvoice.findOneAndUpdate = () => assert.fail('invalid body reached database');
  for (const body of [undefined, {}, { userId: id }, { grandTotal: 12 }, { invoiceDate: '2026-02-30' }, { invoiceDate: '12/10/2026' }, { invoiceDate: '' }, { invoiceNo: 12 }]) {
    const res = response();
    await updateUserInvoice({ params: { id, invoiceId }, body }, res);
    assert.equal(res.statusCode, 400);
  }
});
test('invoice update uses ownership filter and returns saved fields', async () => {
  const body = { invoiceDate: '2026-10-12', invoiceNo: 'INV-12', dcNo: '', sellerAddress: '123 Main Street', sellerProvince: 'Punjab', sellerNTNCNIC: '0012345' };
  SalesInvoice.findOneAndUpdate = (filter, update, options) => {
    assert.deepEqual(filter, { _id: invoiceId, userId: id });
    assert.deepEqual(update, { $set: body });
    assert.equal(options.runValidators, true);
    return { select: () => ({ lean: async () => ({ _id: invoiceId, ...body }) }) };
  };
  const res = response();
  await updateUserInvoice({ params: { id, invoiceId }, body }, res);
  assert.deepEqual(res.body.invoice, { _id: invoiceId, ...body });
});
test('missing or other-user invoices return not found', async () => {
  SalesInvoice.findOneAndUpdate = () => ({ select: () => ({ lean: async () => null }) });
  const res = response();
  await updateUserInvoice({ params: { id, invoiceId }, body: { dcNo: 'DC-1' } }, res);
  assert.equal(res.statusCode, 404);
});
test('invalid identifiers and missing users are rejected', async () => {
  const invalid = response();
  await updateUserInvoice({ params: { id, invoiceId: 'invalid' }, body: { dcNo: '' } }, invalid);
  assert.equal(invalid.statusCode, 400);
  User.exists = async () => null;
  const missing = response();
  await listUserInvoices({ params: { id } }, missing);
  assert.equal(missing.statusCode, 404);
});

test('seller fields reject empty, null, and non-string values', async () => {
  SalesInvoice.findOneAndUpdate = () => assert.fail('invalid seller fields reached database');
  for (const field of ['sellerAddress', 'sellerProvince', 'sellerNTNCNIC']) {
    for (const value of ['', '   ', null, 123, {}, []]) {
      const res = response();
      await updateUserInvoice({ params: { id, invoiceId }, body: { [field]: value } }, res);
      assert.equal(res.statusCode, 400);
    }
  }
});
