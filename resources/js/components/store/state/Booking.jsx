export const BOOKING_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/bookings/",
        store: "/api/bookings/",
        update: "/api/bookings/",
        get: "/api/bookings/",
        delete: "/api/bookings/",
    },
};
