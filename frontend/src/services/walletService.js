import api from "./api";

export async function getBalance() {
  const { data } = await api.get("/api/wallet/balance");
  return data;
}

export async function createWallet() {
  const { data } = await api.post("/api/wallet/create");
  return data;
}

export async function addMoney({ amount, note }) {
  const { data } = await api.post("/api/wallet/add-money", { amount, note });
  return data;
}

export async function transferMoney({ recipientEmail, amount, note }) {
  const { data } = await api.post("/api/wallet/transfer", {
    recipientEmail,
    amount,
    note,
  });
  return data;
}
