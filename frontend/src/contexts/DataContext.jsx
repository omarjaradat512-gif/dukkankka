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

const FALLBACK_SECTIONS = [
    { id: "recommender",   label: "مساعدك الشخصي (Recommender)", visible: true },
    { id: "essential",     label: "الاشتراك الأساسي",            visible: true },
    { id: "extra",         label: "الاشتراك الإضافي",            visible: true },
    { id: "comparison",    label: "مقارنة الاشتراكات",           visible: true },
    { id: "bundles",       label: "الباقات المدمجة",             visible: true },
    { id: "bundleBuilder", label: "ابني باقتك",                  visible: true },
    { id: "games",         label: "الألعاب",                     visible: true },
    { id: "reviews",       label: "آراء العملاء",                visible: true },
    { id: "faq",           label: "الأسئلة الشائعة",             visible: true },
];

export function DataProvider({ children }) {
    const [store, setStore] = useState(FALLBACK_STORE);
    const [subscriptions, setSubscriptions] = useState(FALLBACK_SUBS);
    const [games, setGames] = useState(FALLBACK_GAMES);
    const [bundles, setBundles] = useState(FALLBACK_BUNDLES);
    const [sections, setSections] = useState(FALLBACK_SECTIONS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [s, subs, gms, bnds, secs] = await Promise.all([
                axios.get(`${API}/store`),
                axios.get(`${API}/subscriptions`),
                axios.get(`${API}/games`),
                axios.get(`${API}/bundles`),
                axios.get(`${API}/sections`),
            ]);
            setStore(s.data);
            setSubscriptions(subs.data);
            setGames(gms.data);
            setBundles(bnds.data);
            setSections(secs.data || FALLBACK_SECTIONS);
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
                sections,
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
