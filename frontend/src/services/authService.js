import api from "./api";

export async function register({ fullName, email, password, phoneNumber }) {
  const { data } = await api.post("/api/auth/register", {
    fullName,
    email,
    password,
    phoneNumber,
  });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export function saveSession(authResponse) {
  localStorage.setItem("ewallet_token", authResponse.token);
  localStorage.setItem(
    "ewallet_user",
    JSON.stringify({
      userId: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
    })
  );
}

export function getSession() {
  const raw = localStorage.getItem("ewallet_user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("ewallet_token");
  localStorage.removeItem("ewallet_user");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("ewallet_token"));
}
