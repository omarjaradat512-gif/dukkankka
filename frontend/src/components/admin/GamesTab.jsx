import { useState } from "react";
import { useStoreData } from "../../contexts/DataContext";
import {
    apiCreateGame,
    apiUpdateGame,
    apiDeleteGame,
    formatApiError,
} from "../../lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Save, X, Loader2, Search, Star, Eye, EyeOff } from "lucide-react";
import { Input, Field, Toggle, numOrNull } from "./_widgets";

const blank = () => ({
    id: "",
    name: "",
    sub: "",
    image: "",
    gradientFrom: "#222222",
    gradientTo: "#000000",
    four: "",
    five: "",
    available: true,
    bestSeller: false,
});

const toForm = (g) => ({
    ...g,
    four: g.four == null ? "" : String(g.four),
    five: g.five == null ? "" : String(g.five),
});

const toPayload = (f) => ({
    id: f.id.trim(),
    name: f.name.trim(),
    sub: f.sub || "",
    image: f.image || "",
    gradientFrom: f.gradientFrom || "#222222",
    gradientTo: f.gradientTo || "#000000",
    four: numOrNull(f.four),
    five: numOrNull(f.five),
    available: !!f.available,
    bestSeller: !!f.bestSeller,
});

export default function GamesTab({ onChanged }) {
    const { games } = useStoreData();
    const [editing, setEditing] = useState(null); // null | form data
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [busy, setBusy] = useState(false);

    const filtered = games.filter(
        (g) =>
            !search.trim() ||
            g.name.toLowerCase().includes(search.toLowerCase()) ||
            g.id.toLowerCase().includes(search.toLowerCase()),
    );

    const startNew = () => {
        setEditing(blank());
        setCreating(true);
    };

    const startEdit = (g) => {
        setEditing(toForm(g));
        setCreating(false);
    };

    const cancel = () => {
        setEditing(null);
        setCreating(false);
    };

    const onSave = async () => {
        if (!editing) return;
        const payload = toPayload(editing);
        if (!payload.id || !payload.name) {
            toast.error("الاسم والمعرّف مطلوبان");
            return;
        }
        setBusy(true);
        try {
            if (creating) {
                await apiCreateGame(payload);
                toast.success(`تمت إضافة "${payload.name}"`);
            } else {
                await apiUpdateGame(payload.id, payload);
                toast.success(`تم تحديث "${payload.name}"`);
            }
            cancel();
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setBusy(false);
        }
    };

    const onDelete = async (g) => {
        if (!window.confirm(`حذف "${g.name}"؟ لا يمكن التراجع.`)) return;
        setBusy(true);
        try {
            await apiDeleteGame(g.id);
            toast.success(`تم حذف "${g.name}"`);
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setBusy(false);
        }
    };

    const onQuickToggleAvailable = async (g) => {
        setBusy(true);
        try {
            await apiUpdateGame(g.id, { ...g, available: !g.available });
            toast.success(g.available ? "تم تعطيل اللعبة" : "تم تفعيل اللعبة");
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="games-tab" className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-[hsl(var(--brand-ink))]/10 px-4 py-3 card-elevated">
                <div className="flex-1 relative max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--brand-ink))]/40" />
                    <Input
                        data-testid="games-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن لعبة بالاسم أو ID..."
                        className="pr-9"
                    />
                </div>
                <button
                    onClick={startNew}
                    data-testid="add-game-button"
                    className="inline-flex items-center gap-2 rounded-full px-5 h-10 bg-[hsl(var(--brand-blue-deep))] text-white text-sm font-bold hover:bg-[hsl(var(--brand-ink))] transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    لعبة جديدة
                </button>
            </div>

            {/* Editor */}
            {editing && (
                <GameEditor
                    creating={creating}
                    busy={busy}
                    form={editing}
                    setForm={setEditing}
                    onSave={onSave}
                    onCancel={cancel}
                />
            )}

            {/* List */}
            <div className="grid gap-3">
                {filtered.length === 0 && (
                    <p className="text-center text-sm text-[hsl(var(--brand-ink))]/50 py-10">
                        لا توجد ألعاب
                    </p>
                )}
                {filtered.map((g) => (
                    <div
                        key={g.id}
                        data-testid={`game-row-${g.id}`}
                        className="rounded-2xl bg-white border border-[hsl(var(--brand-ink))]/10 p-3 sm:p-4 flex items-center gap-4 card-elevated"
                    >
                        <div
                            className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden relative"
                            style={{
                                background: `linear-gradient(135deg, ${g.gradientFrom} 0%, ${g.gradientTo} 100%)`,
                            }}
                        >
                            {g.image && (
                                <img
                                    src={g.image}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    dir="ltr"
                                    className="font-bold text-sm sm:text-base text-[hsl(var(--brand-ink))] latin-tight"
                                >
                                    {g.name}
                                </span>
                                {g.bestSeller && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ffd86b] text-[#3a2400] text-[10px] font-extrabold px-2 py-0.5">
                                        <Star className="w-3 h-3" />
                                        الأكثر مبيعاً
                                    </span>
                                )}
                                {!g.available && (
                                    <span className="rounded-full bg-[hsl(var(--brand-red))]/15 text-[hsl(var(--brand-red))] text-[10px] font-extrabold px-2 py-0.5">
                                        معطّلة
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-[hsl(var(--brand-ink))]/55 mt-0.5 flex flex-wrap gap-x-3">
                                <span dir="ltr">ID: {g.id}</span>
                                <span>PS4: {g.four == null ? "—" : `$${g.four}`}</span>
                                <span>PS5: {g.five == null ? "—" : `$${g.five}`}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => onQuickToggleAvailable(g)}
                                title={g.available ? "تعطيل" : "تفعيل"}
                                data-testid={`game-${g.id}-toggle-available`}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[hsl(var(--brand-cream))] text-[hsl(var(--brand-ink))]/65 hover:text-[hsl(var(--brand-ink))] transition-colors"
                            >
                                {g.available ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <EyeOff className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => startEdit(g)}
                                data-testid={`game-${g.id}-edit`}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[hsl(var(--brand-blue))]/20 text-[hsl(var(--brand-blue-deep))] transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(g)}
                                data-testid={`game-${g.id}-delete`}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[hsl(var(--brand-red))]/15 text-[hsl(var(--brand-red))] transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GameEditor({ creating, busy, form, setForm, onSave, onCancel }) {
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
        <div
            data-testid="game-editor"
            className="rounded-2xl bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] p-5 sm:p-6 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">
                    {creating ? "إضافة لعبة جديدة" : `تعديل ${form.name}`}
                </h3>
                <button
                    onClick={onCancel}
                    data-testid="game-editor-cancel"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Field label="المعرّف (ID) — فريد، إنجليزي">
                    <Input
                        data-testid="game-id-input"
                        value={form.id}
                        onChange={(e) => set("id", e.target.value)}
                        disabled={!creating}
                        dir="ltr"
                    />
                </Field>
                <Field label="اسم اللعبة">
                    <Input
                        data-testid="game-name-input"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        dir="ltr"
                    />
                </Field>
                <Field label="وصف قصير (sub-title)">
                    <Input
                        data-testid="game-sub-input"
                        value={form.sub}
                        onChange={(e) => set("sub", e.target.value)}
                        dir="ltr"
                    />
                </Field>

                <Field label="رابط صورة الغلاف">
                    <Input
                        data-testid="game-image-input"
                        value={form.image}
                        onChange={(e) => set("image", e.target.value)}
                        dir="ltr"
                        placeholder="/games/file.jpg أو https://..."
                    />
                </Field>
                <Field label="سعر PS4 ($)" hint="فاضي = غير متوفر">
                    <Input
                        data-testid="game-four-input"
                        value={form.four}
                        onChange={(e) => set("four", e.target.value)}
                        inputMode="decimal"
                        dir="ltr"
                    />
                </Field>
                <Field label="سعر PS5 ($)" hint="فاضي = غير متوفر">
                    <Input
                        data-testid="game-five-input"
                        value={form.five}
                        onChange={(e) => set("five", e.target.value)}
                        inputMode="decimal"
                        dir="ltr"
                    />
                </Field>

                <Field label="لون تدرج (من)">
                    <Input
                        data-testid="game-gradient-from-input"
                        value={form.gradientFrom}
                        onChange={(e) => set("gradientFrom", e.target.value)}
                        dir="ltr"
                        placeholder="#1c5e3a"
                    />
                </Field>
                <Field label="لون تدرج (إلى)">
                    <Input
                        data-testid="game-gradient-to-input"
                        value={form.gradientTo}
                        onChange={(e) => set("gradientTo", e.target.value)}
                        dir="ltr"
                        placeholder="#0f2e1c"
                    />
                </Field>

                <div className="flex items-end gap-2 flex-wrap">
                    <Toggle
                        checked={form.available}
                        onChange={(v) => set("available", v)}
                        testId="game-available-toggle"
                        label={form.available ? "متوفرة" : "غير متوفرة"}
                    />
                    <Toggle
                        checked={form.bestSeller}
                        onChange={(v) => set("bestSeller", v)}
                        testId="game-bestseller-toggle"
                        label="الأكثر مبيعاً"
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-2 rounded-full px-5 h-10 bg-white/10 hover:bg-white/20 text-sm font-bold"
                >
                    إلغاء
                </button>
                <button
                    onClick={onSave}
                    disabled={busy}
                    data-testid="game-editor-save"
                    className="inline-flex items-center gap-2 rounded-full px-6 h-10 bg-[#7CFF8A] text-[hsl(var(--brand-ink))] text-sm font-bold hover:bg-[#9affa6] disabled:opacity-50"
                >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ
                </button>
            </div>
        </div>
    );
}
