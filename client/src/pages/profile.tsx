import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { HistoryItem } from "@/types/calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { EquipmentPanel } from "@/components/equipment/EquipmentPanel";
import { MapPlanner } from "@/components/MapPlanner";
import { Link } from "wouter";

export default function Profile() {
	const { prefs, save } = usePreferences();
	const { t } = useI18n();
	const [mapSize, setMapSize] = useState(prefs.mapSize);
	const [loadsPerMap, setLoadsPerMap] = useState<number>(prefs.loadsPerMap);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const { session, totalLuck, updateEquipment } = useEquipment();

	useEffect(() => {
		setMapSize(prefs.mapSize);
		setLoadsPerMap(prefs.loadsPerMap);
	}, [prefs]);

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
		<div className="min-h-screen text-white" style={{ background: 'rgba(0,0,0,0.45)' }}>
			<Header />
			<main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
				<div className="flex justify-end">
					<Link href="/" className="text-white/90 underline">Voltar ao Menu Principal</Link>
				</div>
				<Card className="bg-black/50 border-white/10">
					<CardHeader className="py-4">
						<CardTitle className="text-lg">Perfil</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="text-xs text-white/70 mb-1 block">Tamanho do mapa</label>
							<Input value={mapSize} onChange={(e) => setMapSize(e.target.value)} className="bg-white/10 border-white/20 text-white h-9" placeholder="ex.: Médio / Grande" />
						</div>
						<div>
							<label className="text-xs text-white/70 mb-1 block">Cargas por mapa</label>
							<Input type="number" value={loadsPerMap} onChange={(e) => setLoadsPerMap(parseInt(e.target.value || '0'))} className="bg-white/10 border-white/20 text-white h-9" />
						</div>
						<div className="md:col-span-2">
							<Button className="bg-white text-black hover:bg-white/90 h-9 px-4" onClick={() => save({ mapSize, loadsPerMap })}>Salvar Preferências</Button>
						</div>
					</CardContent>
				</Card>

				{/* Planejador de mapa */}
				<MapPlanner onApply={(tokens, loads) => { /* Mantém edição na calculadora via usuário */ }} />

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