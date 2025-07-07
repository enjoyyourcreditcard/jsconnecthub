import React from "react";
import { useAuthUser } from "react-auth-kit";
import Header from "../shared/layout/Header";

function About() {
    const auth = useAuthUser();
    const user = auth();

    return (
        <div>
            <Header title="About This App" />
            <main className="admin-container with-color" style={{ padding: "20px" }}>
                <h2>{user ? `Halo, ${user.name}!` : "Halo!"}</h2>
                <p>This is jsconnecthub!</p>
            </main>
        </div>
    );
}

export default About;
