import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const usePlaidApiContainer = () => {
  const [token, setToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

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
    setToken(data.access_token);
  }, []);

  const getTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await (await fetch("api/transactions")).json();
      console.log(response.transactionsResponse.transactions);
      setTransactions(response.transactionsResponse.transactions);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  return {
    hasToken: token !== null,
    generatePublicToken,
    transactions,
    loadingTransactions,
    getTransactions,
  };
};

export const {
  Provider: PlaidApiProvider,
  useContainer: usePlaidApi,
} = createContainer(usePlaidApiContainer);
