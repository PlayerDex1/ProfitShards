import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { getCurrentUsername, useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { HistoryItem } from "@/types/calculator";
// Removido: useEquipment e EquipmentPanel - simplificando interface
import { MapPlanner } from "@/components/MapPlanner";
import { Link } from "wouter";
import { MapMetrics } from "@/components/MapMetrics";
import { Results } from "@/components/Results";
import { useCalculator } from "@/hooks/use-calculator";
import { Calculator as CalculatorComponent } from "@/components/Calculator";
import { Trash2, Download, Upload, User, Calculator, Map, Gift, Activity, Crown } from "lucide-react";
import { getHistoryCached, deleteHistoryItem, clearHistoryRemote } from "@/lib/historyApi";
import { ModernHistoryDisplay } from "@/components/ModernHistoryDisplay";
import { ActivityStream } from "@/components/ActivityStream";
import { GiveawayBanner } from "@/components/GiveawayBanner";
import { UltimateAdminDashboard } from "@/components/UltimateAdminDashboard";
import { EnhancedAdminDashboard } from "@/components/EnhancedAdminDashboard";
import { GiveawayModal } from "@/components/GiveawayModal";
import { useGiveaway } from "@/hooks/use-giveaway";

export default function Profile() {
	const { t } = useI18n();
	const { user, userProfile, isAuthenticated } = useAuth();
	const [location] = useLocation();
	// Removido: useEquipment - simplificando interface
	const { formData, results, breakdown, updateFormData, saveToHistory, history } = useCalculator();
	// Hook useGiveaway removido - usando GiveawaySection isolado
	const [activeTab, setActiveTab] = useState('calculator');

	// Processar parâmetros de URL para definir tab ativa
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const tabParam = urlParams.get('tab');
		
		if (tabParam && ['calculator', 'history', 'planner', 'activity', 'admin-dashboard'].includes(tabParam)) {
			setActiveTab(tabParam);
			console.log('🎯 Tab ativa definida pela URL:', tabParam);
		}
	}, [location]);
	const [resultsVisible, setResultsVisible] = useState({
		summary: true,
		distribution: true,
		efficiency: true,
		sensitivity: true,
		performance: true,
	});

	// História agora vem diretamente do useCalculator hook

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

	const toggleFavorite = (idx: number) => {
		const item = history[idx];
		if (item) {
			const updatedItem = { ...item, isFavorite: !item.isFavorite };
			const updatedHistory = [...history];
			updatedHistory[idx] = updatedItem;
			
			// Salvar no localStorage
			localStorage.setItem('worldshards-history', JSON.stringify(updatedHistory));
			window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
		}
	};

	const addTag = (idx: number, tag: string) => {
		const item = history[idx];
		if (item) {
			const currentTags = item.tags || [];
			if (!currentTags.includes(tag)) {
				const updatedItem = { ...item, tags: [...currentTags, tag] };
				const updatedHistory = [...history];
				updatedHistory[idx] = updatedItem;
				
				// Salvar no localStorage
				localStorage.setItem('worldshards-history', JSON.stringify(updatedHistory));
				window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
			}
		}
	};

	const removeTag = (idx: number, tag: string) => {
		const item = history[idx];
		if (item && item.tags) {
			const updatedItem = { ...item, tags: item.tags.filter(t => t !== tag) };
			const updatedHistory = [...history];
			updatedHistory[idx] = updatedItem;
			
			// Salvar no localStorage
			localStorage.setItem('worldshards-history', JSON.stringify(updatedHistory));
			window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
		}
	};

	const addNote = (idx: number, note: string) => {
		const item = history[idx];
		if (item) {
			const updatedItem = { ...item, notes: note };
			const updatedHistory = [...history];
			updatedHistory[idx] = updatedItem;
			
			// Salvar no localStorage
			localStorage.setItem('worldshards-history', JSON.stringify(updatedHistory));
			window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
		}
	};

	const cleanCorruptedHistory = () => {
		// Limpar dados corrompidos do localStorage
		const validHistory = history.filter(item => 
			item && 
			item.results && 
			typeof item.results.finalProfit === 'number' &&
			item.formData &&
			typeof item.results.gemsCost === 'number' &&
			typeof item.timestamp === 'number'
		);
		
		if (validHistory.length !== history.length) {
			// Salvar apenas os dados válidos
			localStorage.setItem('worldshards-history', JSON.stringify(validHistory));
			// Disparar evento para atualizar UI
			window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
			console.log(`🧹 Limpeza: ${history.length - validHistory.length} itens corrompidos removidos`);
		}
	};

	// Executar limpeza ao montar o componente
	useEffect(() => {
		cleanCorruptedHistory();
	}, []);

	// Lista de usuários que podem ver funcionalidades experimentais
	const adminUsers = ['profitshards@gmail.com', 'admin@profitshards.com', 'holdboy01@gmail.com']; // Emails de administradores
	const isAdmin = user && adminUsers.includes(user);

	const tabs = [
		{ id: 'calculator', label: t('profile.tabs.calculator'), icon: Calculator },
		{ id: 'history', label: t('profile.tabs.history'), icon: Calculator },
		{ id: 'planner', label: t('profile.tabs.planner'), icon: Map },
		{ id: 'activity', label: 'Hub de Atividade', icon: Activity },
		// Removido: aba de equipamentos - simplificando interface
		// Abas Admin só aparecem para admins
		...(isAdmin ? [
			{ id: 'admin-dashboard', label: 'Dashboard Admin', icon: Crown }
		] : []),
	];

	return (
		<div className="min-h-screen bg-background">
			<Header />
			
			<main className="container mx-auto px-4 py-8">
				{/* Profile Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
								<User className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-foreground">
									{isAuthenticated ? t('profile.of', { name: userProfile?.username || user?.split('@')[0] || t('auth.guest') }) : t('profile.title')}
								</h1>
								<p className="text-muted-foreground">
									{isAuthenticated 
										? t('profile.subtitle')
										: t('profile.subtitleLocal')
									}
								</p>
							</div>
						</div>
						<Link href="/" className="text-primary hover:text-primary/80 underline">
							{t('nav.backToMain')}
						</Link>
					</div>
				</div>

				{/* Tabs Navigation - Melhoradas para Mobile */}
				<Card className="mb-8">
					<CardContent className="p-6">
						<div className="flex flex-wrap gap-3">
							{tabs.map(tab => {
								const Icon = tab.icon;
								return (
									<Button
										key={tab.id}
										variant={activeTab === tab.id ? "default" : "ghost"}
										size="lg"
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center space-x-3 min-h-[48px] px-6 py-3 text-base font-medium transition-all duration-200 ${
											activeTab === tab.id 
												? 'shadow-md scale-[1.02]' 
												: 'hover:scale-[1.01] hover:shadow-sm'
										}`}
									>
										<Icon className="h-5 w-5" />
										<span>{tab.label}</span>
									</Button>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Tab Content */}
				<div className="space-y-6">
					{/* Calculadora */}
					{activeTab === 'calculator' && (
						<CalculatorComponent
							formData={formData}
							results={results}
							onUpdateFormData={updateFormData}
							onSaveToHistory={saveToHistory}
						/>
					)}

					{/* Histórico de Cálculos */}
					{activeTab === 'history' && (
						<>
							{/* Current Results */}
							{results && (
								<Results
									results={results}
									breakdown={breakdown}
									formData={undefined}
									totalLuck={0}
									visible={resultsVisible}
									onChangeVisibility={(section, value) => setResultsVisible((v) => ({ ...v, [section]: value }))}
								/>
							)}

							{/* Modern History Display */}
							<ModernHistoryDisplay
								history={history}
								onDeleteItem={removeHistoryItem}
								onClearAll={clearAllHistory}
								onToggleFavorite={toggleFavorite}
								onAddTag={addTag}
								onRemoveTag={removeTag}
								onAddNote={addNote}
							/>
						</>
					)}

					{/* Planejador de Mapas */}
					{activeTab === 'planner' && (
						<>
							<MapPlanner />
							<MapMetrics />
						</>
					)}

					{/* Removido: seção de equipamentos - simplificando interface */}


					{/* Hub de Atividade */}
					{activeTab === 'activity' && (
						<div className="space-y-8">

							{/* Layout com Feed em Destaque */}
							<div className="space-y-8">
								{/* Feed de Atividade - Seção Principal */}
								<Card className="bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 border border-orange-500/20">
									<CardContent className="p-6">
										<div className="text-center mb-6">
											<div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full mb-4 border border-orange-500/30">
												<Activity className="h-6 w-6 text-orange-600" />
											</div>
											<h3 className="text-2xl font-bold text-foreground mb-2">
												📊 <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">Feed da Comunidade</span>
											</h3>
											<p className="text-sm text-muted-foreground">
												Últimas atividades e conquistas dos jogadores em tempo real
											</p>
										</div>
										
										<div className="max-h-[600px] overflow-y-auto">
											<ActivityStream />
										</div>
									</CardContent>
								</Card>

								{/* Novo Sistema de Giveaway - MELHORADO */}
								{/* GiveawaySection removido - componente não existe */}
							</div>
						</div>
					)}



					{/* Enhanced Admin Dashboard - (Apenas Admin) */}
					{activeTab === 'admin-dashboard' && isAdmin && (
						<div data-section="admin-dashboard">
							<EnhancedAdminDashboard />
						</div>
					)}

					{/* Support Section - Discrete */}
					<Card className="mt-8 bg-gradient-to-r from-green-500/5 to-blue-500/5 border border-green-500/20">
						<CardContent className="p-4">
							<div className="text-center">
								<p className="text-sm text-muted-foreground mb-3">
										💚 {t('support.donate')}
								</p>
								<div className="flex flex-col sm:flex-row gap-3 justify-center">
									<a 
										href="https://openloot.com/ambassador/link?code=HOLDBOY" 
										target="_blank" 
										rel="noopener noreferrer"
									>
										<Button size="sm" variant="outline" className="text-sm">
											🌐 {t('support.ambassador.cta')}
										</Button>
									</a>
									<Button 
										size="sm" 
										variant="outline" 
										className="text-sm"
										onClick={() => {
											navigator.clipboard.writeText('0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5');
										}}
									>
										💝 {t('donate.copy')} Wallet
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

				</div>
			</main>
		</div>
	);
}