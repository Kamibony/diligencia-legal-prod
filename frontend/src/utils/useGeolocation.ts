import { useState, useEffect } from 'react';
import { PT_BR } from '../locales/pt-BR';

// Fallback to João Pessoa, Paraíba
const FALLBACK_LOCATION = {
  lat: -7.11532,
  lon: -34.86105,
};

export const useGeolocation = () => {
  const isSupported = typeof navigator !== "undefined" && !!navigator.geolocation;
  const [state, setState] = useState({
    location: !isSupported ? FALLBACK_LOCATION : null,
    loading: isSupported, // If supported, we start loading
    error: !isSupported ? (PT_BR.geolocation.notSupported as string) : null,
    usingFallback: !isSupported,
  });

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    let isMounted = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isMounted) {
          setState({
            location: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
            loading: false,
            error: null,
            usingFallback: false
          });
        }
      },
      (err) => {
        if (isMounted) {
          console.warn('Geolocation error, using fallback:', err.message);
          setState({
             location: FALLBACK_LOCATION,
             loading: false,
             error: err.message,
             usingFallback: true
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      isMounted = false;
    };
  }, [isSupported]);

  return state;
};
