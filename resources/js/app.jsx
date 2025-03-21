import "./bootstrap";
import "../css/app.css";

import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuthHeader } from "react-auth-kit";
import { Provider } from "react-redux";
import { store } from "./components/store";
import { setAuthToken } from "./components/api";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import ManageUser from "./components/masters/ManageUser";
import NotFound from "./components/pages/NotFound";

const AppWrapper = () => {
    const authHeader = useAuthHeader();
    useEffect(() => {
        setAuthToken(authHeader);
    }, [authHeader]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/users" element={<ManageUser />} />
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

const App = () => (
    <Provider store={store}>
        <AuthProvider
            authType="cookie"
            authName="_auth"
            cookieDomain={window.location.hostname}
            cookieSecure={window.location.protocol === "https:"}
        >
            <AppWrapper />
        </AuthProvider>
    </Provider>
);

const root = createRoot(document.getElementById("app"));
root.render(<App />);
