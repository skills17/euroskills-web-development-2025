# Handout Module C

## External Turbine API Integration

The API base URL is:

```
http://<your-subdomain>-external-turbine-api.tp.es2025.skill17.com
```

Example:

```
http://asdfg-external-turbine-api.tp.es2025.skill17.com
```

The bearer token is:

```
SECRET_TOKEN_123
```

The control panel URL that you can open in your browser:

```
http://<your-subdomain>-external-turbine-api.tp.es2025.skill17.com/control
```

Note: There is a **.tp.** in the domain name (which is different from the module URL).

Check that you can reach it by opening it in your browser.

## Timeout Handling

For handling external API timeouts, you must implement request aborting if it takes longer than **3 seconds**.

## Tests

You can find an API integration test suite attached.

### Running Tests with Jest

First, you have to tell it where your API and the mock API are located. 

You can do this by setting the environment variables `TEST_BASE_URL` and `TEST_MOCK_URL` in the `.env` file.

```
TEST_BASE_URL="http://<your-subdomain>-module-c.es2025.skill17.com"
TEST_MOCK_URL="http://<your-subdomain>-external-turbine-api.tp.es2025.skill17.com"
```

## 🔹 Quick Version (for people who know Jest)

```bash
npm install
npm test
```

### 🔹 Full Version (Step-by-Step)

1. Install dependencies

```bash
npm install
```

2. Run all tests

```bash
npm test
```

3. Run a specific test file

```bash
npm test -- tests/01_organization.test.js
```

4. Run a specific test case inside a test file

```bash
npm test -- tests/01_organization.test.js -t "test name"
```

Notes:

- It is strongly advised to run tests using the `npm test` command, as it sets the `--runInBand` flag, which is crucial
  as the tests depend on setting and resetting the external API mock state.
