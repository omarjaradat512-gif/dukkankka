import { MessageCircle, Instagram, ShieldCheck } from "lucide-react";
import { STORE } from "../data/products";
import { quickInquiry } from "../lib/whatsapp";

export const Footer = () => {
    return (
        <footer
            id="contact"
            data-testid="site-footer"
            className="relative bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-cream))] mt-16"
        >
            <div className="h-2 keffiyeh-pattern" />
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid md:grid-cols-3 gap-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src="/logo.png"
                            alt="شعار"
                            className="w-12 h-12 rounded-xl"
                        />
                        <div>
                            <div className="text-xl font-bold">
                                {STORE.name}
                            </div>
                            <div className="text-xs opacity-75">
                                {STORE.tagline}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">
                        منتجات رقمية أصلية، توصيل فوري، ودعم مباشر على واتساب.
                        الدفع يتم خارج الموقع بالاتفاق المباشر.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-75 mb-4">
                        تواصل
                    </h4>
                    <div className="space-y-3">
                        <button
                            onClick={() => quickInquiry("استفسار عام")}
                            data-testid="footer-whatsapp"
                            className="flex items-center gap-3 group"
                        >
                            <span className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </span>
                            <span className="text-sm">
                                واتساب: {STORE.whatsappDisplay}
                            </span>
                        </button>
                        <a
                            href={STORE.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="footer-instagram"
                            className="flex items-center gap-3 group"
                        >
                            <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Instagram className="w-4 h-4 text-white" />
                            </span>
                            <span className="text-sm">انستجرام</span>
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-75 mb-4">
                        ضماناتنا
                    </h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>حسابات أصلية وموثوقة 100%</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>تسليم فوري بعد التأكيد</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>دعم متابعة بعد الشراء</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-[hsl(var(--brand-cream))]/15">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-70">
                    <span>
                        © {new Date().getFullYear()} {STORE.name} — جميع الحقوق
                        محفوظة.
                    </span>
                    <span>صُنع بحب</span>
                </div>
            </div>
        </footer>
    );
};
