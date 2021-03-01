import { LoadingSpinner } from "plaid-threads";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import React from "react";

export const Loading = () => {
  return (
    <div>
      <Card
        style={{
          backgroundColor: "#282c34",
          color: "#fff",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          alignContent: "center",
        }}
      >
        <CardContent>
          <Typography>Loading your accounts</Typography>
        </CardContent>
      </Card>
      <LoadingSpinner />
    </div>
  );
};
