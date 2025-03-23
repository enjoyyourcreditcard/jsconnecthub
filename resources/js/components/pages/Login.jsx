import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "react-auth-kit";
import { useDispatch } from "react-redux"; // Add Redux dispatch
import { setStateData } from "../store/global-slice"; // Import to control spinner
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const Login = () => {
    const navigate = useNavigate();
    const signIn = useSignIn();
    const dispatch = useDispatch(); // For Redux state updates
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        dispatch(
            setStateData({
                key: "spinner",
                data: { show: true, text: "Logging in..." },
            })
        );
        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });
            setLoading(false);
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: false, text: "" },
                })
            );
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
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: false, text: "" },
                })
            );
            const errorMsg =
                error.response?.data?.errors?.message?.[0] || "Login failed";
            setError(errorMsg);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/home");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
            }}
        >
            <div
                style={{
                    width: "80%",
                    maxWidth: "500px",
                    textAlign: "center",
                    position: "relative",
                }}
            >
                <Button
                    icon="pi pi-arrow-left"
                    rounded
                    onClick={handleBack}
                    style={{
                        position: "absolute",
                        top: "-15px",
                        left: "-15px",
                        width: "40px",
                        height: "40px",
                        padding: "0",
                    }}
                />
                <div className="card flex justify-center">
                    <Card title="JS-CONNECT-HUB" className="w-full">
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "20px" }}>
                                <FloatLabel>
                                    <InputText
                                        id="email"
                                        style={{ width: "100%" }}
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                    <label htmlFor="email">Email</label>
                                </FloatLabel>
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                <FloatLabel>
                                    <InputText
                                        id="password"
                                        style={{ width: "100%" }}
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                    <label htmlFor="password">Password</label>
                                </FloatLabel>
                            </div>
                            {error && (
                                <p
                                    style={{
                                        color: "red",
                                        marginBottom: "20px",
                                    }}
                                >
                                    {error}
                                </p>
                            )}
                            <Button
                                label="Login"
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            />
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
