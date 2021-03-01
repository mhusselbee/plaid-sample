import { render } from "@testing-library/react";
import React from "react";
import { AccountCard } from "../Account";

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
  expect(render(<AccountCard />)).toMatchSnapshot();
});
