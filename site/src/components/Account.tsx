import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import currencyFormatter from "currency-formatter";
import { AccountBase } from "plaid";
import React, { useEffect } from "react";
import { usePlaidApi } from "../state";
import { useStyles } from "../state/useStyles";
import { TransactionTable } from "./Table";
import { Loading } from "./Loading";

export const AccountCard = () => {
  const classes = useStyles();
  const { fetchData, loadData } = usePlaidApi();
  const { accounts } = loadData();

  useEffect(() => {
    if (!accounts) {
      fetchData();
    }
  }, [accounts, fetchData]);

  return accounts ? (
    <div className="Accounts">
      {accounts?.map((account: AccountBase) => (
        <div className="Transactions">
          <Card>
            <>
              <CardContent>
                <Typography variant="h5" align="left">
                  {account.name}
                </Typography>
                <Typography
                  className={classes.pos}
                  color="textSecondary"
                  align="left"
                >
                  {account.type}
                </Typography>
                {account.balances.available && (
                  <Typography className={classes.pos} align="right">
                    Available balance:{" "}
                    {currencyFormatter.format(account.balances.available, {
                      code: "USD",
                    })}
                  </Typography>
                )}
                {account.balances.current && (
                  <Typography className={classes.pos} align="right">
                    Current balance:{" "}
                    {currencyFormatter.format(account.balances.current, {
                      code: "USD",
                    })}
                  </Typography>
                )}
              </CardContent>
            </>
            <TransactionTable accountId={account.account_id} />
          </Card>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};
