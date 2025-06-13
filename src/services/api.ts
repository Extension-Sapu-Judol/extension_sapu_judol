import axios from "axios";

console.log(`URL: ${process.env.PLASMO_PUBLIC_BACKEND_URL}`);
export const axiosInstance = axios.create({
  baseURL: process.env.PLASMO_PUBLIC_BACKEND_URL || "http://localhost:8000/"
});
