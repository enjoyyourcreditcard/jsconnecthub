export const QUESTION_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/questions/",
        store: "/api/questions/",
        update: "/api/questions/",
        get: "/api/questions/",
        delete: "/api/questions/",
    },
};
