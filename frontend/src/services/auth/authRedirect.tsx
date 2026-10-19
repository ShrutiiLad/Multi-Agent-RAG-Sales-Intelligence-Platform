// src/components/AuthRedirect.tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectToken } from '@/redux/slices/authSlice';

const AuthRedirect = () => {
    const token = useSelector(selectToken);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    return null;
};
export default AuthRedirect;


