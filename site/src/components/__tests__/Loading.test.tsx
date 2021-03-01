import { render } from "@testing-library/react";
import React from "react";
import { Loading } from "../Loading";

test("renders", () => {
  expect(render(<Loading />)).toMatchSnapshot();
});
