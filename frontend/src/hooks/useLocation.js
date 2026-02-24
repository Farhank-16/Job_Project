import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          const errorMsg = getErrorMessage(err);
          setError(errorMsg);
          setLoading(false);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const getErrorMessage = (err) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location access.';
      case err.POSITION_UNAVAILABLE:
        return 'Location information unavailable.';
      case err.TIMEOUT:
        return 'Location request timed out.';
      default:
        return 'An error occurred getting location.';
    }
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
};