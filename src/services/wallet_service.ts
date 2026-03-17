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

    const [firstId, secondId] =
      senderId < recipientId
        ? [senderId, recipientId]
        : [recipientId, senderId];

    await getWalletWithLock(client, firstId);
    await getWalletWithLock(client, secondId);

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
    throw new Error(`Sender wallet ${id} not found`);
  }
  return parseFloat(res.rows[0].balance);
}

async function updateBalance(client: PoolClient, id: number, amount: number) {
  await client.query("UPDATE wallets SET balance = balance + $1 WHERE id=$2 RETURNING balance", [
    amount,
    id,
  ]);
}

async function recordTransaction(
  client: PoolClient,
  senderId: number | null,
  recipientId: number | null,
  amount: number,
  type: TransactionType = TransactionType.TRANSFER,
) {
  return client.query(
    "INSERT INTO transactions (sender_wallet_id, receiver_wallet_id,amount,type) VALUES($1, $2, $3, $4) RETURNING id",
    [senderId, recipientId, amount, type],
  );
}

export const depositFunds = async (
  walletId: number,
  amount: number
) => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    await getWalletWithLock(client, walletId);

    const newBalance = await updateBalance(client, walletId, amount);

    const txn = await recordTransaction(
      client,
      null, 
      walletId,
      amount,
      TransactionType.DEPOSIT
    );

    await client.query("COMMIT");

    return {
      message: "Deposit successful",
      transactionId: txn.rows[0].id,
      walletId,
      amount,
      balance: newBalance,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const withdrawFunds = async (
  walletId: number,
  amount: number
) => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const balance = await getWalletWithLock(client, walletId);

    if (balance < amount) {
      throw new Error("Insufficient funds");
    }

    const newBalance = await updateBalance(client, walletId, -amount);

    const txn = await recordTransaction(
      client,
      walletId,
      null,
      amount,
      TransactionType.WITHDRAWAL
    );

    await client.query("COMMIT");

    return {
      message: "Withdrawal successful",
      transactionId: txn.rows[0].id,
      walletId,
      amount,
      balance: newBalance,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};