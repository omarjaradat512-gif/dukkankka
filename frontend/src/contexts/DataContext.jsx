import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    STORE as FALLBACK_STORE,
    SUBSCRIPTIONS as FALLBACK_SUBS,
    GAMES as FALLBACK_GAMES,
    BUNDLES as FALLBACK_BUNDLES,
} from "../data/products";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [store, setStore] = useState(FALLBACK_STORE);
    const [subscriptions, setSubscriptions] = useState(FALLBACK_SUBS);
    const [games, setGames] = useState(FALLBACK_GAMES);
    const [bundles, setBundles] = useState(FALLBACK_BUNDLES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [s, subs, gms, bnds] = await Promise.all([
                axios.get(`${API}/store`),
                axios.get(`${API}/subscriptions`),
                axios.get(`${API}/games`),
                axios.get(`${API}/bundles`),
            ]);
            setStore(s.data);
            setSubscriptions(subs.data);
            setGames(gms.data);
            setBundles(bnds.data);
            setError(null);
        } catch (e) {
            console.warn("DataProvider: API fetch failed, using fallback", e?.message);
            setError(e?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return (
        <DataContext.Provider
            value={{
                store,
                subscriptions,
                games,
                bundles,
                loading,
                error,
                reload: fetchAll,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useStoreData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useStoreData must be used within DataProvider");
    return ctx;
}
