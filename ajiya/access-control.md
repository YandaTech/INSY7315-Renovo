<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Access-control

Goal: Staff sign in safely, sessions can be revoked, and only admins manage staff and prices

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0007 | backend | Rate-limit login | A test shows repeated failed logins from one IP get 429; normal login still works | - | - | 🟥 Pending |
| RN-0008 | backend | Session in an httpOnly cookie, with logout | Login sets an HttpOnly SameSite=Strict cookie, protected routes accept it, /auth/logout clears it; tests pass | RN-0007 | - | 🟥 Pending |
| RN-0009 | frontend | Dashboard uses the cookie session instead of localStorage | No token in localStorage; login, refresh and logout work against the backend; build and lint pass | RN-0008 | - | 🟥 Pending |
| RN-0010 | backend | Admin and staff roles, with deactivation that ends sessions | Tests show staff cannot add users or change prices, and a deactivated user's existing session is rejected at once | RN-0008 | - | 🟥 Pending |
| RN-0011 | frontend | Staff management page for admins | An admin can add staff, change a role and deactivate someone from the dashboard; staff do not see the page | RN-0009, RN-0010 | - | 🟥 Pending |
