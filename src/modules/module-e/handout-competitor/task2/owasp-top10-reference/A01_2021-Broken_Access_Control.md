# A01:2021 – Broken Access Control

## Overview

Moving up from the fifth position, 94% of applications were tested for
some form of broken access control with the average incidence rate of 3.81%, and has the most occurrences in the contributed dataset with over 318k. Notable Common Weakness Enumerations (CWEs) included are *CWE-200: Exposure of Sensitive Information to an Unauthorized Actor*, *CWE-201:
Insertion of Sensitive Information Into Sent Data*, and *CWE-352:
Cross-Site Request Forgery*.

## Description

Access control enforces policy such that users cannot act outside of
their intended permissions. Failures typically lead to unauthorized
information disclosure, modification, or destruction of all data or
performing a business function outside the user's limits. Common access
control vulnerabilities include:

-   Violation of the principle of least privilege or deny by default,
    where access should only be granted for particular capabilities,
    roles, or users, but is available to anyone.

-   Bypassing access control checks by modifying the URL (parameter
    tampering or force browsing), internal application state, or the
    HTML page, or by using an attack tool modifying API requests.

-   Permitting viewing or editing someone else's account, by providing
    its unique identifier (insecure direct object references)

-   Accessing API with missing access controls for POST, PUT and DELETE.

-   Elevation of privilege. Acting as a user without being logged in or
    acting as an admin when logged in as a user.

-   Metadata manipulation, such as replaying or tampering with a JSON
    Web Token (JWT) access control token, or a cookie or hidden field
    manipulated to elevate privileges or abusing JWT invalidation.

-   CORS misconfiguration allows API access from unauthorized/untrusted
    origins.

-   Force browsing to authenticated pages as an unauthenticated user or
    to privileged pages as a standard user.

## How to Prevent

Access control is only effective in trusted server-side code or
server-less API, where the attacker cannot modify the access control
check or metadata.

-   Except for public resources, deny by default.

-   Implement access control mechanisms once and re-use them throughout
    the application, including minimizing Cross-Origin Resource Sharing (CORS) usage.

-   Model access controls should enforce record ownership rather than
    accepting that the user can create, read, update, or delete any
    record.

-   Unique application business limit requirements should be enforced by
    domain models.

-   Disable web server directory listing and ensure file metadata (e.g.,
    .git) and backup files are not present within web roots.

-   Log access control failures, alert admins when appropriate (e.g.,
    repeated failures).

-   Rate limit API and controller access to minimize the harm from
    automated attack tooling.

-   Stateful session identifiers should be invalidated on the server after logout.
    Stateless JWT tokens should rather be short-lived so that the window of
    opportunity for an attacker is minimized. For longer lived JWTs it's highly recommended to
    follow the OAuth standards to revoke access.

Developers and QA staff should include functional access control unit
and integration tests.

## Example Attack Scenarios

**Scenario #1:** The application uses unverified data in a SQL call that
is accessing account information:

```
 pstmt.setString(1, request.getParameter("acct"));
 ResultSet results = pstmt.executeQuery( );
```

An attacker simply modifies the browser's 'acct' parameter to send
whatever account number they want. If not correctly verified, the
attacker can access any user's account.

```
 https://example.com/app/accountInfo?acct=notmyacct
```

**Scenario #2:** An attacker simply force browses to target URLs. Admin
rights are required for access to the admin page.

```
 https://example.com/app/getappInfo
 https://example.com/app/admin_getappInfo
```
If an unauthenticated user can access either page, it's a flaw. If a
non-admin can access the admin page, this is a flaw.
