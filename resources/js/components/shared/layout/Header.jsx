import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthUser, useSignOut } from "react-auth-kit";

function Header({ title }) {
    const auth = useAuthUser();
    const signOut = useSignOut();
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut();
        navigate("/login");
    };

    return (
        <header
            style={{
                padding: "10px",
                background: "#f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <h1>{title || "My App"}</h1>
            <nav style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <Link to="/">Home</Link> | <Link to="/about">About</Link>
                <div style={{ marginLeft: "auto" }}>
                    {auth() ? (
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "5px 10px",
                                background: "#ff4444",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                padding: "5px 10px",
                                background: "#007bff",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "5px",
                            }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
