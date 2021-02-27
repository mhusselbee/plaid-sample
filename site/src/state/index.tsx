import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const usePlaidApiContainer = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token") ?? null
  );

  const generatePublicToken = useCallback(async () => {
    if (token === null) {
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
      localStorage.setItem("access_token", JSON.stringify(data));
      setToken(data.access_token);
    }
  }, [token]);

  const getInstitutions = async () => {
    const institutions = await fetch("api/institutions", {});
    console.log(JSON.stringify(institutions, undefined, 2));
  };

  const getTransactions = async () => {
    const transactions = await (await fetch("api/transactions")).json();
    console.log(transactions);
  };

  return {
    linkToken: token,
    generatePublicToken,
    getInstitutions,
    getTransactions,
  };
};

export const {
  Provider: PlaidApiProvider,
  useContainer: usePlaidApi,
} = createContainer(usePlaidApiContainer);
