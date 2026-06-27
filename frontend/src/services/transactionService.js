import api from "./api";

export async function getTransactionHistory({ page = 0, size = 10 } = {}) {
  const { data } = await api.get("/api/transactions/history", {
    params: { page, size },
  });
  return data;
}
