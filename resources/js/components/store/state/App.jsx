export const APP_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/app/",
        store: "/api/app/",
        update: "/api/app/",
        get: "/api/app/",
        delete: "/api/app/",
        import: "/api/app/import",
    },
};
