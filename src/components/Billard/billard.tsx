"use client";
import React from "react";

type Table = { id: number; running: boolean; startTime: number | null };
type BilliardState = { date: string; revenue: number; stations: Table[] };

const RATES: Record<number, number> = {
    1: 0.2,
    2: 0.2,
    3: 0.21,
    4: 0.25,
};

function todayKey(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Tunis",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function defaultState(): BilliardState {
    return {
        date: todayKey(),
        revenue: 0,
        stations: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, running: false, startTime: null })),
    };
}

async function fetchState(): Promise<BilliardState> {
    const res = await fetch("/api/billard", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load state");
    return (await res.json()) as BilliardState;
}

async function saveState(state: BilliardState): Promise<BilliardState> {
    const res = await fetch("/api/billard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error("Failed to save state");
    return (await res.json()) as BilliardState;
}

function formatHMS(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDateTimeTunis(ms: number): string {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Tunis",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(ms));
}

type Receipt = {
    tableId: number;
    startedAt: number;
    endedAt: number;
    durationMs: number;
    amountTND: number;
    ratePerMinute: number;
    dateKey: string;
};

function computeCost(ms: number, rate: number): number {
    return (ms / 60000) * rate;
}

function printReceipt(r: Receipt) {
    const w = window.open("", "_blank", "width=360,height=640");
    if (!w) return;
    const duration = formatHMS(r.durationMs);
    const started = formatDateTimeTunis(r.startedAt);
    const ended = formatDateTimeTunis(r.endedAt);
    const html = `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt</title>
        <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 12px; }
            .ticket { width: 280px; margin: 0 auto; border: 1px dashed #999; padding: 12px; }
            .center { text-align: center; }
            .muted { color: #555; font-size: 12px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; }
            .total { font-weight: 700; font-size: 16px; }
            hr { border: 0; border-top: 1px dashed #bbb; margin: 10px 0; }
        </style>
    </head>
    <body onload="window.print(); setTimeout(() => window.close(), 300);">
        <div class="ticket">
            <div class="center"><strong>Billiard Receipt</strong></div>
            <div class="center muted">Date: ${r.dateKey} (Africa/Tunis)</div>
            <hr />
            <div class="row"><span>Table</span><span>#${r.tableId}</span></div>
            <div class="row"><span>Start</span><span>${started}</span></div>
            <div class="row"><span>End</span><span>${ended}</span></div>
            <div class="row"><span>Duration</span><span>${duration}</span></div>
            <div class="row"><span>Rate</span><span>${r.ratePerMinute.toFixed(2)} TND / min</span></div>
            <hr />
            <div class="row total"><span>Total</span><span>${r.amountTND.toFixed(3)} TND</span></div>
            <div class="center muted">Thank you</div>
        </div>
    </body>
</html>`;
    w.document.write(html);
    w.document.close();
}

export default function Billard() {
    const [mounted, setMounted] = React.useState(false);
    const [state, setState] = React.useState<BilliardState>(defaultState);
    const [, setTick] = React.useState(0);
    const [receipt, setReceipt] = React.useState<Receipt | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const s = await fetchState();
                setState(s);
            } catch {
                setState(defaultState());
            } finally {
                setMounted(true);
            }
        };
        load();
    }, []);

    React.useEffect(() => {
        if (!mounted) return;
        const id = window.setInterval(() => setTick((t) => (t + 1) % 1_000_000), 1000);
        return () => window.clearInterval(id);
    }, [mounted]);

    const currentElapsed = (t: Table) => (t.running && t.startTime ? Date.now() - t.startTime : 0);

    const handleStart = async (id: number) => {
        const now = Date.now();
        const stations = state.stations.map((t) => (t.id === id ? { ...t, running: true, startTime: now } : t));
        const updated = { ...state, stations };
        setState(updated);
        try {
            await saveState(updated);
        } catch {}
    };

    const handleStop = async (id: number) => {
        const t = state.stations.find((s) => s.id === id);
        if (!t) return;
        const end = Date.now();
        let updated: BilliardState;
        let ticket: Receipt | null = null;
        if (!t.running || !t.startTime) {
            const stations = state.stations.map((s) => (s.id === id ? { ...s, running: false, startTime: null } : s));
            updated = { ...state, stations };
        } else {
            const elapsed = end - t.startTime;
            const rate = RATES[id] ?? 0.2;
            const cost = computeCost(elapsed, rate);
            const stations = state.stations.map((s) => (s.id === id ? { ...s, running: false, startTime: null } : s));
            updated = { ...state, stations, revenue: +(state.revenue + cost).toFixed(3) };
            ticket = {
                tableId: id,
                startedAt: t.startTime,
                endedAt: end,
                durationMs: elapsed,
                amountTND: +cost.toFixed(3),
                ratePerMinute: rate,
                dateKey: todayKey(),
            };
        }
        setState(updated);
        try {
            await saveState(updated);
        } catch {}
        if (ticket) setReceipt(ticket);
    };

    const manualReset = async () => {
        if (!mounted) return;
        if (!window.confirm("Reset all billiard tables and revenue?")) return;
        const reset = defaultState();
        setState(reset);
        try { await saveState(reset); } catch {}
    };

    if (!mounted) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-gray-200 rounded" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 bg-gray-100 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Receipt Modal */}
            {receipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 sm:p-8">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-semibold">Billiard Receipt</h2>
                            <button className="text-gray-500 hover:text-gray-700 text-xl" onClick={() => setReceipt(null)} aria-label="Close">✕</button>
                        </div>
                        <div className="text-base text-gray-600">Africa/Tunis</div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex justify-between text-lg"><span className="text-gray-500">Table</span><span className="font-medium">#{receipt.tableId}</span></div>
                            <div className="flex justify-between text-lg"><span className="text-gray-500">Start</span><span className="font-medium">{formatDateTimeTunis(receipt.startedAt)}</span></div>
                            <div className="flex justify-between text-lg"><span className="text-gray-500">End</span><span className="font-medium">{formatDateTimeTunis(receipt.endedAt)}</span></div>
                            <div className="flex justify-between text-lg"><span className="text-gray-500">Duration</span><span className="font-medium">{formatHMS(receipt.durationMs)}</span></div>
                            <div className="flex justify-between text-lg"><span className="text-gray-500">Rate</span><span className="font-medium">{receipt.ratePerMinute.toFixed(2)} TND / min</span></div>
                        </div>
                        <div className="mt-5 border-t pt-4 flex justify-between text-xl">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold">{receipt.amountTND.toFixed(3)} TND</span>
                        </div>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button className="px-4 py-2 rounded border bg-white hover:bg-gray-50 text-gray-700" onClick={() => setReceipt(null)}>Close</button>
                            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => receipt && printReceipt(receipt)}>Print</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Billiard Management</h1>
                    <p className="text-sm text-gray-500">4 tables • Rates: #1-2 (0.20), #3 (0.21), #4 (0.25) TND/min • Manual reset • Africa/Tunis</p>
                </div>
                <div className="flex items-stretch gap-3">
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 text-emerald-900 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-emerald-700">Total Revenue</div>
                        <div className="text-2xl font-semibold tabular-nums">{state.revenue.toFixed(3)} TND</div>
                    </div>
                    <button onClick={manualReset} className="px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm" title="Reset all tables & revenue">Reset</button>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {state.stations.map((t) => {
                    const elapsed = currentElapsed(t);
                    const rate = RATES[t.id] ?? 0.2;
                    const liveCost = computeCost(elapsed, rate);
                    return (
                        <div key={t.id} className={"group rounded-xl border p-4 shadow-sm transition-all " + (t.running ? "bg-gradient-to-b from-emerald-50 to-white border-emerald-200 ring-1 ring-emerald-100" : "bg-white hover:shadow-md") }>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-2xl font-bold tracking-tight">Table {t.id}</div>
                                <span className={"inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full " + (t.running ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600") }>
                                    <span className={"h-2 w-2 rounded-full " + (t.running ? "bg-emerald-500" : "bg-gray-400")}></span>
                                    {t.running ? "Running" : "Stopped"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-gray-500">Elapsed</div>
                                    <div className="font-mono tabular-nums text-3xl font-semibold">{formatHMS(elapsed)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Current Cost</div>
                                    <div className="text-2xl font-semibold">{liveCost.toFixed(3)} TND</div>
                                    <div className="text-[11px] text-gray-400">Rate: {rate.toFixed(2)} TND/min</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => handleStart(t.id)} disabled={t.running} className={"flex-1 px-3 py-2 rounded-lg text-white transition-colors " + (t.running ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700") } title="Start session">Start</button>
                                <button onClick={() => handleStop(t.id)} disabled={!t.running} className={"flex-1 px-3 py-2 rounded-lg text-white transition-colors " + (!t.running ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700") } title="Stop session">Stop</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
