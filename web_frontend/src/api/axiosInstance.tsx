import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // cookie-based auth hole lagbe
  timeout: 15000,
});

export default axiosInstance;