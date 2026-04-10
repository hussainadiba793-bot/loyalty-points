"use client";

import { Networks, rpc, TransactionBuilder, Address } from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
  setAllowed,
  isAllowed,
  requestAccess,
} from "@stellar/freighter-api";
import { Contract, xdr } from "@stellar/stellar-sdk";

// ============================================================
// CONSTANTS — Updated for Loyalty Token Contract
// ============================================================

/** Your deployed Soroban contract ID */
export const CONTRACT_ADDRESS =
  "CDPLYQP7QTYGYVQLEA7RQYY3GVAI423QG5PZP7DVUZVPVCLPGQORJ2XU";

/** Network passphrase (testnet by default) */
export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** Soroban RPC URL */
export const RPC_URL = "https://soroban-testnet.stellar.org";

/** Horizon URL */
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

/** Network name for Freighter */
export const NETWORK = "TESTNET";

// ============================================================
// RPC Server Instance
// ============================================================

const server = new rpc.Server(RPC_URL);

// ============================================================
// Wallet Helpers
// ============================================================

export async function checkConnection(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function connectWallet(): Promise<string> {
  const connResult = await isConnected();
  if (!connResult.isConnected) {
    throw new Error("Freighter extension is not installed or not available.");
  }

  const allowedResult = await isAllowed();
  if (!allowedResult.isAllowed) {
    await setAllowed();
    await requestAccess();
  }

  const { address } = await getAddress();
  if (!address) {
    throw new Error("Could not retrieve wallet address from Freighter.");
  }
  return address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connResult = await isConnected();
    if (!connResult.isConnected) return null;

    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) return null;

    const { address } = await getAddress();
    return address || null;
  } catch {
    return null;
  }
}

// ============================================================
// Contract Interaction Helpers
// ============================================================

/**
 * Build, simulate, and sign + submit a Soroban contract call.
 */
export async function callContract(
  method: string,
  params: xdr.ScVal[],
  caller: string
): Promise<rpc.Api.GetTransactionResponse> {
  const contract = new Contract(CONTRACT_ADDRESS);
  const account = await server.getAccount(caller);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${(simulated as rpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  // Prepare the transaction with the simulation result
  const prepared = rpc.assembleTransaction(tx, simulated).build();

  // Sign with Freighter
  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const txToSubmit = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(txToSubmit);

  if (result.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${result.status}`);
  }

  // Poll for confirmation
  let getResult = await server.getTransaction(result.hash);
  while (getResult.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResult = await server.getTransaction(result.hash);
  }

  if (getResult.status === "FAILED") {
    throw new Error("Transaction failed on chain.");
  }

  return getResult;
}

/**
 * Read-only contract call (does not require signing).
 */
export async function readContract(
  method: string,
  params: xdr.ScVal[]
): Promise<xdr.ScVal | null> {
  const contract = new Contract(CONTRACT_ADDRESS);
  const caller = "GBJDDTK3R635FEGA3RME5GXS4II5KCMRVX7M4D4DZGZ3S2WQV3IQXK7J"; // random
  
  const account = await server.getAccount(caller);
  
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationSuccess(simulated as rpc.Api.SimulateTransactionResponse)) {
    const result = (simulated as rpc.Api.SimulateTransactionSuccessResponse).result;
    if (result) {
      return result.retval;
    }
  }
  return null;
}

// ============================================================
// ScVal Conversion Helpers
// ============================================================

function toScValAddress(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

function toScValU32(value: number): xdr.ScVal {
  return xdr.ScVal.scvU32(value);
}

// ============================================================
// Loyalty Token — Contract Methods
// ============================================================

/**
 * Add loyalty points to a user (admin only).
 * Calls: add_points(user: Address, amount: u32)
 */
export async function addPoints(
  caller: string,
  user: string,
  amount: number
) {
  return callContract(
    "add_points",
    [toScValAddress(user), toScValU32(amount)],
    caller
  );
}

/**
 * Redeem loyalty points.
 * Calls: redeem_points(user: Address, amount: u32)
 */
export async function redeemPoints(
  caller: string,
  user: string,
  amount: number
) {
  return callContract(
    "redeem_points",
    [toScValAddress(user), toScValU32(amount)],
    caller
  );
}

/**
 * Get loyalty points balance for a user.
 * Calls: get_points(user: Address) -> u32
 */
export async function getPoints(user: string): Promise<number | null> {
  const result = await readContract("get_points", [toScValAddress(user)]);
  if (result) {
    return scValToNative<number>(result);
  }
  return null;
}

function scValToNative<T>(val: xdr.ScVal): T {
  switch (val.switch()) {
    case xdr.ScValType.scvU32():
      return val.u32() as T;
    case xdr.ScValType.scvI32():
      return val.i32() as T;
    case xdr.ScValType.scvU64():
      return Number(val.u64()) as T;
    case xdr.ScValType.scvI64():
      return Number(val.i64()) as T;
    case xdr.ScValType.scvString():
      return val.str() as unknown as T;
    default:
      return null as T;
  }
}