// read env vars from .env file
require("dotenv").config();
import util = require("util");
import express = require("express");
import { Express } from "express";
import bodyParser = require("body-parser");
import moment = require("moment");
import plaid = require("plaid");
import { plaidClient } from "./plaid-client";
import { routes } from "./routes";
import { GeneratePublicTokenResponse } from "./types";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN: string | null = null;
let PUBLIC_TOKEN: string | null = null;
let ITEM_ID: string | null = null;

const prettyPrintResponse = (response: any) => {
  console.log(util.inspect(response, { colors: true, depth: 4 }));
};

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(
  ","
);

export class PlaidExpressServer {
  private static instance: PlaidExpressServer;
  private plaidClient: plaid.Client | null = null;
  public app: Express | null = null;

  constructor(client: plaid.Client) {
    this.plaidClient = client;
    this.app = this.configure();
    this.start(this.app);
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new PlaidExpressServer(plaidClient);
    }
    return this.instance;
  }

  private start(app: Express) {
    app.listen(APP_PORT, () => {
      console.log("plaid server listening on port " + APP_PORT);
    });
  }

  public stop() {
    process.exit(0);
  }

  private configure() {
    const app = express();

    app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );

    app.use(bodyParser.json());

    app.post(routes.info, (request, response, next) => {
      response.json({
        item_id: ITEM_ID,
        access_token: ACCESS_TOKEN!,
        products: PLAID_PRODUCTS,
      });
    });

    app.post(routes.info, (request, response, next) => {
      response.json({
        item_id: ITEM_ID!,
        access_token: ACCESS_TOKEN!,
        products: PLAID_PRODUCTS,
      });
    });

    app.post(routes.setToken, (request, response, next) => {
      PUBLIC_TOKEN = request.body.public_token;
      this.plaidClient!.exchangePublicToken(
        PUBLIC_TOKEN!,
        function (error, tokenResponse) {
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
        }
      );
    });

    // Retrieve Transactions for an Item
    app.get(routes.transactions, (request, response, next) => {
      // Pull transactions for the Item for the last 30 days
      const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
      const endDate = moment().format("YYYY-MM-DD");
      this.plaidClient!.getTransactions(
        ACCESS_TOKEN!,
        startDate,
        endDate,
        {
          count: 250,
          offset: 0,
        },
        (error, transactionsResponse) => {
          if (error != null) {
            prettyPrintResponse(error);
            return response.json({
              error,
            });
          } else {
            prettyPrintResponse(transactionsResponse);
            return response.json({ transactionsResponse });
          }
        }
      );
    });

    app.post(routes.generatePublicToken, (request, response, next) => {
      this.plaidClient!.sandboxPublicTokenCreate(
        "ins_1",
        ["transactions"],
        (err: Error, result: GeneratePublicTokenResponse) => {
          return response.json(result);
        }
      );
    });

    app.post(routes.listInstitutions, (request, response, next) => {
      this.plaidClient!.getInstitutions(
        10,
        0,
        { country_codes: ["US"] },
        (err, result) => {
          if (err) {
            return response.json({
              err,
            });
          } else {
            return response.json({
              result,
            });
          }
        }
      );
    });

    app.get(routes.balance, (request, response, next) => {
      this.plaidClient!.getBalance(
        ACCESS_TOKEN!,
        function (error, balanceResponse) {
          if (error != null) {
            prettyPrintResponse(error);
            return response.json({
              error,
            });
          }
          prettyPrintResponse(balanceResponse);
          response.json(balanceResponse);
        }
      );
    });

    app.get(routes.accounts, (request, response, next) => {
      this.plaidClient!.getAccounts(
        ACCESS_TOKEN!,
        function (error, accountsResponse) {
          if (error != null) {
            prettyPrintResponse(error);
            return response.json({
              error,
            });
          }
          prettyPrintResponse(accountsResponse);
          response.json(accountsResponse);
        }
      );
    });

    return app;
  }
}
