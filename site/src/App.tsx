import React from "react";
import "./App.css";
import logo from "./logo.svg";
import { PlaidApiProvider, usePlaidApi } from "./state";

const App = () => {
  const { generatePublicToken, getTransactions } = usePlaidApi();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={generatePublicToken}> Generate Token </button>
        <button onClick={getTransactions}> Log Transactions </button>
      </header>
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
