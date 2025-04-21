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

    const getMasterItems = () => {
        const userRole = auth()?.role;
        const items = [];

        if (userRole === "Superadmin") {
            items.push({
                label: "Dashboard",
                command: () => navigate("/dashboard"),
            });
        }

        if (["Superadmin", "Admin1", "Admin2", "Admin3"].includes(userRole)) {
            const masterSubItems = [];

            masterSubItems.push({
                label: "Student",
                command: () => navigate("/students"),
            });

            if (userRole === "Superadmin") {
                masterSubItems.push(
                    { label: "User", command: () => navigate("/users") },
                    { label: "Class", command: () => navigate("/class") },
                    { label: "Level", command: () => navigate("/levels") },
                    {
                        label: "Activity",
                        command: () => navigate("/activities"),
                    },
                    {
                        label: "Facility",
                        command: () => navigate("/facilities"),
                    }
                );
            } else {
                if (userRole === "Admin1") {
                    masterSubItems.push({
                        label: "Activity",
                        command: () => navigate("/activities"),
                    });
                }
                if (userRole === "Admin2") {
                    masterSubItems.push({
                        label: "Facility",
                        command: () => navigate("/facilities"),
                    });
                }
            }

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

        if (permissions.some((p) => p.includes("checkin"))) {
            items.push({
                label: "Checkin/Checkout",
                command: () => navigate("/checkin"),
            });
        }

        if (permissions.some((p) => p.includes("bookings"))) {
            items.push({
                label: "Facility Reservations",
                command: () => navigate("/facility-reservations"),
            });
        }

        if (permissions.some((p) => p.includes("counsels"))) {
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

    // console.log(auth()); // Debug the entire auth object

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
                        onClick={() => navigate("/login")}
                    />
                )}
            </div>
        </div>
    );
};

export default Header;
