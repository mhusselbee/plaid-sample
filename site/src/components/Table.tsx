import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import currencyFormatter from "currency-formatter";
import React from "react";
import { usePlaidApi } from "../state";
import { useStyles } from "../state/useStyles";
import { LoadingSpinner } from "plaid-threads";

export const TransactionTable = ({ accountId }: { accountId: string }) => {
  const classes = useStyles();
  const { loadData } = usePlaidApi();
  const { transactions } = loadData();
  const relatedTransactions = transactions.filter(
    (t) => t.account_id === accountId
  );

  return transactions.length > 0 ? (
    <TableContainer component={Paper}>
      <Table
        className={classes.transactionTable}
        aria-label="transaction table"
      >
        <TableHead>
          <TableRow>
            <TableCell>Merchant</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {relatedTransactions.map((row: any) => (
            <TableRow key={row.transaction_id}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">
                {currencyFormatter.format(row.amount, { code: "USD" })}
              </TableCell>
              <TableCell align="right">
                {new Date(row.date).toDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <LoadingSpinner />
  );
};
