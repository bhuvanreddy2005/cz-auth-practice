import axios from "axios";
import { getToken } from "../utils/auth";
// Reads VITE_API_URL from frontend/.env (Vite only exposes vars prefixed
// with VITE_). Falls back to the local FastAPI dev server if not set.
const baseURL = import.meta.env.VITE_API_URL || "https://cz-auth-backend.onrender.com";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;