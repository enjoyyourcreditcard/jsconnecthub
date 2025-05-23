import axios from "axios";

const api = axios.create({
    baseURL: window.APP_URL || "http://localhost:8000",
    withCredentials: true,
});

api.get("/sanctum/csrf-cookie").catch((err) =>
    console.error("CSRF Error:", err)
);

export const setAuthToken = (getAuthHeader) => {
    const interceptor = api.interceptors.request.use(
        (config) => {
            const authHeader = getAuthHeader();
            if (authHeader) {
                config.headers.Authorization = authHeader;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return () => api.interceptors.request.eject(interceptor);
};

export default api;
