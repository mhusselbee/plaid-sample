import { render } from "@testing-library/react";
import React from "react";
import { TransactionTable } from "../Table";

jest.mock("../../state/", () => {
  return {
    usePlaidApi: () => {
      return {
        loadData: () => {
          return {
            accounts: [],
            transactions: [],
          };
        },
      };
    },
  };
});

test("renders", () => {
  expect(render(<TransactionTable accountId={""} />)).toMatchSnapshot();
});
