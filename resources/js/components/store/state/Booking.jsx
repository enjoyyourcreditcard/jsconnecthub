export const BOOKING_STATE = {
    data: [],
    spinner: { show: false, text: "" },
    toastMessage: null,
    alert: {},
    endPoints: {
        collection: "/api/bookings/",
        store: "/api/bookings/",
        confirm: "/api/booking-confirm/{id}",
        cancel: "/api/booking-cancel/{id}",
        update: "/api/bookings/",
        get: "/api/bookings/",
        delete: "/api/bookings/",
    },
};
