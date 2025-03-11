import { useState, useEffect } from 'react';
import axios from 'axios';

function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/user', {
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            setUser(response.data);
            setLoading(false);
        })
        .catch(() => {
            setUser(null);
            setLoading(false);
        });
    }, []);

    const logout = () => {
        // axios.post('/logout').then(() => setUser(null));
        console.log('logout');
    };

    return { user, loading, logout };
}

export default useAuth;
