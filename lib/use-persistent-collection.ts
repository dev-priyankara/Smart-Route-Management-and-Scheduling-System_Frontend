"use client";

import { useEffect, useState } from "react";

export function usePersistentCollection<T extends { id: number }>(storageKey: string, seed: T[]) {
  const [records, setRecords] = useState(seed);
  const [ready, setReady] = useState(false);

  const getLatestRecords = () => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed as T[];
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    return records;
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecords(parsed as T[]);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(records));
  }, [ready, records, storageKey]);

  const addRecord = (record: Omit<T, "id">) => {
    const current = getLatestRecords();
    const id = Math.max(0, ...current.map((item) => item.id)) + 1;
    const updated = [{ ...record, id } as T, ...current];
    window.localStorage.setItem(storageKey, JSON.stringify(updated));
    setRecords(updated);
  };

  const updateRecord = (id: number, record: Omit<T, "id">) => {
    const updated = getLatestRecords().map((item) => item.id === id ? { ...record, id } as T : item);
    window.localStorage.setItem(storageKey, JSON.stringify(updated));
    setRecords(updated);
  };

  const removeRecord = (id: number) => {
    const updated = getLatestRecords().filter((item) => item.id !== id);
    window.localStorage.setItem(storageKey, JSON.stringify(updated));
    setRecords(updated);
  };

  return { records, addRecord, updateRecord, removeRecord };
}