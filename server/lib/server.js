"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaidExpressServer = void 0;
// read env vars from .env file
require("dotenv").config();
const util = require("util");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const plaid = require("plaid");
const routes_1 = require("./routes");
// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
const prettyPrintResponse = (response) => {
    console.log(util.inspect(response, { colors: true, depth: 4 }));
};
const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = (_a = process.env.PLAID_CLIENT_ID) !== null && _a !== void 0 ? _a : "";
const PLAID_SECRET = (_b = process.env.PLAID_SECRET) !== null && _b !== void 0 ? _b : "";
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(",");
const client = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments[PLAID_ENV],
    options: {
        version: "2019-05-29",
    },
});
class PlaidExpressServer {
    constructor() {
        const app = express();
        app.use(bodyParser.urlencoded({
            extended: false,
        }));
        app.use(bodyParser.json());
        app.post(routes_1.routes.info, (request, response, next) => {
            response.json({
                item_id: ITEM_ID,
                access_token: ACCESS_TOKEN,
                products: PLAID_PRODUCTS,
            });
        });
        app.post(routes_1.routes.info, (request, response, next) => {
            response.json({
                item_id: ITEM_ID,
                access_token: ACCESS_TOKEN,
                products: PLAID_PRODUCTS,
            });
        });
        app.post(routes_1.routes.setToken, (request, response, next) => {
            PUBLIC_TOKEN = request.body.public_token;
            client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
                if (error != null) {
                    prettyPrintResponse(error);
                    return response.json({
                        error,
                    });
                }
                ACCESS_TOKEN = tokenResponse.access_token;
                ITEM_ID = tokenResponse.item_id;
                prettyPrintResponse(tokenResponse);
                response.json({
                    access_token: ACCESS_TOKEN,
                    item_id: ITEM_ID,
                    error: null,
                });
            });
        });
        // Retrieve Transactions for an Item
        app.get(routes_1.routes.transactions, (request, response, next) => {
            // Pull transactions for the Item for the last 30 days
            const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
            const endDate = moment().format("YYYY-MM-DD");
            client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
                count: 250,
                offset: 0,
            }, (error, transactionsResponse) => {
                if (error != null) {
                    prettyPrintResponse(error);
                    return response.json({
                        error,
                    });
                }
                else {
                    prettyPrintResponse(transactionsResponse);
                    return response.json({ transactionsResponse });
                }
            });
        });
        app.post(routes_1.routes.generatePublicToken, (request, response, next) => {
            client.sandboxPublicTokenCreate("ins_1", ["transactions"], (err, result) => {
                console.log(err);
                console.log(result);
                return response.json(result);
            });
        });
        app.post(routes_1.routes.listInstitutions, (request, response, next) => {
            client.getInstitutions(10, 0, { country_codes: ["US"] }, (err, result) => {
                if (err) {
                    return response.json({
                        err,
                    });
                }
                else {
                    return response.json({
                        result,
                    });
                }
            });
        });
        app.get(routes_1.routes.balance, (request, response, next) => {
            client.getBalance(ACCESS_TOKEN, function (error, balanceResponse) {
                if (error != null) {
                    prettyPrintResponse(error);
                    return response.json({
                        error,
                    });
                }
                prettyPrintResponse(balanceResponse);
                response.json(balanceResponse);
            });
        });
        app.get(routes_1.routes.accounts, (request, response, next) => {
            client.getAccounts(ACCESS_TOKEN, function (error, accountsResponse) {
                if (error != null) {
                    prettyPrintResponse(error);
                    return response.json({
                        error,
                    });
                }
                prettyPrintResponse(accountsResponse);
                response.json(accountsResponse);
            });
        });
        app.listen(APP_PORT, () => {
            console.log("plaid server listening on port " + APP_PORT);
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PlaidExpressServer();
        }
        return this.instance;
    }
}
exports.PlaidExpressServer = PlaidExpressServer;
