import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "../components/ui/sheet";
import { Plus, Minus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { buildOrderMessage, openWhatsApp } from "../lib/whatsapp";

export const CartDrawer = ({ open, onOpenChange }) => {
    const { items, totalPrice, totalQty, inc, dec, remove, clear } = useCart();
    const { format, code } = useCurrency();

    const handleCheckout = () => {
        if (items.length === 0) return;
        const msg = buildOrderMessage(items, format, code);
        openWhatsApp(msg);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-full sm:max-w-md bg-[hsl(var(--brand-cream))] border-l-0 flex flex-col p-0"
                data-testid="cart-drawer"
            >
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--brand-ink))]/10 text-right">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-[hsl(var(--brand-ink))]">
                        <ShoppingBag className="w-6 h-6" />
                        سلتك ({totalQty})
                    </SheetTitle>
                    <SheetDescription className="text-[hsl(var(--brand-ink))]/65">
                        راجع طلبك ثم تابع الإرسال عبر واتساب.
                    </SheetDescription>
                </SheetHeader>

                <div
                    className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
                    data-testid="cart-items-list"
                >
                    {items.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto rounded-full bg-[hsl(var(--brand-blue))]/15 flex items-center justify-center mb-4">
                                <ShoppingBag className="w-9 h-9 text-[hsl(var(--brand-blue-deep))]" />
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))]">
                                السلة فارغة
                            </h3>
                            <p className="text-sm text-[hsl(var(--brand-ink))]/60 mt-1">
                                أضف منتجاتك المفضلة وابدأ الطلب.
                            </p>
                        </div>
                    )}

                    {items.map((item) => (
                        <div
                            key={item.key}
                            data-testid={`cart-item-${item.key}`}
                            className="rounded-2xl bg-white border border-[hsl(var(--brand-ink))]/10 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-[hsl(var(--brand-ink))] leading-snug">
                                        {item.title}
                                    </div>
                                    {item.subtitle && (
                                        <div className="text-xs text-[hsl(var(--brand-ink))]/60 mt-0.5">
                                            {item.subtitle}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => remove(item.key)}
                                    aria-label="حذف"
                                    data-testid={`cart-remove-${item.key}`}
                                    className="text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-red))] transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="inline-flex items-center rounded-full border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/60 overflow-hidden">
                                    <button
                                        onClick={() => dec(item.key)}
                                        data-testid={`cart-dec-${item.key}`}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-[hsl(var(--brand-ink))]/5"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="min-w-[36px] text-center text-sm font-bold">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => inc(item.key)}
                                        data-testid={`cart-inc-${item.key}`}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-[hsl(var(--brand-ink))]/5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="text-base font-bold text-[hsl(var(--brand-blue-deep))]">
                                    {format(item.price * item.quantity)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-[hsl(var(--brand-ink))]/10 px-6 py-5 bg-white/70 backdrop-blur space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[hsl(var(--brand-ink))]/65">
                                الإجمالي
                            </span>
                            <span
                                className="text-2xl font-bold text-[hsl(var(--brand-ink))]"
                                data-testid="cart-total"
                            >
                                {format(totalPrice)}
                            </span>
                        </div>

                        <div className="rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 p-3 text-xs sm:text-sm text-[hsl(var(--brand-ink))]/85 leading-relaxed">
                            <strong className="text-[#1DA851]">
                                للطلب عبر واتساب
                            </strong>
                            : عند الضغط، راح يفتح واتساب مباشرة مع تفاصيل طلبك
                            جاهزة لإرسالها.
                        </div>

                        <button
                            onClick={handleCheckout}
                            data-testid="checkout-whatsapp-button"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full h-13 py-3.5 bg-[#25D366] text-white font-bold text-base hover:bg-[#1DA851] transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 wa-pulse" />
                            تابع الطلب عبر واتساب
                        </button>

                        <button
                            onClick={clear}
                            data-testid="clear-cart-button"
                            className="w-full text-xs text-[hsl(var(--brand-ink))]/50 hover:text-[hsl(var(--brand-red))] transition-colors"
                        >
                            تفريغ السلة
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
