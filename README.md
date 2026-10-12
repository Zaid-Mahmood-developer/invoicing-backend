# Billing_invoice


## Administrator access

Register an account using the existing signup screen, then run from the backend directory:

```sh
npm run make-admin -- existing-account@example.com
```

This uses the server's configured `MONGO_URI`; run it only for an account you intend to trust as an administrator. Sign in again after granting access. Public signup cannot assign the admin role. The signup screen's **Admin · Manage users** button opens admin sign-in; administrators also see **Users** in the navigation.

Admins can view all registered users and block/unblock regular accounts. Administrator accounts cannot be blocked from this screen. Blocking is checked during login, session refresh and every authorized API request, and revokes the stored refresh token. Existing `BLOCKED_EMAILS` payment restrictions remain separate and must be removed from server configuration when appropriate.

Alternatively, set `ADMIN_EMAIL` to the registered account email in the backend `.env` and run `npm run make-admin` without an argument. Setting the variable alone does not change account permissions.
