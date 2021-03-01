import React from "react";
import "./App.css";
import { AccountCard } from "./components/Account";
import { PlaidApiProvider } from "./state";

const App = () => {
  return (
    <div className="App">
      <AccountCard />
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
