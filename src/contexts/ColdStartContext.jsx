import { createContext, useContext, useEffect, useState } from 'react';
import { checkHealth, setBackendReady } from '../services/api';
import AppDownError from '../components/AppDownError';

const ColdStartContext = createContext({});

export function useColdStart() {
  return useContext(ColdStartContext);
}

export function ColdStartProvider({ children }) {
  const [isError, setIsError] = useState(false);

  // Release animations after React/MUI have fully mounted and styles are stable
  useEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          document.getElementById('cold-start-loader')?.classList.add('fu-animated');
        }
      });
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const isWarmed = sessionStorage.getItem('backend_warmed') === '1';

    if (isWarmed) {
      return;
    }

    let intervalId = null;
    let timeoutId = null;
    const startTime = Date.now();
    const TIMEOUT_MS = 2 * 60 * 1000;

    const poll = async () => {
      const isHealthy = await checkHealth();

      if (isHealthy) {
        await setBackendReady();
        const loader = document.getElementById('cold-start-loader');
        if (loader) {
          loader.remove();
        }
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed > TIMEOUT_MS) {
        setIsError(true);
        const loader = document.getElementById('cold-start-loader');
        if (loader) {
          loader.remove();
        }
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    };

    poll();
    intervalId = setInterval(poll, 1000);

    timeoutId = setTimeout(() => {
      if (!isError) {
        setIsError(true);
        const loader = document.getElementById('cold-start-loader');
        if (loader) {
          loader.remove();
        }
      }
      clearInterval(intervalId);
    }, TIMEOUT_MS);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isError]);

  if (isError) {
    return <AppDownError />;
  }

  return (
    <ColdStartContext.Provider value={{}}>
      {children}
    </ColdStartContext.Provider>
  );
}
