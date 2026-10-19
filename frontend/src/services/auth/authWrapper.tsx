import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';

// Define a generic type for the props of the WrappedComponent
type ComponentProps = Record<string, any>;

export function withAuthCheck<T extends ComponentProps>(WrappedComponent: React.ComponentType<T>) {
  // Function component type that takes props of type T
  return function AuthCheckWrapper(props: T) {
    const token = useSelector((state: RootState) => state.auth.token);
    const navigate = useNavigate();

    useEffect(() => {
      if (!token) {
        // Redirect to login page if token is not present
        navigate('/login');
      }
    }, [token, navigate]);

    // If token exists, render the wrapped component
    return token ? <WrappedComponent {...props} /> : null;
  };
}
