export const STUDENT_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/students/",
        store: "/api/students/",
        update: "/api/students/",
        get: "/api/students/",
        delete: "/api/students/",
        import: "/api/students/import",
    },
};
