import { useEffect, useState } from "react";
import { loadAppData, loadAppDataFor, subscribe, type AppData } from "@/lib/storage";

export function useAppData(): AppData {
  const [data, setData] = useState<AppData>(() => loadAppData());
  useEffect(() => {
    setData(loadAppData());
    const unsub = subscribe(setData);
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === null ||
        (e.key && (e.key.startsWith("onix_offline_data_v1") || e.key === "onix_auth_v1" || e.key === "onix_mech_active_login_v1"))
      ) {
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

export function useAppDataFor(login: string): AppData {
  const [data, setData] = useState<AppData>(() => loadAppDataFor(login));
  useEffect(() => {
    setData(loadAppDataFor(login));
    const unsub = subscribe(() => setData(loadAppDataFor(login)));
    return () => unsub();
  }, [login]);
  return data;
}
