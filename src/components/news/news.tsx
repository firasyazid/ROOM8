"use client";
import React from "react";

type Station = {
	id: number;
	running: boolean;
	startTime: number | null; // epoch ms
	playerCount?: 2 | 4 | null;
	ratePerMinute?: number | null;
};

type AppState = {
	date: string; // YYYY-MM-DD for daily reset
	revenue: number; // total revenue for the day
	stations: Station[];
};

function getRateFor(stationId: number, players: 2 | 4): number {
	const isGroupA = [1, 2, 3, 7].includes(stationId);
	if (players === 2) return isGroupA ? 0.12 : 0.15;
	return isGroupA ? 0.20 : 0.25;
}

type Receipt = {
	stationId: number;
	startedAt: number; // epoch ms
	endedAt: number; // epoch ms
	durationMs: number;
	amountTND: number;
	dateKey: string; // Africa/Tunis YYYY-MM-DD
	playerCount: 2 | 4;
	ratePerMinute: number;
};
function todayKey(): string {
	// Africa/Tunis timezone, YYYY-MM-DD using en-CA locale
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Africa/Tunis",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

function defaultState(): AppState {
	return {
		date: todayKey(),
		revenue: 0,
		stations: Array.from({ length: 7 }, (_, i) => ({
			id: i + 1,
			running: false,
			startTime: null,
            playerCount: null,
            ratePerMinute: null,
		})),
	};
}

async function fetchServerState(): Promise<AppState> {
	const res = await fetch("/api/game-room", { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to load state");
	return (await res.json()) as AppState;
}

async function saveServerState(state: AppState): Promise<AppState> {
	const res = await fetch("/api/game-room", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(state),
	});
	if (!res.ok) throw new Error("Failed to save state");
	return (await res.json()) as AppState;
}

function formatHMS(ms: number): string {
	if (ms < 0 || !Number.isFinite(ms)) return "00:00:00";
	const totalSeconds = Math.floor(ms / 1000);
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	const hh = String(h).padStart(2, "0");
	const mm = String(m).padStart(2, "0");
	const ss = String(s).padStart(2, "0");
	return `${hh}:${mm}:${ss}`;
}

function computeCost(ms: number, ratePerMinute: number): number {
	const minutes = ms / 60000; // ms to minutes
	const cost = minutes * ratePerMinute;
	// Keep 3 decimals for display; store full precision
	return cost;
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

function printReceipt(receipt: Receipt) {
	const w = window.open("", "_blank", "width=360,height=640");
	if (!w) return;
	const duration = formatHMS(receipt.durationMs);
	const started = formatDateTimeTunis(receipt.startedAt);
	const ended = formatDateTimeTunis(receipt.endedAt);
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
			<div class="center"><strong>Game Room Receipt</strong></div>
			<div class="center muted">Date: ${receipt.dateKey} (Africa/Tunis)</div>
			<hr />
			<div class="row"><span>Station</span><span>#${receipt.stationId}</span></div>
			<div class="row"><span>Start</span><span>${started}</span></div>
			<div class="row"><span>End</span><span>${ended}</span></div>
			<div class="row"><span>Duration</span><span>${duration}</span></div>
			<div class="row"><span>Players</span><span>${receipt.playerCount}</span></div>
			<div class="row"><span>Rate</span><span>${receipt.ratePerMinute.toFixed(2)} TND / min</span></div>
			<hr />
			<div class="row total"><span>Total</span><span>${receipt.amountTND.toFixed(3)} TND</span></div>
			<div class="center muted">Thank you</div>
		</div>
	</body>
 </html>`;
	w.document.write(html);
	w.document.close();
}

export default function News() {
	const [mounted, setMounted] = React.useState(false);
	const [state, setState] = React.useState<AppState>(defaultState);
	// Ticker to trigger re-render each second for live timers
	const [, setTick] = React.useState(0);
	const [receipt, setReceipt] = React.useState<Receipt | null>(null);
	const [startSelection, setStartSelection] = React.useState<{ stationId: number } | null>(null);

		React.useEffect(() => {
			const load = async () => {
				try {
					const s = await fetchServerState();
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
		const id = window.setInterval(() => setTick((t) => (t + 1) % 1000000), 1000);
		return () => window.clearInterval(id);
	}, [mounted]);

		const openPlayerSelect = (stationId: number) => {
			setStartSelection({ stationId });
		};

		const handleStartWithPlayers = async (stationId: number, players: 2 | 4) => {
			const now = Date.now();
			const rate = getRateFor(stationId, players);
			const stations = state.stations.map((st) =>
				st.id === stationId
					? { ...st, running: true, startTime: now, playerCount: players, ratePerMinute: rate }
					: st
			);
			const updated: AppState = { ...state, stations };
			setState(updated);
			setStartSelection(null);
			try {
				await saveServerState(updated);
			} catch {
				// ignore network errors for now
			}
		};

	const handleStop = async (stationId: number) => {
			const st = state.stations.find((s) => s.id === stationId);
			if (!st) return;
			const end = Date.now();
			let updated: AppState;
			let receiptToShow: Receipt | null = null;
			if (!st.running || !st.startTime) {
				const stations = state.stations.map((s) => (s.id === stationId ? { ...s, running: false, startTime: null } : s));
				updated = { ...state, stations };
			} else {
				const elapsed = end - st.startTime;
			const activeRate = (st.ratePerMinute && Number.isFinite(st.ratePerMinute)) ? (st.ratePerMinute as number) : getRateFor(stationId, 2);
			const sessionCost = computeCost(elapsed, activeRate);
					const stations = state.stations.map((s) => (s.id === stationId ? { ...s, running: false, startTime: null, playerCount: null, ratePerMinute: null } : s));
				updated = { ...state, stations, revenue: +(state.revenue + sessionCost).toFixed(3) };
				receiptToShow = {
					stationId,
					startedAt: st.startTime,
					endedAt: end,
					durationMs: elapsed,
					amountTND: +sessionCost.toFixed(3),
						dateKey: todayKey(),
	                    playerCount: (st.playerCount === 2 || st.playerCount === 4) ? (st.playerCount as 2 | 4) : 2,
	                    ratePerMinute: activeRate,
				};
			}
			setState(updated);
			try {
				await saveServerState(updated);
			} catch {
				// ignore
			}
			if (receiptToShow) setReceipt(receiptToShow);
		};

		const manualReset = async () => {
			if (!mounted) return;
			const confirmReset = window.confirm("Reset all stations and revenue? This cannot be undone.");
			if (!confirmReset) return;
			const reset = defaultState();
			setState(reset);
			try {
				await saveServerState(reset);
			} catch {
				// ignore persist errors
			}
		};

	const currentElapsed = (st: Station): number => {
		if (!st.running || !st.startTime) return 0;
		return Date.now() - st.startTime;
	};



	if (!mounted) {
		return (
			<div className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-64 bg-gray-200 rounded" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
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
							<h2 className="text-2xl font-semibold">Session Receipt</h2>
							<button
								className="text-gray-500 hover:text-gray-700 text-xl"
								onClick={() => setReceipt(null)}
								aria-label="Close"
							>
								✕
							</button>
						</div>
						<div className="text-base text-gray-600">Africa/Tunis</div>
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="flex justify-between text-lg"><span className="text-gray-500">Station</span><span className="font-medium">#{receipt.stationId}</span></div>
							<div className="flex justify-between text-lg"><span className="text-gray-500">Start</span><span className="font-medium">{formatDateTimeTunis(receipt.startedAt)}</span></div>
							<div className="flex justify-between text-lg"><span className="text-gray-500">End</span><span className="font-medium">{formatDateTimeTunis(receipt.endedAt)}</span></div>
							<div className="flex justify-between text-lg"><span className="text-gray-500">Duration</span><span className="font-medium">{formatHMS(receipt.durationMs)}</span></div>
							<div className="flex justify-between text-lg"><span className="text-gray-500">Players</span><span className="font-medium">{receipt.playerCount}</span></div>
							<div className="flex justify-between text-lg"><span className="text-gray-500">Rate</span><span className="font-medium">{receipt.ratePerMinute.toFixed(2)} TND / min</span></div>
						</div>
						<div className="mt-5 border-t pt-4 flex justify-between text-xl">
							<span className="font-semibold">Total</span>
							<span className="font-bold">{receipt.amountTND.toFixed(3)} TND</span>
						</div>
						<div className="mt-6 flex gap-3 justify-end">
							<button
								className="px-4 py-2 rounded border bg-white hover:bg-gray-50 text-gray-700"
								onClick={() => setReceipt(null)}
							>
								Close
							</button>
							<button
								className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
								onClick={() => receipt && printReceipt(receipt)}
							>
								Print
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Player Select Modal */}
			{startSelection && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
					<div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h2 className="text-xl font-semibold">Select Players</h2>
								<p className="text-sm text-gray-500">Station #{startSelection.stationId}</p>
							</div>
							<button
								className="text-gray-500 hover:text-gray-700 text-xl"
								onClick={() => setStartSelection(null)}
								aria-label="Close"
							>
								✕
							</button>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<button
								className="px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow"
								onClick={() => handleStartWithPlayers(startSelection.stationId, 2)}
							>
								2 Players
							</button>
							<button
								className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
								onClick={() => handleStartWithPlayers(startSelection.stationId, 4)}
							>
								4 Players
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Top Bar */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Game Room Management</h1>
					<p className="text-sm text-gray-500">File storage (data.json) • Manual reset • Africa/Tunis</p>
				</div>
				<div className="flex items-stretch gap-3">
					<div className="px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 text-emerald-900 shadow-sm">
						<div className="text-xs uppercase tracking-wide text-emerald-700">Total Revenue Today</div>
						<div className="text-2xl font-semibold tabular-nums">{state.revenue.toFixed(3)} TND</div>
					</div>
					<button
						onClick={manualReset}
						className="px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm"
						title="Reset all stations and revenue"
					>
						Reset
					</button>
				</div>
			</div>

			{/* Stations Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{state.stations.map((st) => {
					const elapsed = currentElapsed(st);
					const liveCost = computeCost(elapsed, (st.ratePerMinute ?? getRateFor(st.id, 2)));
					return (
						<div
							key={st.id}
							className={
								"group rounded-xl border p-4 shadow-sm transition-all " +
								(st.running
									? "bg-gradient-to-b from-emerald-50 to-white border-emerald-200 ring-1 ring-emerald-100"
									: "bg-white hover:shadow-md")
							}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="text-2xl font-bold tracking-tight">Station {st.id}</div>
								<span
									className={
										"inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full " +
										(st.running
											? "bg-emerald-100 text-emerald-700"
											: "bg-gray-100 text-gray-600")
									}
								>
									<span className={"h-2 w-2 rounded-full " + (st.running ? "bg-emerald-500" : "bg-gray-400")}></span>
									{st.running ? "Running" : "Stopped"}
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
									<div className="text-[11px] text-gray-400">Rate: {(st.ratePerMinute ?? getRateFor(st.id, 2)).toFixed(2)} TND/min{st.playerCount ? ` • Players: ${st.playerCount}` : ''}</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<button
										onClick={() => openPlayerSelect(st.id)}
									disabled={st.running}
									className={
										"flex-1 px-3 py-2 rounded-lg text-white transition-colors " +
										(st.running
											? "bg-emerald-300 cursor-not-allowed"
											: "bg-emerald-600 hover:bg-emerald-700")
									}
									title="Start session"
								>
									Start
								</button>
								<button
									onClick={() => handleStop(st.id)}
									disabled={!st.running}
									className={
										"flex-1 px-3 py-2 rounded-lg text-white transition-colors " +
										(!st.running ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700")
									}
									title="Stop session"
								>
									Stop
								</button>
							</div>
						</div>
					);
				})}
			</div>

			 
		</div>
	);
}

 