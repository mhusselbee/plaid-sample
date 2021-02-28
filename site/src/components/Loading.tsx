import React from "react";
import Loader from "react-loader-spinner";

export const Loading = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Loader type="ThreeDots" color="#fff" height="100" width="100" />
    </div>
  );
};
