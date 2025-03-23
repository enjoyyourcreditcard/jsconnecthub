export const USER_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/users/",
        store: "/api/users/",
        update: "/api/users/",
        get: "/api/users/",
        delete: "/api/users/",
        import: "/api/users/import",
    },
};
