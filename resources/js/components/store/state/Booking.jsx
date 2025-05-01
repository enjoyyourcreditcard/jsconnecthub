export const BOOKING_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/bookings/",
        store: "/api/booking/",
        confirm: "/api/booking-confirm/",
        cancel: "/api/booking-cancel/",
        update: "/api/bookings/",
        get: "/api/bookings/",
        delete: "/api/bookings/",
    },
};
