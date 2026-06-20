import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import useStore from '../Hooks/useStore';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); 
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        const verifyToken = async () => {
            // Turn on the global loader immediately
            setIsGlobalLoading(true);

            // 1. Initial quick checks
            if (!token) {
                setIsAuthenticated(false);
                setIsGlobalLoading(false);
                return;
            }

            const fakeTokens = ['true', 'false', 'null', 'undefined', '', ' ', '1', '0', 'yes', 'no'];
            if (fakeTokens.includes(token.toLowerCase()) || token.length < 10) {
                localStorage.clear();
                setIsAuthenticated(false);
                setIsGlobalLoading(false);
                return;
            }

            // 2. Network validation
            try {
                const response = await axios.get(
                    'https://testingbb.trimworldwide.com/api/v1/admin/address-management/country?limit=1',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('Token validation failed:', error.message);
                localStorage.clear();
                setIsAuthenticated(false);
            } finally {
                // Turn off the global loader when the check is totally complete
                setIsGlobalLoading(false);
            }
        };

        verifyToken();
    }, [token, setIsGlobalLoading]);

    if (isAuthenticated === null) {
        return <div className="w-full h-screen bg-white"></div>; 
    }

    // If check failed, redirect
    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace />;
    }

    // If check passed, render the child routes (MainLayout, etc.)
    return <Outlet />;
};

export default ProtectedRoute;