import React from "react";
import { Link } from "react-router-dom";
import { Card } from "primereact/card";
import Header from "../shared/layout/Header";

function NotFound() {
    return (
        <div>
            <Header />
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <Card
                    style={{
                        width: "90%",
                        maxWidth: "500px",
                        padding: "20px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                    className="not-found-card"
                >
                    <h2
                        style={{
                            fontSize: "1.5rem",
                            marginBottom: "10px",
                        }}
                    >
                        Oops! Looks like you're lost.
                    </h2>
                    <p
                        style={{
                            fontSize: "1rem",
                            marginBottom: "20px",
                        }}
                    >
                        The page you're looking for doesn’t exist or has been
                        moved.
                    </p>
                    <Link to="/" className="p-button font-bold">
                        Back to Home
                    </Link>
                </Card>
            </div>
        </div>
    );
}

export default NotFound;
