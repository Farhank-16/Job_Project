import { useState } from 'react';

const ERROR_MESSAGES = {
  1: 'Location permission denied. Please enable location access.',
  2: 'Location information unavailable.',
  3: 'Location request timed out.',
};

// Named export bhi rakha — CompleteProfile aur PostJob mein alias import use hota hai:
// import { useLocation as useGeoLocation } from '../../hooks/useLocation'
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude:  position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setLoading(false);
        resolve(coords);
      },
      (err) => {
        const msg = ERROR_MESSAGES[err.code] || 'An error occurred getting location.';
        setError(msg);
        setLoading(false);
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });

  return { location, loading, error, getCurrentLocation };
};

export default useLocation;