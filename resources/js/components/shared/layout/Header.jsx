import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useNavigate } from "react-router-dom";
import { useAuthUser, useSignOut } from "react-auth-kit";
import api from "../../api";

const Header = () => {
    const auth = useAuthUser();
    const signOut = useSignOut();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const handleLogout = () => {
        api.post("/api/logout")
            .then((response) => {
                if (response.data.status) {
                    signOut();
                    navigate("/login");
                }
            })
            .catch((error) => {
                if (
                    error.response?.status === 401 &&
                    error.response?.data?.message === "Unauthenticated."
                ) {
                    signOut();
                    navigate("/login");
                }
            });
    };

    const baseItems = [
        {
            label: "Home",
            command: () => navigate("/"),
        },
        {
            label: "About",
            command: () => navigate("/about"),
        },
    ];

    const masterItem = {
        label: "Master",
        items: [
            { label: "Student", command: () => navigate("/students") },
            { label: "User", command: () => navigate("/users") },
            { label: "Class", command: () => navigate("/class") },
            { label: "Level", command: () => navigate("/levels") },
            { label: "Activity", command: () => navigate("/activities") },
            { label: "Facility", command: () => navigate("/facilities") },
        ],
    };

    const reportItem = {
        label: "Report",
        items: [{ label: "Checkin", command: () => navigate("/checkin") }],
    };

    const centerItems = auth()
        ? [...baseItems, masterItem, reportItem]
        : baseItems;

    const profileItems = [
        {
            label: "Settings",
            icon: "pi pi-cog",
        },
        {
            label: "Logout",
            icon: "pi pi-sign-out",
            command: handleLogout,
        },
    ];

    const handleProfileClick = (event) => {
        menuRef.current.toggle(event);
    };

    const logo = (
        <span
            className="logo-text"
            data-full="JS-CONNECT-HUB"
            data-short="JS"
            style={{ marginRight: "10px" }}
        />
    );

    return (
        <div
            className="card header-container"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                background: "linear-gradient(to bottom, #f0f0f0, #ffffff)",
            }}
        >
            <div>
                <Menubar
                    model={centerItems}
                    start={logo}
                    style={{ background: "transparent", border: "none" }}
                    breakpoint="960px"
                />
            </div>
            <div>
                {auth() ? (
                    <>
                        <Button
                            onClick={handleProfileClick}
                            className="p-button-text"
                        >
                            <Avatar
                                label={(
                                    auth()?.email?.charAt(0) || "G"
                                ).toUpperCase()}
                                shape="circle"
                                size="small"
                            />
                            <div
                                className="profile-text"
                                style={{
                                    marginLeft: "8px",
                                    flexWrap: "nowrap",
                                }}
                            >
                                <span className="font-bold">
                                    {auth()?.name || "Guest"}
                                </span>
                            </div>
                        </Button>
                        <Menu
                            model={profileItems}
                            popup
                            ref={menuRef}
                            className="profile-dropdown"
                        />
                    </>
                ) : (
                    <Button
                        label="Login"
                        icon="pi pi-sign-in"
                        className="p-button-text"
                        onClick={() => navigate("/login")}
                    />
                )}
            </div>
        </div>
    );
};

export default Header;
