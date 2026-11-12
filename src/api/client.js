import axios from "axios";

const TOKEN_KEY = "hs_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

// Knox expects "Token <key>" (the old project sent "Bearer", which the backend rejected).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event("hs:logout"));
    }
    return Promise.reject(error);
  }
);

/** Backend always answers errors as {code, message, field_errors}. */
export function errorMessage(error) {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (error?.message === "Network Error") return "Cannot reach server. Is the backend running?";
  return error?.message || "Something went wrong";
}

export function errorCode(error) {
  return error?.response?.data?.code;
}

/** Unwrap DRF paginated or plain list responses. */
export function listOf(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

/** Build FormData from an object (files + arrays). */
export function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (v instanceof FileList) {
      if (v[0]) fd.append(k, v[0]);
    } else if (Array.isArray(v)) {
      v.forEach((x) => fd.append(k, x));
    } else fd.append(k, v);
  });
  return fd;
}
