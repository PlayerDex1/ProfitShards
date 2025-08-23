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
import { Trash2, Download, Upload, User, Calculator, Map, Settings, TestTube } from "lucide-react";
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
		{ id: 'test', label: 'Test', icon: TestTube },
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

					{/* Test - Funcionalidades Experimentais */}
					{activeTab === 'test' && (
						<div className="space-y-6">
							{/* Comparador de Cenários */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<span>⚖️</span>
										<span>Comparador de Cenários</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Cenário A */}
										<div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/30">
											<h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Cenário A</h3>
											<div className="space-y-2 text-sm">
												<div>Investment: $500</div>
												<div>Tokens: 2,500</div>
												<div className="font-bold text-blue-600">Lucro: $125.50</div>
											</div>
										</div>
										
										{/* Cenário B */}
										<div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/30">
											<h3 className="font-semibold text-green-700 dark:text-green-300 mb-3">Cenário B</h3>
											<div className="space-y-2 text-sm">
												<div>Investment: $300</div>
												<div>Tokens: 1,800</div>
												<div className="font-bold text-green-600">Lucro: $89.75</div>
											</div>
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											🧪 <strong>Experimental:</strong> Funcionalidade em desenvolvimento para comparar diferentes estratégias de investimento
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Metas de Lucro */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<span>🎯</span>
										<span>Metas de Lucro</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
											<div>
												<div className="font-medium">Meta Diária</div>
												<div className="text-sm text-muted-foreground">$100.00</div>
											</div>
											<div className="text-right">
												<div className="text-2xl font-bold text-green-600">75%</div>
												<div className="text-xs text-muted-foreground">Progresso</div>
											</div>
										</div>
										
										<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
											<div>
												<div className="font-medium">Meta Semanal</div>
												<div className="text-sm text-muted-foreground">$500.00</div>
											</div>
											<div className="text-right">
												<div className="text-2xl font-bold text-blue-600">42%</div>
												<div className="text-xs text-muted-foreground">Progresso</div>
											</div>
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											🧪 <strong>Experimental:</strong> Sistema de metas baseado no seu histórico de cálculos
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Simulador de Investimento */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<span>🔮</span>
										<span>Simulador "E se..."</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium">E se eu investir:</label>
												<div className="mt-1 p-2 border rounded bg-muted/30">
													<span className="font-mono">$750.00</span>
												</div>
											</div>
											<div>
												<label className="text-sm font-medium">Lucro estimado:</label>
												<div className="mt-1 p-2 border rounded bg-green-50 dark:bg-green-950/30">
													<span className="font-mono font-bold text-green-600">$187.75</span>
												</div>
											</div>
										</div>
										
										<div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border">
											<div className="text-sm">
												<strong>Análise:</strong> Aumentando o investimento em 50%, o lucro pode crescer ~49% baseado no seu padrão histórico
											</div>
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											🧪 <strong>Experimental:</strong> Simulações baseadas em machine learning do seu histórico
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Conquistas */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<span>🏆</span>
										<span>Conquistas</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
											<span className="text-2xl">🥇</span>
											<div>
												<div className="font-semibold text-yellow-700 dark:text-yellow-300">Primeiro Lucro</div>
												<div className="text-xs text-yellow-600 dark:text-yellow-400">Parabéns pelo primeiro cálculo lucrativo!</div>
											</div>
										</div>
										
										<div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-dashed">
											<span className="text-2xl opacity-50">🎯</span>
											<div>
												<div className="font-semibold text-muted-foreground">Estrategista</div>
												<div className="text-xs text-muted-foreground">Faça 10 cálculos (7/10)</div>
											</div>
										</div>
										
										<div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-dashed">
											<span className="text-2xl opacity-50">💎</span>
											<div>
												<div className="font-semibold text-muted-foreground">Mestre dos Tokens</div>
												<div className="text-xs text-muted-foreground">Alcance $1000 de lucro total</div>
											</div>
										</div>
										
										<div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-dashed">
											<span className="text-2xl opacity-50">📊</span>
											<div>
												<div className="font-semibold text-muted-foreground">Analista</div>
												<div className="text-xs text-muted-foreground">Use todas as seções de análise</div>
											</div>
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											🧪 <strong>Experimental:</strong> Sistema de conquistas para gamificar o uso da ferramenta
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Alertas de Preços */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<span>🔔</span>
										<span>Alertas de Preços</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium">Token Price Alert</label>
												<div className="flex items-center space-x-2">
													<span className="text-sm">Avisar quando ≥</span>
													<div className="px-2 py-1 border rounded bg-muted/30 font-mono text-sm">$0.0015</div>
												</div>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium">Gem Price Alert</label>
												<div className="flex items-center space-x-2">
													<span className="text-sm">Avisar quando ≤</span>
													<div className="px-2 py-1 border rounded bg-muted/30 font-mono text-sm">$0.007</div>
												</div>
											</div>
										</div>
										
										<div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
											<div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
												<span>💡</span>
												<span className="text-sm font-medium">Momento ideal para investir detectado!</span>
											</div>
										</div>
									</div>
									<div className="mt-4 p-3 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											🧪 <strong>Experimental:</strong> Notificações inteligentes baseadas em análise de mercado
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Exportar Relatórios */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<span>📄</span>
										<span>Exportar Relatórios</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										<Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
											<Download className="h-5 w-5" />
											<span className="text-sm">PDF Report</span>
										</Button>
										<Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
											<Download className="h-5 w-5" />
											<span className="text-sm">Excel Export</span>
										</Button>
									</div>
									<div className="mt-4 p-3 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											🧪 <strong>Experimental:</strong> Gere relatórios profissionais dos seus cálculos e análises
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}