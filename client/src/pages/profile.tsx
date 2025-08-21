import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { HistoryItem } from "@/types/calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { EquipmentPanel } from "@/components/equipment/EquipmentPanel";
import { MapPlanner } from "@/components/MapPlanner";
import { Link } from "wouter";
import { MapMetrics } from "@/components/MapMetrics";
import { Results } from "@/components/Results";
import { useCalculator } from "@/hooks/use-calculator";
import { BackupPanel } from "@/components/BackupPanel";

export default function Profile() {
	const { t } = useI18n();
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const { session, totalLuck, updateEquipment } = useEquipment();
	const { results, breakdown } = useCalculator();
	const [resultsVisible, setResultsVisible] = useState({
		summary: true,
		distribution: true,
		efficiency: true,
		sensitivity: true,
		performance: true,
	});

	useEffect(() => {
		const load = () => {
			const key = `worldshards-history-${getCurrentUsername() ?? 'guest'}`;
			const raw = localStorage.getItem(key);
			setHistory(raw ? JSON.parse(raw) : []);
		};
		load();
		const onUpd = () => load();
		window.addEventListener('worldshards-history-updated', onUpd);
		window.addEventListener('worldshards-auth-updated', onUpd);
		return () => {
			window.removeEventListener('worldshards-history-updated', onUpd);
			window.removeEventListener('worldshards-auth-updated', onUpd);
		};
	}, []);

	const removeHistoryItem = (idx: number) => {
		const username = getCurrentUsername() ?? 'guest';
		const key = `worldshards-history-${username}`;
		const next = history.filter((_, i) => i !== idx);
		localStorage.setItem(key, JSON.stringify(next));
		setHistory(next);
		window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
	};

	const clearAllHistory = () => {
		const username = getCurrentUsername() ?? 'guest';
		const key = `worldshards-history-${username}`;
		localStorage.removeItem(key);
		setHistory([]);
		window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
	};

	return (
		<div className="min-h-screen text-white" style={{ background: 'linear-gradient(rgba(20,184,166,0.12), rgba(20,184,166,0.12))' }}>
			<Header />
			<main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
				<div className="flex justify-end">
					<Link href="/" className="text-white/90 underline">{t('nav.backToMain')}</Link>
				</div>

				{/* Map Planner ocupa linha inteira */}
				<MapPlanner />

				{/* Métricas abaixo */}
				<MapMetrics />

				{/* Métricas da Calculadora (sem histórico) */}
				<Results
					results={results}
					breakdown={breakdown}
					visible={resultsVisible}
					onChangeVisibility={(section, value) => setResultsVisible((v) => ({ ...v, [section]: value }))}
				/>

				<BackupPanel />

				<Card className="bg-black/50 border-white/10">
					<CardHeader className="py-4 flex items-center justify-between">
						<CardTitle className="text-lg">Histórico do Usuário</CardTitle>
						{history.length > 0 && (
							<button onClick={clearAllHistory} className="text-xs bg-white/10 text-white px-2 py-1 rounded">Limpar tudo</button>
						)}
					</CardHeader>
					<CardContent>
						{history.length === 0 ? (
							<p className="text-white/70 text-sm">{t('results.no_history')}</p>
						) : (
							<div className="space-y-2">
								{history.slice().reverse().map((item, revIndex) => {
									const idx = history.length - 1 - revIndex;
									return (
										<div key={idx} className="border border-white/10 rounded-lg p-3 bg-white/5">
											<div className="flex justify-between items-center">
												<div className="font-mono text-white">${item.results.finalProfit.toFixed(2)}</div>
												<div className="text-white/70 text-xs">{new Date(item.timestamp).toLocaleString()}</div>
											</div>
											<div className="mt-2 flex justify-end">
												<button onClick={() => removeHistoryItem(idx)} className="text-xs bg-white/10 text-white px-2 py-1 rounded">Excluir</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}