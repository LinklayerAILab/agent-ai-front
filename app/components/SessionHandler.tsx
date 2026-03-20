'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

export default function SessionHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [dispatch]);

  return null; // This component doesn't render anything
}
