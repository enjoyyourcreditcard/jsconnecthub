import "./bootstrap";
import "../css/app.css";

import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuthHeader } from "react-auth-kit";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./components/store";
import { setAuthToken } from "./components/api";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { setStateData } from "./components/store/global-slice";
import { stateKey } from "./components/utils/constants";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import ManageUser from "./components/masters/ManageUser";
import NotFound from "./components/pages/NotFound";

const AppWrapper = () => {
    const authHeader = useAuthHeader();
    const [authReady, setAuthReady] = useState(false);
    const { spinner, toastMessage } = useSelector(
        (state) => state.global[stateKey.app]
    );
    const dispatch = useDispatch();
    const toast = useRef(null);

    useEffect(() => {
        setAuthToken(authHeader);
        if (authHeader) {
            setAuthReady(true);
        }
    }, [authHeader]);

    useEffect(() => {
        if (toastMessage) {
            toast.current.show(toastMessage);
            setTimeout(() => {
                toast.current.clear();
            }, 3000);
        }
    }, [toastMessage]);

    if (!authReady) {
        return <div>Loading authentication...</div>;
    }

    return (
        <BrowserRouter>
            <Toast ref={toast} />
            {spinner.show && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textWrap: "wrap",
                        }}
                    >
                        <ProgressSpinner />
                        <span
                            style={{
                                marginTop: "10px",
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            {spinner.text}
                        </span>
                    </div>
                </div>
            )}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
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
