import axios from "axios";
import { useAuthHeader } from "react-auth-kit";

const api = axios.create({
    baseURL: window.APP_URL || "http://localhost:8000",
    withCredentials: true,
});

api.get("/sanctum/csrf-cookie").catch((err) =>
    console.error("CSRF Error:", err)
);

export const setAuthToken = (getAuthHeader) => {
    api.interceptors.request.use(
        (config) => {
            const authHeader = getAuthHeader();
            console.log("Interceptor Header:", authHeader);
            if (authHeader) {
                config.headers.Authorization = authHeader;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

export default api;
