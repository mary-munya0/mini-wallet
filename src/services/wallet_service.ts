import type { PoolClient } from "pg";
import { getClient } from "../config/db.js";
import { TransactionType } from "../enums/transaction_enum.js";

export interface TransactionResult {
  message: string;
  transactionId: string;
}

export const transferFunds = async (
  senderId: number,
  recipientId: number,
  amount: number,
): Promise<TransactionResult> => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  if (senderId === recipientId) {
    throw new Error("Cannot transfer to the same wallet");
  }

  const client: PoolClient = await getClient();

  try {
    await client.query("BEGIN");

    const senderBalance = await getWalletWithLock(client, senderId);

    if (senderBalance < amount) {
      throw new Error("Insufficient funds");
    }

    await getWalletWithLock(client, recipientId);

    await updateBalance(client, senderId, -amount);
    await updateBalance(client, recipientId, amount);
    const txn = await recordTransaction(client, senderId, recipientId, amount);

    await client.query("COMMIT");

    return {
      message: "Transfer completed successfully",
      transactionId: txn.rows[0].id,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

async function getWalletWithLock(client: PoolClient, id: number) {
  const res = await client.query(
    "SELECT * FROM wallets WHERE ID =$1 FOR UPDATE",
    [id],
  );
  if (res.rowCount === 0) {
    throw new Error(`Wallet ${id} not found`);
  }
  return parseFloat(res.rows[0].balance);
}

async function updateBalance(client: PoolClient, id: number, amount: number) {
  await client.query("UPDATE wallets SET balance = balance + $1 WHERE id=$2", [
    amount,
    id,
  ]);
}

async function recordTransaction(
  client: PoolClient,
  senderId: number,
  recipientId: number,
  amount: number,
  type: TransactionType = TransactionType.TRANSFER,
) {
  return client.query(
    "INSERT INTO transactions (sender_wallet_id, receiver_wallet_id,amount,type) VALUES($1, $2, $3, $4) RETURNING id",
    [senderId, recipientId, amount, type],
  );
}
