export const ACTIVITY_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/activities/",
        store: "/api/activities/",
        update: "/api/activities/",
        get: "/api/activities/",
        delete: "/api/activities/",
        import: "/api/activities/import",
    },
};
