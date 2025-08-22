import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { getCurrentUsername, useAuth } from "@/hooks/use-auth";
import { HistoryItem } from "@/types/calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { EquipmentPanel } from "@/components/equipment/EquipmentPanel";
import { MapPlanner } from "@/components/MapPlanner";
import { Link } from "wouter";
import { MapMetrics } from "@/components/MapMetrics";
import { Results } from "@/components/Results";
import { useCalculator } from "@/hooks/use-calculator";
import { BackupPanel } from "@/components/BackupPanel";
import { Trash2, Download, Upload, User, Calculator, Map, Settings } from "lucide-react";

export default function Profile() {
	const { t } = useI18n();
	const { user, isAuthenticated } = useAuth();
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const { session, totalLuck, updateEquipment } = useEquipment();
	const { results, breakdown } = useCalculator();
	const [activeTab, setActiveTab] = useState('history');
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

	const tabs = [
		{ id: 'history', label: 'Histórico', icon: Calculator },
		{ id: 'planner', label: 'Planejador', icon: Map },
		{ id: 'equipment', label: 'Equipamentos', icon: Settings },
		{ id: 'backup', label: 'Backup', icon: Download },
	];

	return (
		<div className="min-h-screen bg-background">
			<Header />
			
			<main className="container mx-auto px-4 py-6">
				{/* Profile Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
								<User className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-foreground">
									{isAuthenticated ? `Perfil de ${user}` : t('profile.title')}
								</h1>
								<p className="text-muted-foreground">
									{isAuthenticated 
										? 'Dados salvos na nuvem automaticamente'
										: 'Dados salvos localmente no navegador'
									}
								</p>
							</div>
						</div>
						<Link href="/" className="text-primary hover:text-primary/80 underline">
							{t('nav.backToMain')}
						</Link>
					</div>
				</div>

				{/* Tabs Navigation */}
				<Card className="mb-6">
					<CardContent className="p-4">
						<div className="flex flex-wrap gap-2">
							{tabs.map(tab => {
								const Icon = tab.icon;
								return (
									<Button
										key={tab.id}
										variant={activeTab === tab.id ? "default" : "ghost"}
										size="sm"
										onClick={() => setActiveTab(tab.id)}
										className="flex items-center space-x-2"
									>
										<Icon className="h-4 w-4" />
										<span>{tab.label}</span>
									</Button>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Tab Content */}
				<div className="space-y-6">
					{/* Histórico de Cálculos */}
					{activeTab === 'history' && (
						<>
							{/* Current Results */}
							{results && (
								<Results
									results={results}
									breakdown={breakdown}
									formData={undefined}
									totalLuck={totalLuck}
									visible={resultsVisible}
									onChangeVisibility={(section, value) => setResultsVisible((v) => ({ ...v, [section]: value }))}
								/>
							)}

							{/* History */}
							<Card>
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-foreground">
										Histórico de Cálculos ({history.length})
									</CardTitle>
									{history.length > 0 && (
										<Button
											variant="destructive"
											size="sm"
											onClick={clearAllHistory}
											className="flex items-center space-x-1"
										>
											<Trash2 className="h-4 w-4" />
											<span>Limpar Tudo</span>
										</Button>
									)}
								</CardHeader>
								<CardContent>
									{history.length === 0 ? (
										<div className="text-center py-8">
											<Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
											<p className="text-muted-foreground">{t('results.no_history')}</p>
											<p className="text-sm text-muted-foreground mt-1">
												Faça alguns cálculos na página inicial para ver o histórico aqui
											</p>
										</div>
									) : (
										<div className="space-y-3">
											{history.slice().reverse().map((item, revIndex) => {
												const idx = history.length - 1 - revIndex;
												const isProfit = item.results.finalProfit > 0;
												return (
													<Card key={idx} className="border-border">
														<CardContent className="p-4">
															<div className="flex justify-between items-start">
																<div className="space-y-2">
																	<div className="flex items-center space-x-3">
																		<div className={`text-2xl font-bold font-mono ${isProfit ? 'text-profit' : 'text-loss'}`}>
																			${item.results.finalProfit.toFixed(2)}
																		</div>
																		<div className={`text-sm px-2 py-1 rounded ${isProfit ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
																			ROI: {item.results.roi.toFixed(1)}%
																		</div>
																	</div>
																	<div className="text-sm text-muted-foreground">
																		<div>Investimento: ${item.formData.investment.toFixed(2)}</div>
																		<div>Tokens: {item.results.totalTokens} | Gemas: {item.formData.gemsConsumed}</div>
																	</div>
																	<div className="text-xs text-muted-foreground">
																		{new Date(item.timestamp).toLocaleString('pt-BR')}
																	</div>
																</div>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => removeHistoryItem(idx)}
																	className="text-muted-foreground hover:text-destructive"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														</CardContent>
													</Card>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</>
					)}

					{/* Planejador de Mapas */}
					{activeTab === 'planner' && (
						<>
							<MapPlanner />
							<MapMetrics />
						</>
					)}

					{/* Equipamentos */}
					{activeTab === 'equipment' && (
						<EquipmentPanel 
							session={session}
							onUpdateEquipment={updateEquipment}
							totalLuck={totalLuck}
						/>
					)}

					{/* Backup */}
					{activeTab === 'backup' && (
						<BackupPanel />
					)}
				</div>
			</main>
		</div>
	);
}