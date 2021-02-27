// read env vars from .env file
require("dotenv").config();

const util = require("util");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const plaid = require("plaid");

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(
  ","
);

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
  ","
);

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
// The payment_id is only relevant for the UK Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store
let PAYMENT_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
const client = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments[PLAID_ENV],
  options: {
    version: "2019-05-29",
  },
});

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.post("/api/info", function (request, response, next) {
  response.json({
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN,
    products: PLAID_PRODUCTS,
  });
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post("/api/set_access_token", function (request, response, next) {
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

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get("/api/accounts", function (request, response, next) {
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

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get("/api/transactions", function (request, response, next) {
  // Pull transactions for the Item for the last 30 days
  const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");
  client.getTransactions(
    ACCESS_TOKEN,
    startDate,
    endDate,
    {
      count: 250,
      offset: 0,
    },
    function (error, transactionsResponse) {
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

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get("/api/identity", function (request, response, next) {
  client.getIdentity(ACCESS_TOKEN, function (error, identityResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error,
      });
    }
    prettyPrintResponse(identityResponse);
    response.json({ identity: identityResponse.accounts });
  });
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get("/api/balance", function (request, response, next) {
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

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get("/api/item", function (request, response, next) {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  client.getItem(ACCESS_TOKEN, function (error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error,
      });
    }
    // Also pull information about the institution
    client.getInstitutionById(
      itemResponse.item.institution_id,
      function (err, instRes) {
        if (err != null) {
          const msg =
            "Unable to pull institution information from the Plaid API.";
          console.log(msg + "\n" + JSON.stringify(error));
          return response.json({
            error: msg,
          });
        } else {
          prettyPrintResponse(itemResponse);
          response.json({
            item: itemResponse.item,
            institution: instRes.institution,
          });
        }
      }
    );
  });
});

app.post("/api/generate_public_token", function (request, response, next) {
  client.sandboxPublicTokenCreate("ins_1", ["transactions"], (err, result) => {
    console.log(err);
    console.log(result);
    return response.json(result);
  });
});

app.post("/api/list_institutions", function (request, response, next) {
  client.getInstitutions(10, 0, { country_codes: ["US"] }, (err, result) => {
    if (err) {
      return response.json({
        err,
      });
    } else {
      return response.json({
        result,
      });
    }
  });
});

const server = app.listen(APP_PORT, function () {
  console.log("plaid-quickstart server listening on port " + APP_PORT);
});

const prettyPrintResponse = (response) => {
  console.log(util.inspect(response, { colors: true, depth: 4 }));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
const respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: "Timed out when polling for Asset Report",
    });
  }

  const includeInsights = false;
  client.getAssetReport(
    assetReportToken,
    includeInsights,
    function (error, assetReportGetResponse) {
      if (error != null) {
        prettyPrintResponse(error);
        if (error.error_code == "PRODUCT_NOT_READY") {
          setTimeout(
            () =>
              respondWithAssetReport(
                --numRetriesRemaining,
                assetReportToken,
                client,
                response
              ),
            1000
          );
          return;
        }

        return response.json({
          error,
        });
      }

      client.getAssetReportPdf(
        assetReportToken,
        function (error, assetReportGetPdfResponse) {
          if (error != null) {
            return response.json({
              error,
            });
          }

          response.json({
            error: null,
            json: assetReportGetResponse.report,
            pdf: assetReportGetPdfResponse.buffer.toString("base64"),
          });
        }
      );
    }
  );
};
