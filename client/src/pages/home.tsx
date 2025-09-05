import React, { useState, useEffect } from "react";
import { HeaderModern } from "@/components/HeaderModern";
import { HeroModern } from "@/components/HeroModern";
import { FeaturesModern } from "@/components/FeaturesModern";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, User, Calculator, Map, BarChart3, Zap, Target, Users, ArrowRight, 
  Sparkles, Globe, ExternalLink, ShoppingCart, HelpCircle, Gamepad2, Coins, MessageCircle, Gift, Star, CheckCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGiveaway } from "@/hooks/use-giveaway";
import { GiveawayBanner } from "@/components/GiveawayBanner";
import { GiveawayModal } from "@/components/GiveawayModal";
import { WinnerBanner } from "@/components/WinnerBanner";
import { WinnersDisplay } from "@/components/WinnersDisplay";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { GlobalStats } from "@/components/GlobalStats";

export default function Home() {
	const { t } = useI18n();
	const { user, userProfile, isAuthenticated } = useAuth();
	const { activeGiveaway } = useGiveaway();
	const { checkForWinnerNotification } = usePushNotifications();
	const [showGiveaway, setShowGiveaway] = useState(false);

	// Função para abrir giveaway e atualizar URL
	const openGiveaway = () => {
		setShowGiveaway(true);
		// Atualizar URL para ?join=giveaway
		const newUrl = `${window.location.pathname}?join=giveaway`;
		window.history.pushState({}, '', newUrl);
		console.log('🎊 GIVEAWAY OPENED + URL UPDATED:', newUrl);
	};

	// Função para fechar giveaway e limpar URL
	const closeGiveaway = () => {
		setShowGiveaway(false);
		// Limpar URL parameter
		window.history.pushState({}, '', window.location.pathname);
		console.log('❌ GIVEAWAY CLOSED + URL CLEANED');
	};

	useEffect(() => {
		importBuildsFromUrl();
	}, []);

	// Verificar se o usuário é ganhador quando a página carrega
	useEffect(() => {
		if (user && activeGiveaway) {
			// Aguardar um pouco para garantir que tudo carregou
			const timer = setTimeout(() => {
				checkForWinnerNotification(activeGiveaway.id);
			}, 2000);
			
			return () => clearTimeout(timer);
		}
	}, [user, activeGiveaway, checkForWinnerNotification]);

	// Efeito para abrir modal do giveaway via URL
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const joinGiveaway = urlParams.get('join') === 'giveaway';
		const focusGiveaway = urlParams.get('giveaway') === 'true';
		
		if ((joinGiveaway || focusGiveaway) && activeGiveaway) {
			console.log('🎯 GIVEAWAY URL DETECTED:', { 
				join: joinGiveaway, 
				focus: focusGiveaway,
				activeGiveaway: !!activeGiveaway 
			});
			
			// Aguardar página carregar
			setTimeout(() => {
				if (joinGiveaway) {
					// Abrir modal diretamente
					console.log('🎊 OPENING GIVEAWAY MODAL VIA URL...');
					setShowGiveaway(true);
					// URL já está correta (?join=giveaway)
				} else if (focusGiveaway) {
					// Scroll para seção
					const giveawaySection = document.getElementById('giveaway-section');
					if (giveawaySection) {
						console.log('📜 SCROLLING TO GIVEAWAY SECTION...');
						giveawaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
						
						// Destacar temporariamente
						giveawaySection.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
						giveawaySection.style.transition = 'all 0.3s ease';
						
						setTimeout(() => {
							giveawaySection.style.boxShadow = '';
						}, 3000);
					}
					
					// Limpar URL parameter
					setTimeout(() => {
						window.history.replaceState({}, '', window.location.pathname);
					}, 3000);
				}
			}, 1500);
		}
	}, [activeGiveaway]);

	return (
		<div className="min-h-screen bg-background">
			<HeaderModern />
			
			{/* Layout principal com Sidebar */}
			<div className="flex">
				{/* Conteúdo principal */}
				<div className="flex-1">
					{/* Botão discreto para voltar ao perfil */}
					{isAuthenticated && (
				<div className="w-full max-w-none px-8 pt-8">
					<div className="flex justify-end">
						<Link href="/perfil">
							<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
								<User className="h-4 w-4 mr-2" />
								{t('home.welcome.profile')}
							</Button>
						</Link>
					</div>
				</div>
			)}
			
			{/* Banner de Ganhador */}
			{isAuthenticated && (
				<div className="w-full max-w-none px-8 pt-8">
					<WinnerBanner 
						userId={user?.uid} 
						userEmail={user?.email} 
					/>
				</div>
			)}
			
			{/* Hero Section Moderno */}
			<HeroModern />

			{/* Estatísticas Globais */}
			<GlobalStats />

			{/* Features Section Moderna */}
			<div className="container mx-auto px-4 py-8">
				<FeaturesModern />
			</div>


			{/* Seção Giveaway e Winners - Centralizada */}
			<div className="container mx-auto px-4 py-8">
				<div className="grid lg:grid-cols-2 gap-8">
						
					{/* Giveaway Component */}
					{activeGiveaway && (
						<div>
							<Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 hover:shadow-lg transition-all duration-200">
								<CardHeader>
									<CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-3">
										<Gift className="h-8 w-8 text-purple-600" />
										🎉 Giveaway Ativo
									</CardTitle>
								</CardHeader>
								<CardContent>
									{isAuthenticated ? (
										<GiveawayBanner 
											giveaway={activeGiveaway} 
											onJoin={openGiveaway}
											compact={false}
										/>
									) : (
										<div className="text-center p-8">
											<div className="p-4 bg-orange-500/20 rounded-full w-fit mx-auto mb-4">
												<Gift className="h-12 w-12 text-orange-600" />
											</div>
											<h3 className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-3">
												{t('home.loginRequired')}
											</h3>
											<p className="text-orange-600 dark:text-orange-400 mb-6">
												Faça login para participar do giveaway e concorrer aos prêmios!
											</p>
											<Button 
												className="bg-orange-600 hover:bg-orange-700 text-white"
												onClick={() => {
													alert(t('home.loginRequired.giveaway'));
												}}
											>
												{t('home.loginButton')}
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					)}

					{/* Lista de Ganhadores */}
					<div>
						<WinnersDisplay />
					</div>

				{/* Support Section - Centralizada */}
				<div className="mt-16">
					<div className="rounded-lg bg-card/60 backdrop-blur-md text-card-foreground bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 shadow-lg max-w-4xl mx-auto">
									<div className="p-12">
										<div className="text-center mb-12">
											<h3 className="text-4xl font-bold text-foreground mb-8 flex items-center justify-center gap-4">
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-12 w-12 text-green-500">
													<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
													<path d="M20 3v4"></path>
													<path d="M22 5h-4"></path>
													<path d="M4 17v2"></path>
													<path d="M5 18H3"></path>
												</svg>
												{t('home.support.title')}
											</h3>
											<p className="text-muted-foreground text-2xl leading-relaxed">{t('home.support.subtitle')}</p>
											
											{/* Créditos e Contatos */}
											<div className="mt-10 pt-10 border-t border-green-500/20">
												<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
													{/* Created by - Lado Esquerdo */}
													<div className="flex flex-col items-start">
														<p className="text-lg text-muted-foreground mb-4 font-medium">{t('home.support.createdBy')}</p>
														<a 
															href="https://x.com/playerhold" 
															target="_blank" 
															rel="noopener noreferrer"
															className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200"
														>
															<svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
																<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
															</svg>
															<span className="text-xl font-bold text-blue-600">@playerhold</span>
														</a>
													</div>

													{/* Discord Feedback - Lado Direito */}
													<div className="flex flex-col items-end">
														<p className="text-lg text-muted-foreground mb-4 font-medium">{t('home.support.feedback')}</p>
														<div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg hover:from-purple-500/20 hover:to-indigo-500/20 transition-all duration-200 cursor-pointer"
															onClick={() => {
																navigator.clipboard.writeText('Holdboy');
																alert(t('home.support.discordCopied'));
															}}
														>
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle h-6 w-6 text-purple-500">
																<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
															</svg>
															<span className="text-xl font-bold text-purple-600">Holdboy</span>
														</div>
													</div>
												</div>
											</div>
										</div>
										
										<div className="space-y-10">
											<div className="rounded-lg bg-card/60 backdrop-blur-md text-card-foreground shadow-sm border border-green-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:shadow-lg transition-shadow">
												<div className="p-10">
													<div className="text-center space-y-8">
														<div className="flex items-center justify-center gap-4">
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-8 w-8 text-blue-500">
																<circle cx="12" cy="12" r="10"></circle>
																<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
																<path d="M2 12h20"></path>
															</svg>
															<span className="font-bold text-2xl">OpenLoot (Ambassador)</span>
														</div>
														<p className="text-xl text-muted-foreground leading-relaxed">Use my ambassador link</p>
														<a href="https://openloot.com/ambassador/link?code=HOLDBOY" target="_blank" rel="noopener noreferrer" className="block">
															<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 rounded-md px-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl py-5">
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right mr-4 h-7 w-7">
																	<path d="M5 12h14"></path>
																	<path d="m12 5 7 7-7 7"></path>
																</svg>
																Ambassador
															</button>
														</a>
													</div>
												</div>
											</div>
											<div className="rounded-lg bg-card/60 backdrop-blur-md text-card-foreground shadow-sm border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:shadow-lg transition-shadow">
												<div className="p-12">
													<div className="text-center space-y-8">
														<div className="flex items-center justify-center gap-4">
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-8 w-8 text-green-500">
																<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
															</svg>
															<span className="font-bold text-2xl">Doação Direta</span>
														</div>
														<p className="text-xl text-muted-foreground">Carteira EVM</p>
														<div className="flex items-center gap-5 p-6 bg-muted/50 rounded-lg border">
															<div className="text-xl font-mono break-all flex-1 select-all">
																0x05b...eCD0B5
															</div>
															<button 
																onClick={() => {
																	navigator.clipboard.writeText('0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5');
																	alert(t('home.walletCopied'));
																}}
																className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md shrink-0 text-xl h-14 px-8"
															>
																Copy
															</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			



				
			</div>
			
			{/* Giveaway Modal */}
			<GiveawayModal 
				open={showGiveaway}
				onOpenChange={closeGiveaway}
				giveaway={activeGiveaway || undefined}
			/>
		</div>
	);
}