import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const LangContext = createContext(null);
const STORAGE_KEY = "dakanak_lang_v1";

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState("ar");

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === "ar" || saved === "en") setLang(saved);
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch {}
        // Update <html> dir and lang
        const html = document.documentElement;
        html.setAttribute("lang", lang);
        html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    }, [lang]);

    const value = useMemo(() => {
        const dict = translations[lang] || translations.ar;
        const t = (key, fallback) => {
            if (key == null) return "";
            return dict[key] ?? fallback ?? key;
        };
        return {
            lang,
            dir: lang === "ar" ? "rtl" : "ltr",
            isRTL: lang === "ar",
            setLang,
            toggleLang: () => setLang((l) => (l === "ar" ? "en" : "ar")),
            t,
        };
    }, [lang]);

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error("useLang must be used within LanguageProvider");
    return ctx;
}

// Helper to pick localized field from an object (e.g., { name, name_en })
export function pickLocalized(obj, baseKey, lang) {
    if (!obj) return "";
    if (lang === "en") {
        const en = obj[`${baseKey}_en`];
        if (en && en.trim()) return en;
    }
    return obj[baseKey] || "";
}
