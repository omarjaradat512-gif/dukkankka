import { STORE as FALLBACK_STORE } from "../data/products";

// Legacy helper kept for non-currency usages.
const fmtPriceUSD = (n) =>
    Number.isInteger(n) ? `${n}$` : `${n.toFixed(2).replace(/\.00$/, "")}$`;

export function buildOrderMessage(items, format, currencyCode, store = FALLBACK_STORE) {
    const s = store || FALLBACK_STORE;
    if (!items || items.length === 0) {
        return `السلام عليكم 👋\nأود الاستفسار عن منتجات متجر ${s.name}.`;
    }
    const fmt = format || fmtPriceUSD;
    const lines = [
        "السلام عليكم 👋",
        `أرغب بطلب من متجر *${s.name}*:`,
        "",
    ];
    let total = 0;
    items.forEach((item, idx) => {
        const qty = item.quantity || 1;
        const lineTotal = item.price * qty;
        total += lineTotal;
        lines.push(`${idx + 1}. *${item.title}*`);
        if (item.subtitle) lines.push(`   • ${item.subtitle}`);
        lines.push(
            `   • الكمية: ${qty}  —  السعر: ${fmt(item.price)}  —  المجموع: ${fmt(
                lineTotal,
            )}`,
        );
        lines.push("");
    });
    lines.push(`*الإجمالي: ${fmt(total)}*${currencyCode ? ` (${currencyCode})` : ""}`);
    lines.push("");
    lines.push("شكراً لكم 🌟");
    return lines.join("\n");
}

export function openWhatsApp(message, store = FALLBACK_STORE) {
    const s = store || FALLBACK_STORE;
    const url = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

export function quickInquiry(productLine, store = FALLBACK_STORE) {
    const s = store || FALLBACK_STORE;
    const msg = `السلام عليكم 👋\nأود الاستفسار عن: ${productLine} من متجر *${s.name}*.`;
    openWhatsApp(msg, s);
}

export { fmtPriceUSD };
