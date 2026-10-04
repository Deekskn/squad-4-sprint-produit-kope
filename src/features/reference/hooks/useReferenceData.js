import { useEffect, useState, useCallback, useRef } from 'react';
import { listTrades, listZones } from '../services/reference.service.js';

let tradesPromise = null;
let zonesPromise = null;

export function useReferenceData() {
  const [trades, setTrades] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    tradesPromise = null;
    zonesPromise = null;
    setLoading(true);
    setError(null);
    try {
      const [t, z] = await Promise.all([listTrades(), listZones()]);
      if (!mounted.current) return;
      setTrades(t);
      setZones(z);
    } catch (err) {
      if (!mounted.current) return;
      setError(err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      try {
        const [t, z] = await Promise.all([
          tradesPromise ?? (tradesPromise = listTrades()),
          zonesPromise ?? (zonesPromise = listZones()),
        ]);
        if (!mounted.current) return;
        setTrades(t);
        setZones(z);
      } catch (err) {
        if (!mounted.current) return;
        setError(err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  return { trades, zones, loading, error, reload };
}

export function useTrades() {
  return useReferenceData().trades;
}

export function useZones() {
  return useReferenceData().zones;
}
