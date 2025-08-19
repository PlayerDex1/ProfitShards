import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { useEffect, useState, lazy, Suspense } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { HistoryItem } from "@/types/calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { EquipmentPanel } from "@/components/equipment/EquipmentPanel";
import { MapPlanner } from "@/components/MapPlanner";
import { Link } from "wouter";
import { MapMetrics } from "@/components/MapMetrics";
const Results = lazy(() => import("@/components/Results").then(m => ({ default: m.Results })));
import { useCalculator } from "@/hooks/use-calculator";
import { BackupPanel } from "@/components/BackupPanel";

export default function Profile() {
	const { t } = useI18n();
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const { session, totalLuck, updateEquipment } = useEquipment();
	const { results, breakdown } = useCalculator();
	const [visible, setVisible] = useState({
		summary: true,
		distribution: true,
		efficiency: true,
		sensitivity: true,
		performance: true,
	});

	const allOn = visible.summary && visible.distribution && visible.efficiency && visible.sensitivity && visible.performance;

	const toggleAll = () => {
		const next = !allOn;
		setVisible({ summary: next, distribution: next, efficiency: next, sensitivity: next, performance: next });
	};

	useEffect(() => {
		try {
			const raw = localStorage.getItem('worldshards-visibility-profile');
			if (raw) setVisible(prev => ({ ...prev, ...JSON.parse(raw) }));
		} catch {}
	}, []);

	useEffect(() => {
		try { localStorage.setItem('worldshards-visibility-profile', JSON.stringify(visible)); } catch {}
	}, [visible]);

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

	return (
		<div className="min-h-screen text-white" style={{ background: 'linear-gradient(rgba(20,184,166,0.12), rgba(20,184,166,0.12))' }}>
			<Header />
			<main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
				<div className="flex justify-end">
					<Link href="/" className="text-white/90 underline">Voltar ao Menu Principal</Link>
				</div>

				{/* Map Planner ocupa linha inteira */}
				<MapPlanner />

				{/* Métricas abaixo */}
				<MapMetrics />

				{/* Métricas da Calculadora (sem histórico) */}
				<Suspense fallback={<div className="text-white/80">Carregando métricas…</div>}>
					<Results results={results} breakdown={breakdown} visible={visible} onChangeVisibility={(section, value) => setVisible(s => ({ ...s, [section]: value }))} />
				</Suspense>

				<BackupPanel />

				<Card className="bg-black/50 border-white/10">
					<CardHeader className="py-4">
						<CardTitle className="text-lg">Equipamento</CardTitle>
					</CardHeader>
					<CardContent>
						<EquipmentPanel session={session} totalLuck={totalLuck} onEquipmentChange={updateEquipment} />
					</CardContent>
				</Card>

				<Card className="bg-black/50 border-white/10">
					<CardHeader className="py-4">
						<CardTitle className="text-lg">Histórico do Usuário</CardTitle>
					</CardHeader>
					<CardContent>
						{history.length === 0 ? (
							<p className="text-white/70 text-sm">{t('results.no_history')}</p>
						) : (
							<div className="space-y-2">
								{history.slice(-10).reverse().map((item, i) => (
									<div key={i} className="border border-white/10 rounded-lg p-3 bg-white/5">
										<div className="flex justify-between items-center">
											<div className="font-mono text-white">${item.results.finalProfit.toFixed(2)}</div>
											<div className="text-white/70 text-xs">{new Date(item.timestamp).toLocaleString()}</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}