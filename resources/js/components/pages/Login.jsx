import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "react-auth-kit";
import { ProgressSpinner } from "primereact/progressspinner";
import Header from "../shared/layout/Header";

const Login = () => {
    const navigate = useNavigate();
    const signIn = useSignIn();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });
            setLoading(false);
            if (response.data.status) {
                signIn({
                    token: response.data.token,
                    expiresIn: 3600,
                    tokenType: "Bearer",
                    authState: response.data.result,
                });
                navigate("/home");
            }
        } catch (error) {
            setLoading(false);
            const errorMsg =
                error.response?.data?.errors?.message?.[0] || "Login failed";
            setError(errorMsg);
        }
    };

    return (
        <div>
            <Header title="Login" />
            <div
                style={{
                    maxWidth: "400px",
                    margin: "50px auto",
                    textAlign: "center",
                }}
            >
                {loading && (
                    <div style={{ marginBottom: "20px" }}>
                        <ProgressSpinner
                            style={{ width: "50px", height: "50px" }}
                        />
                        <p>Logging in...</p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                fontSize: "16px",
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                fontSize: "16px",
                            }}
                            required
                        />
                    </div>
                    {error && (
                        <p style={{ color: "red", marginBottom: "20px" }}>
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
