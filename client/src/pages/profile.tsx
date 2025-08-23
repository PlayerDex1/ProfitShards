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
import { getHistoryCached, deleteHistoryItem, clearHistoryRemote } from "@/lib/historyApi";

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
			setHistory(getHistoryCached());
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
		// idx é o índice original (não o reverso), então podemos usar diretamente
		const item = history[idx];
		if (item) {
			deleteHistoryItem(item.timestamp);
		}
	};

	const clearAllHistory = () => {
		clearHistoryRemote();
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
										<>
											{/* Estatísticas Resumidas */}
											<div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
												<h3 className="text-lg font-semibold text-foreground mb-3">📊 Resumo Estatístico</h3>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
													<div className="text-center">
														<div className="text-2xl font-bold text-foreground">
															{history.length}
														</div>
														<div className="text-sm text-muted-foreground">Cálculos</div>
													</div>
													<div className="text-center">
														<div className={`text-2xl font-bold ${history.filter(h => h.results.finalProfit > 0).length > history.length / 2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
															${(history.reduce((sum, h) => sum + h.results.finalProfit, 0) / history.length).toFixed(2)}
														</div>
														<div className="text-sm text-muted-foreground">Lucro Médio</div>
													</div>
													<div className="text-center">
														<div className="text-2xl font-bold text-green-600 dark:text-green-400">
															${Math.max(...history.map(h => h.results.finalProfit)).toFixed(2)}
														</div>
														<div className="text-sm text-muted-foreground">Melhor Lucro</div>
													</div>
													<div className="text-center">
														<div className="text-2xl font-bold text-foreground">
															{((history.filter(h => h.results.finalProfit > 0).length / history.length) * 100).toFixed(0)}%
														</div>
														<div className="text-sm text-muted-foreground">Taxa Sucesso</div>
													</div>
												</div>
											</div>

											{/* Lista do Histórico */}
											<div className="space-y-3 max-h-96 overflow-auto">
											{history.slice().reverse().map((item, revIndex) => {
												const idx = history.length - 1 - revIndex;
												const isProfit = item.results.finalProfit > 0;
												const date = new Date(item.timestamp);
												const dateStr = date.toLocaleDateString('pt-BR');
												const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
												
												return (
													<Card key={idx} className="border-border hover:bg-muted/30 transition-colors">
														<CardContent className="p-4">
															<div className="flex justify-between items-start">
																<div className="flex-1 space-y-2">
																	{/* Profit destacado */}
																	<div className="flex items-center justify-between">
																		<div className={`text-2xl font-bold font-mono ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
																			{isProfit ? '+' : ''}${item.results.finalProfit.toFixed(2)}
																		</div>
																		<div className={`text-sm px-2 py-1 rounded-full font-medium ${isProfit ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
																			ROI: {item.results.roi.toFixed(1)}%
																		</div>
																	</div>
																	
																	{/* Data e hora destacadas */}
																	<div className="flex items-center space-x-4 text-sm">
																		<div className="flex items-center space-x-2 text-foreground font-medium">
																			<span>📅</span>
																			<span>{dateStr}</span>
																		</div>
																		<div className="flex items-center space-x-2 text-foreground font-medium">
																			<span>🕒</span>
																			<span>{timeStr}</span>
																		</div>
																	</div>
																	
																	{/* Detalhes do cálculo */}
																	<div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
																		<div>
																			<span className="font-medium">Investimento:</span> ${item.formData.investment.toFixed(2)}
																		</div>
																		<div>
																			<span className="font-medium">Tokens:</span> {item.results.totalTokens.toLocaleString()}
																		</div>
																		<div>
																			<span className="font-medium">Gemas:</span> {item.formData.gemsConsumed}
																		</div>
																		<div>
																			<span className="font-medium">Eficiência:</span> {item.results.efficiency.toFixed(1)}/load
																		</div>
																	</div>
																</div>
																
																{/* Botão de deletar */}
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => removeHistoryItem(idx)}
																	className="text-muted-foreground hover:text-destructive ml-4"
																	title="Remover este cálculo"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														</CardContent>
													</Card>
												);
											})}
											</div>
										</>
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