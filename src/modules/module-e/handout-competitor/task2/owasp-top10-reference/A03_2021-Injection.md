# A03:2021 – Injection

## Overview

Injection slides down to the third position. 94% of the applications
were tested for some form of injection with a max incidence rate of 19%, an average incidence rate of 3%, and 274k occurrences. Notable Common Weakness Enumerations (CWEs) included are
*CWE-79: Cross-site Scripting*, *CWE-89: SQL Injection*, and *CWE-73:
External Control of File Name or Path*.

## Description

An application is vulnerable to attack when:

-   User-supplied data is not validated, filtered, or sanitized by the
    application.

-   Dynamic queries or non-parameterized calls without context-aware
    escaping are used directly in the interpreter.

-   Hostile data is used within object-relational mapping (ORM) search
    parameters to extract additional, sensitive records.

-   Hostile data is directly used or concatenated. The SQL or command
    contains the structure and malicious data in dynamic queries,
    commands, or stored procedures.

Some of the more common injections are SQL, NoSQL, OS command, Object
Relational Mapping (ORM), LDAP, and Expression Language (EL) or Object
Graph Navigation Library (OGNL) injection. The concept is identical
among all interpreters. Source code review is the best method of
detecting if applications are vulnerable to injections. Automated
testing of all parameters, headers, URL, cookies, JSON, SOAP, and XML
data inputs is strongly encouraged. Organizations can include
static (SAST), dynamic (DAST), and interactive (IAST) application security testing tools into the CI/CD
pipeline to identify introduced injection flaws before production
deployment.

## How to Prevent

Preventing injection requires keeping data separate from commands and queries:

-   The preferred option is to use a safe API, which avoids using the
    interpreter entirely, provides a parameterized interface, or
    migrates to Object Relational Mapping Tools (ORMs).<br/>
    **Note:** Even when parameterized, stored procedures can still introduce
    SQL injection if PL/SQL or T-SQL concatenates queries and data or
    executes hostile data with EXECUTE IMMEDIATE or exec().

-   Use positive server-side input validation. This is
    not a complete defense as many applications require special
    characters, such as text areas or APIs for mobile applications.

-   For any residual dynamic queries, escape special characters using
    the specific escape syntax for that interpreter.<br/>
    **Note:** SQL structures such as table names, column names, and so on
    cannot be escaped, and thus user-supplied structure names are
    dangerous. This is a common issue in report-writing software.

## Example Attack Scenarios

**Scenario #1:** An application uses untrusted data in the construction
of the following vulnerable SQL call:
```
String query = "SELECT \* FROM accounts WHERE custID='" + request.getParameter("id") + "'";
```

**Scenario #2:** Similarly, an application’s blind trust in frameworks
may result in queries that are still vulnerable, (e.g., Hibernate Query
Language (HQL)):
```
 Query HQLQuery = session.createQuery("FROM accounts WHERE custID='" + request.getParameter("id") + "'");
```

In both cases, the attacker modifies the ‘id’ parameter value in their
browser to send: ' UNION SLEEP(10);--. For example:
```
 http://example.com/app/accountView?id=' UNION SELECT SLEEP(10);--
```

This changes the meaning of both queries to return all the records from
the accounts table. More dangerous attacks could modify or delete data
or even invoke stored procedures.
