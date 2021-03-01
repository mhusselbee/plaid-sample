"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaidExpressServer = void 0;
// read env vars from .env file
require("dotenv").config();
const util = require("util");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const plaid_client_1 = require("./plaid-client");
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
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(",");
class PlaidExpressServer {
    constructor(client) {
        this.plaidClient = null;
        this.app = null;
        this.plaidClient = client;
        this.app = this.configure();
        this.start(this.app);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PlaidExpressServer(plaid_client_1.plaidClient);
        }
        return this.instance;
    }
    start(app) {
        app.listen(APP_PORT, () => {
            console.log("plaid server listening on port " + APP_PORT);
        });
    }
    stop() {
        process.exit(0);
    }
    configure() {
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
            this.plaidClient.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
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
            this.plaidClient.getTransactions(ACCESS_TOKEN, startDate, endDate, {
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
            this.plaidClient.sandboxPublicTokenCreate("ins_1", ["transactions"], (err, result) => {
                return response.json(result);
            });
        });
        app.post(routes_1.routes.listInstitutions, (request, response, next) => {
            this.plaidClient.getInstitutions(10, 0, { country_codes: ["US"] }, (err, result) => {
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
            this.plaidClient.getBalance(ACCESS_TOKEN, function (error, balanceResponse) {
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
            this.plaidClient.getAccounts(ACCESS_TOKEN, function (error, accountsResponse) {
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
        return app;
    }
}
exports.PlaidExpressServer = PlaidExpressServer;
