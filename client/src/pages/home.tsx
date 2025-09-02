import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ActivityStream } from "@/components/ActivityStream";
import { CommunityStats } from "@/components/CommunityStats";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, User, Calculator, Map, BarChart3, Zap, Target, Users, ArrowRight, 
  Sparkles, Globe, ExternalLink, ShoppingCart, HelpCircle, Gamepad2, Coins, MessageCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGiveaway } from "@/hooks/use-giveaway";
import { GiveawayBanner } from "@/components/GiveawayBanner";
import { GiveawayModal } from "@/components/GiveawayModal";
import { WinnerBanner } from "@/components/WinnerBanner";
import { PublicWinnersList } from "@/components/PublicWinnersList";

export default function Home() {
	const { t } = useI18n();
	const { user, userProfile, isAuthenticated } = useAuth();
	const { activeGiveaway } = useGiveaway();
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
			<Header />
			
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
			
			{/* Conteúdo Centralizado */}
			<div className="w-full max-w-none px-8 py-16">
				{/* Hero Section Compacto */}
				<div className="text-center mb-20">
					<h2 className="text-4xl font-semibold text-foreground mb-8 flex items-center justify-center gap-4">
						<div className="p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl">
							<Sparkles className="h-6 w-6 text-primary" />
						</div>
						WorldShards Calculator
					</h2>
					
					{/* Call-to-Action */}
					<div className="flex justify-center">
						<Link href="/perfil">
							<Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-10 py-4 text-xl font-semibold hover:scale-105 rounded-xl">
								<Zap className="mr-3 h-6 w-6" />
								{isAuthenticated ? t('home.goToProfile') : t('home.startCalculating')}
								<ArrowRight className="ml-3 h-6 w-6" />
							</Button>
						</Link>
					</div>
				</div>
				
				{/* Community Activity Section - Centralizado */}
				<div className="mb-24">
					<div className="text-center mb-16">
						<div className="flex items-center justify-center space-x-4 mb-8">
							<div className="p-4 bg-orange-500/10 rounded-2xl">
								<Globe className="h-10 w-10 text-orange-600" />
							</div>
							<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
								🔥 {t('home.community.title')}
							</h2>
						</div>
						<p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-10">
							{t('home.community.subtitle')}
						</p>
					</div>
				</div>
				
				{/* WorldShards Resources Section - Centralizado */}
				<div className="mb-32">
					<div className="text-center mb-20">
						<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 flex items-center justify-center gap-4">
							<Gamepad2 className="h-10 w-10 text-primary" />
							🎮 WorldShards Resources
						</h2>
						<p className="text-muted-foreground text-xl max-w-3xl mx-auto">
							{t('home.resources.title')}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
					{/* Play Game */}
					<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-10">
							<div className="text-center space-y-8">
								<div className="p-5 bg-green-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<Gamepad2 className="h-12 w-12 text-green-600" />
								</div>
								<div>
									<h3 className="font-bold text-green-900 dark:text-green-100 mb-4 text-2xl">{t('resources.game.title')}</h3>
									<p className="text-lg text-green-700 dark:text-green-300 mb-8">
										{t('resources.game.desc')}
									</p>
									<a 
										href="https://www.worldshards.online/en" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg">
											<ExternalLink className="mr-3 h-6 w-6" />
											{t('resources.game.cta')}
										</Button>
									</a>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Marketplace */}
					<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-10">
							<div className="text-center space-y-8">
								<div className="p-5 bg-blue-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<ShoppingCart className="h-12 w-12 text-blue-600" />
								</div>
								<div>
									<h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-2xl">{t('resources.marketplace.title')}</h3>
									<p className="text-lg text-blue-700 dark:text-blue-300 mb-8">
										{t('resources.marketplace.desc')}
									</p>
									<a 
										href="https://openloot.com/games/worldshards" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg">
											<ExternalLink className="mr-3 h-6 w-6" />
											{t('resources.marketplace.cta')}
										</Button>
									</a>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* FAQ */}
					<Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-10">
							<div className="text-center space-y-8">
								<div className="p-5 bg-purple-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<HelpCircle className="h-12 w-12 text-purple-600" />
								</div>
								<div>
									<h3 className="font-bold text-purple-900 dark:text-purple-100 mb-4 text-2xl">{t('resources.faq.title')}</h3>
									<p className="text-lg text-purple-700 dark:text-purple-300 mb-8">
										{t('resources.faq.desc')}
									</p>
									<Button 
										className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg"
										onClick={() => {
											try {
												if (typeof window !== 'undefined' && typeof document !== 'undefined') {
													const element = document.getElementById('faq-section');
													if (element) {
														element.scrollIntoView({ behavior: 'smooth' });
													}
												}
											} catch (error) {
												console.error('Error scrolling to FAQ:', error);
											}
										}}
									>
										<MessageCircle className="mr-3 h-6 w-6" />
										{t('resources.faq.cta')}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
				
				{/* Activity Stream - SEÇÃO INDEPENDENTE COM LARGURA MÁXIMA */}
				<div className="mb-32">
					<div className="w-full max-w-none px-8">
						<ActivityStream />
					</div>
				</div>
				
				{/* Sidebar Components - SEÇÃO SEPARADA */}
				<div className="mb-32" id="giveaway-section" data-section="giveaway">
					<div className="flex flex-col lg:flex-row gap-16 justify-center items-start w-full max-w-none px-8">
						
						{/* Giveaway Component */}
						{activeGiveaway && (
							<div className="lg:w-[600px]">
								<GiveawayBanner 
									giveaway={activeGiveaway} 
									onJoin={openGiveaway}
									compact={false}
								/>
							</div>
						)}

						{/* Lista de Ganhadores Públicos */}
						<div className="lg:w-[450px]">
							<PublicWinnersList />
						</div>

						{/* Support Section */}
						<div className="lg:w-[500px]">
								<Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 shadow-lg w-[500px] min-h-[520px]">
									<CardContent className="p-12">
										<div className="text-center mb-12">
											<h3 className="text-4xl font-bold text-foreground mb-8 flex items-center justify-center gap-4">
												<Sparkles className="h-12 w-12 text-green-500" />
												💚 {t('support.title')}
											</h3>
											<p className="text-muted-foreground text-2xl leading-relaxed">
												{t('support.donate')}
											</p>
											
											{/* Créditos e Contatos */}
											<div className="mt-10 pt-10 border-t border-green-500/20">
												<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
													{/* Created by - Lado Esquerdo */}
													<div className="flex flex-col items-start">
														<p className="text-lg text-muted-foreground mb-4 font-medium">{t('support.creator')}</p>
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
														<p className="text-lg text-muted-foreground mb-4 font-medium">{t('support.feedback')}</p>
														<div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg hover:from-purple-500/20 hover:to-indigo-500/20 transition-all duration-200 cursor-pointer"
															onClick={() => {
																navigator.clipboard.writeText('Holdboy');
																alert('Discord copiado: Holdboy\nEnvie DM para feedback!');
															}}
														>
															<MessageCircle className="h-6 w-6 text-purple-500" />
															<span className="text-xl font-bold text-purple-600">Holdboy</span>
														</div>
													</div>
												</div>
											</div>
										</div>
										
										<div className="space-y-10">
											{/* OpenLoot Ambassador */}
											<Card className="border border-green-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:shadow-lg transition-shadow">
												<CardContent className="p-10">
													<div className="text-center space-y-8">
														<div className="flex items-center justify-center gap-4">
															<Globe className="h-8 w-8 text-blue-500" />
															<span className="font-bold text-2xl">{t('support.ambassador')}</span>
														</div>
														<p className="text-xl text-muted-foreground leading-relaxed">
															{t('support.ambassador.desc')}
														</p>
														<a 
															href="https://openloot.com/ambassador/link?code=HOLDBOY" 
															target="_blank" 
															rel="noopener noreferrer" 
															className="block"
														>
															<Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl py-5">
																<ArrowRight className="mr-4 h-7 w-7" />
																Ambassador
															</Button>
														</a>
													</div>
												</CardContent>
											</Card>

											{/* Direct Donation */}
											<Card className="border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:shadow-lg transition-shadow">
												<CardContent className="p-10">
													<div className="text-center space-y-8">
														<div className="flex items-center justify-center gap-4">
															<Zap className="h-8 w-8 text-green-500" />
															<span className="font-bold text-2xl">Doação Direta</span>
														</div>
														<p className="text-xl text-muted-foreground">
															Carteira EVM
														</p>
														<div className="flex items-center gap-5 p-6 bg-muted/50 rounded-lg border">
															<div className="text-xl font-mono break-all flex-1 select-all">
																0x05b...eCD0B5
															</div>
															<Button
																size="lg"
																variant="outline"
																onClick={() => {
																	navigator.clipboard.writeText('0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5');
																}}
																className="shrink-0 text-xl h-14 px-8"
															>
																{t('donate.copy')}
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										</div>
									</CardContent>
								</Card>
						</div>
					</div>
				</div>
			

			{/* FAQ Section - Centralizado */}
			<div id="faq-section" className="w-full max-w-none px-8 py-24">
				<div className="text-center mb-24">
					<h2 className="text-5xl md:text-6xl font-bold text-foreground mb-10 flex items-center justify-center gap-4">
						<HelpCircle className="h-12 w-12 text-primary" />
						❓ {t('faq.title')}
					</h2>
					<p className="text-muted-foreground text-2xl max-w-4xl mx-auto">
						{t('faq.subtitle')}
					</p>
				</div>

				<div className="max-w-7xl mx-auto space-y-12">
					{/* FAQ Items */}
					<Card className="border-blue-200/50">
						<CardHeader>
							<CardTitle className="text-left text-2xl flex items-center gap-4">
								<Calculator className="h-7 w-7 text-blue-500" />
								{t('faq.calculator.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xl">
								{t('faq.calculator.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-green-200/50">
						<CardHeader>
							<CardTitle className="text-left text-2xl flex items-center gap-4">
								<Map className="h-7 w-7 text-green-500" />
								{t('faq.planner.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xl">
								{t('faq.planner.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-purple-200/50">
						<CardHeader>
							<CardTitle className="text-left text-2xl flex items-center gap-4">
								<Users className="h-7 w-7 text-purple-500" />
								{t('faq.stats.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xl">
								{t('faq.stats.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-yellow-200/50">
						<CardHeader>
							<CardTitle className="text-left text-2xl flex items-center gap-4">
								<Coins className="h-7 w-7 text-yellow-500" />
								{t('faq.tokens.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xl">
								{t('faq.tokens.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-orange-200/50">
						<CardHeader>
							<CardTitle className="text-left text-2xl flex items-center gap-4">
								<BarChart3 className="h-7 w-7 text-orange-500" />
								{t('faq.export.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xl">
								{t('faq.export.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-indigo-200/50">
						<CardHeader>
							<CardTitle className="text-left text-2xl flex items-center gap-4">
								<Globe className="h-7 w-7 text-indigo-500" />
								{t('faq.offline.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xl">
								{t('faq.offline.answer')}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
			</div>

			{/* Enhanced Footer - Centralizado */}
			<footer className="mt-32 py-24 border-t border-border/50 bg-gradient-to-r from-background via-muted/5 to-background">
				<div className="max-w-6xl mx-auto px-8">
					<div className="text-center">
						<h2 className="text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-8">
							{t('home.title')}
						</h2>
						<p className="text-muted-foreground mb-12 text-2xl max-w-4xl mx-auto">
							{t('home.footer.description')}
						</p>
						<div className="flex flex-wrap justify-center gap-10 text-xl text-muted-foreground">
							<span className="flex items-center gap-4">✨ {t('home.footer.feature1')}</span>
							<span className="flex items-center gap-4">📊 {t('home.footer.feature2')}</span>
							<span className="flex items-center gap-4">🌍 {t('home.footer.feature3')}</span>
							<span className="flex items-center gap-4">🆓 {t('home.footer.feature4')}</span>
						</div>
					</div>
				</div>
			</footer>
			
			{/* Giveaway Modal */}
			<GiveawayModal 
				open={showGiveaway}
				onOpenChange={closeGiveaway}
				giveaway={activeGiveaway || undefined}
			/>
		</div>
	);
}