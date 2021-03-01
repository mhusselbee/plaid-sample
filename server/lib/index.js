"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plaid_client_1 = require("./plaid-client");
const server_1 = require("./server");
server_1.PlaidExpressServer.construct(plaid_client_1.plaidClient);
server_1.PlaidExpressServer.start();
