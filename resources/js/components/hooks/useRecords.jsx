import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getRecords, deleteRecord, createRecord } from "../store/global-slice";

export const useRecords = (type, endpoint, key, isReady) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isReady) {
            setLoading(true);
            dispatch(getRecords({ type, endPoint: endpoint, key })).finally(
                () => setLoading(false)
            );
        }
    }, [dispatch, type, endpoint, key, isReady]);

    const handleDelete = async (id, onSuccess) => {
        if (window.confirm(`Are you sure you want to delete ${type} ${id}?`)) {
            setLoading(true);
            const success = await dispatch(
                deleteRecord({ endPoint: `${endpoint}/${id}` })
            );
            setLoading(false);
            if (success.meta.requestStatus === "fulfilled") {
                onSuccess();
                return true;
            }
            return false;
        }
    };

    const handleCreate = async (data, onSuccess) => {
        setLoading(true);
        try {
            const result = await dispatch(
                createRecord({ type, endPoint: endpoint, data })
            );
            if (result.meta.requestStatus === "fulfilled") {
                onSuccess();
                return true;
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, data, onSuccess) => {
        setLoading(true);
        try {
            const result = await dispatch(
                createRecord({ type, endPoint: `${endpoint}/${id}`, data }) // Assuming PUT-like behavior
            );
            if (result.meta.requestStatus === "fulfilled") {
                onSuccess();
                return true;
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, handleDelete, handleCreate, handleUpdate };
};
