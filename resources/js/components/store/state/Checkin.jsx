export const CHECKIN_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/checkin/",
        store: "/api/checkin/",
        update: "/api/checkin/",
        get: "/api/checkin/",
        delete: "/api/checkin/",

        // student
        checkin: "/api/check-in/",
        checkout: "/api/check-out/",
    },
};
