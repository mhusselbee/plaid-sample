// read env vars from .env file
require("dotenv").config();
import util = require("util");
import express = require("express");
import bodyParser = require("body-parser");
import moment = require("moment");
import plaid = require("plaid");
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
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID ?? "";
const PLAID_SECRET = process.env.PLAID_SECRET ?? "";
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(
  ","
);

const client = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments[PLAID_ENV],
  options: {
    version: "2019-05-29",
  },
});

export class PlaidExpressServer {
  private static instance: PlaidExpressServer;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new PlaidExpressServer();
    }
    return this.instance;
  }

  constructor() {
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
      client.exchangePublicToken(
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
      client.getTransactions(
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
      client.sandboxPublicTokenCreate(
        "ins_1",
        ["transactions"],
        (err: Error, result: GeneratePublicTokenResponse) => {
          console.log(err);
          console.log(result);
          return response.json(result);
        }
      );
    });

    app.post(routes.listInstitutions, (request, response, next) => {
      client.getInstitutions(
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
  }
}