import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthUser, useSignOut } from "react-auth-kit";
import api from "../../api";

const Header = () => {
    const auth = useAuthUser();
    const signOut = useSignOut();
    const navigate = useNavigate();
    const location = useLocation();
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

    const getMasterItems = () => {
        const permissions = auth()?.permissions || [];
        const items = [];

        if (permissions.includes("dashboard view")) {
            items.push({
                label: "Dashboard",
                command: () => navigate("/dashboard"),
            });
        }

        const masterSubItems = [];
        if (permissions.includes("students view")) {
            masterSubItems.push({
                label: "Student",
                command: () => navigate("/students"),
            });
        }
        if (permissions.includes("users view")) {
            masterSubItems.push({
                label: "User",
                command: () => navigate("/users"),
            });
        }
        if (permissions.includes("class view")) {
            masterSubItems.push({
                label: "Class",
                command: () => navigate("/class"),
            });
        }
        if (permissions.includes("levels view")) {
            masterSubItems.push({
                label: "Level",
                command: () => navigate("/levels"),
            });
        }
        if (permissions.includes("activities view")) {
            masterSubItems.push({
                label: "Activity",
                command: () => navigate("/activities"),
            });
        }
        if (permissions.includes("facilities view")) {
            masterSubItems.push({
                label: "Facility",
                command: () => navigate("/facilities"),
            });
        }

        if (masterSubItems.length > 0) {
            items.push({
                label: "Master",
                items: masterSubItems,
            });
        }

        return items;
    };

    const getReportItems = () => {
        const permissions = auth()?.permissions || [];
        const items = [];

        if (permissions.includes("checkin view")) {
            items.push({
                label: "Checkin/Checkout",
                command: () => navigate("/checkin"),
            });
        }

        if (permissions.includes("bookings view")) {
            items.push({
                label: "Facility Reservations",
                command: () => navigate("/facility-reservations"),
            });
        }

        if (permissions.includes("counsels view")) {
            items.push({
                label: "Ask Ms Vi",
                command: () => navigate("/counsels"),
            });
        }

        return items.length > 0 ? [{ label: "Report", items }] : [];
    };

    const centerItems = auth()
        ? [...baseItems, ...getMasterItems(), ...getReportItems()]
        : [];

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

    const isHomePage =
        (location.pathname === "/" || location.pathname === "/home") &&
        auth() === null;

    return (
        <div
            className={`card header-container ${isHomePage ? "is-home" : ""}`}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                background: isHomePage
                    ? "transparent"
                    : "linear-gradient(to bottom, #f0f0f0, #ffffff)",
                position: isHomePage ? "absolute" : "initial",
                top: 0,
                width: "100%",
                zIndex: 10,
            }}
        >
            <div className="flex-auto">
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
                            size="small"
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
                                    color: isHomePage ? "#fff" : "#000",
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
                        size="small"
                        style={{ color: isHomePage ? "#fff" : "#000" }}
                        onClick={() => navigate("/login")}
                    />
                )}
            </div>
        </div>
    );
};

export default Header;
