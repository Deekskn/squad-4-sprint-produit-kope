import { useEffect, useRef, useState } from 'react';

export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      setData(undefined);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {
      
    });
  }, deps);

  return { data, loading, error, reload: load };
}
