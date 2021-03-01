"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.plaidClient = void 0;
// read env vars from .env file
require("dotenv").config();
const plaid = require("plaid");
const PLAID_CLIENT_ID = (_a = process.env.PLAID_CLIENT_ID) !== null && _a !== void 0 ? _a : "";
const PLAID_SECRET = (_b = process.env.PLAID_SECRET) !== null && _b !== void 0 ? _b : "";
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
exports.plaidClient = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments[PLAID_ENV],
    options: {
        version: "2019-05-29",
    },
});
