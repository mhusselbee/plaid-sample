import { plaidClient } from "./plaid-client";
import { PlaidExpressServer } from "./server";

PlaidExpressServer.construct(plaidClient);
PlaidExpressServer.start();
