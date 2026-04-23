import { useEffect, useState } from "react";
import { loadAppData, subscribe, type AppData } from "@/lib/storage";

export function useAppData(): AppData {
  const [data, setData] = useState<AppData>(() => loadAppData());
  useEffect(() => {
    setData(loadAppData());
    const unsub = subscribe(setData);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "onix_offline_data_v1") {
        setData(loadAppData());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return data;
}
