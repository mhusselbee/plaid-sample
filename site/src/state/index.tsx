import {
  AccountBase,
  AccountsGetResponse,
  Transaction,
  TransactionsGetResponse,
} from "plaid/dist/api.d";
import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const usePlaidApiContainer = () => {
  const [loading, setLoading] = useState(true);

  const generatePublicToken = useCallback(async () => {
    const response = await fetch("api/generate_public_token", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    const token = await response.json();
    console.log(token);
    const access_response = await fetch("/api/set_access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: `public_token=${token.public_token}`,
    });

    const data = await access_response.json();
    console.log(data);
  }, []);

  const fetchTransactions = async () => {
    try {
      const response: {
        transactionsResponse: TransactionsGetResponse;
      } = await (await fetch("api/transactions")).json();
      console.log(response.transactionsResponse.transactions);
      localStorage.setItem(
        "transactions",
        JSON.stringify(response.transactionsResponse.transactions)
      );
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const fetchAccounts = async () => {
    try {
      const response: AccountsGetResponse = await (
        await fetch("api/accounts")
      ).json();
      console.log(response.accounts);
      localStorage.setItem("accounts", JSON.stringify(response.accounts));
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const fetchData = async () => {
    setLoading(true);
    localStorage.removeItem("accounts");
    localStorage.removeItem("transactions");
    await generatePublicToken();
    await fetchAccounts();
    await fetchTransactions();
    setLoading(false);
  };

  const loadData = () => {
    const accounts: AccountBase[] = JSON.parse(
      localStorage.getItem("accounts")!
    );
    const transactions: Transaction[] = JSON.parse(
      localStorage.getItem("transactions")!
    );
    return { accounts, transactions };
  };

  return {
    generatePublicToken,
    fetchData,
    loadData,
    loading,
  };
};

export const {
  Provider: PlaidApiProvider,
  useContainer: usePlaidApi,
} = createContainer(usePlaidApiContainer);
