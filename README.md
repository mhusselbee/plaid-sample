# Plaid Sample

## Getting Started
----

### Plaid Server
Create a file named `.env` in the `server` directory and add the following text
```
PLAID_CLIENT_ID=<client_id>
PLAID_SECRET=<secret>
PLAID_ENV=sandbox
PLAID_PRODUCTS=transactions
PLAID_COUNTRY_CODES=US,CA
```
Be sure to replace the client id and secret

To start the server run:

`cd server && npm install && npm run build && npm start` 

#### Tests
`npm run test`

----

### Website
To start the website
Run `cd npm install && npm start`

#### Tests
`npm run test`


### TODOs:
 - Server
   - Better unit tests; test logic
   - Clean up plaid client implementation
   - Add GraphQL server
 - Front End
   - Add assertions to snapshot tests
   - Use data for snapshots
   - Add GraphQL client