// read env vars from .env file
require("dotenv").config();
import plaid = require("plaid");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID ?? "";
const PLAID_SECRET = process.env.PLAID_SECRET ?? "";
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

export const plaidClient = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments[PLAID_ENV],
  options: {
    version: "2019-05-29",
  },
});
