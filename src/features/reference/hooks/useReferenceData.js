import { useEffect, useState, useCallback, useRef } from 'react';
import { listTrades, listZones, invalidateReferenceCache } from '../services/reference.service.js';

export function useReferenceData() {
  const [trades, setTrades] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
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

  const reload = useCallback(async () => {
    invalidateReferenceCache();
    await load();
  }, [load]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { trades, zones, loading, error, reload };
}