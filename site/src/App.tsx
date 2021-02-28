import React, { useEffect } from "react";
import "./App.css";
import { Loading } from "./components/Loading";
import { TransactionTable } from "./components/Table";
import { PlaidApiProvider, usePlaidApi } from "./state";

const App = () => {
  const {
    hasToken,
    generatePublicToken,
    getTransactions,
    loadingTransactions,
  } = usePlaidApi();

  useEffect(() => {
    if (!hasToken) {
      generatePublicToken()
        .then(() => {
          getTransactions().catch(console.log);
        })
        .catch(console.log);
    }
  }, [hasToken, generatePublicToken, getTransactions]);

  return (
    <div className="App">
      <div className="App-header">
        {loadingTransactions || !hasToken ? <Loading /> : <TransactionTable />}
      </div>
    </div>
  );
};

const AppWithState = () => {
  return (
    <PlaidApiProvider>
      <App />
    </PlaidApiProvider>
  );
};

export default AppWithState;
