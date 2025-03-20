import React from "react";
import { Link } from "react-router-dom";
import Header from "../shared/layout/Header";

function NotFound() {
    return (
        <div>
            <Header title="404 - Page Not Found" />
            <div style={{ textAlign: "center" }}>
                <h2>Oops! Looks like you're lost.</h2>
                <p>The page you're looking for doesn’t exist or has been moved.</p>
                <Link
                    to="/"
                    style={{
                        display: "inline-block",
                        marginTop: "20px",
                        padding: "10px 20px",
                        background: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "5px",
                    }}
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
