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

	useEffect(() => {
		importBuildsFromUrl();
	}, []);

	// Efeito separado para scroll do giveaway
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const focusGiveaway = urlParams.get('giveaway') === 'true';
		
		if (focusGiveaway) {
			console.log('🎯 GIVEAWAY FOCUS DETECTED:', { activeGiveaway: !!activeGiveaway });
			
			// Aguardar giveaway carregar e página renderizar
			const scrollToGiveaway = () => {
				const giveawaySection = document.getElementById('giveaway-section');
				console.log('🔍 GIVEAWAY SECTION:', { found: !!giveawaySection });
				
				if (giveawaySection) {
					console.log('📜 SCROLLING TO GIVEAWAY...');
					giveawaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
					
					// Destacar temporariamente
					giveawaySection.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
					giveawaySection.style.transform = 'scale(1.02)';
					giveawaySection.style.transition = 'all 0.3s ease';
					
					setTimeout(() => {
						giveawaySection.style.boxShadow = '';
						giveawaySection.style.transform = '';
					}, 4000);
					
					// Limpar URL parameter
					window.history.replaceState({}, '', window.location.pathname);
				} else {
					console.log('⏳ GIVEAWAY SECTION NOT FOUND, RETRYING...');
					// Tentar novamente se não encontrou
					setTimeout(scrollToGiveaway, 500);
				}
			};

			// Aguardar mais tempo para garantir que tudo carregou
			setTimeout(scrollToGiveaway, 2000);
		}
	}, [activeGiveaway]);

	return (
		<div className="min-h-screen bg-background">
			<Header />
			
			{/* Botão discreto para voltar ao perfil */}
			{isAuthenticated && (
				<div className="container mx-auto px-4 pt-4">
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
				<div className="max-w-6xl mx-auto px-4 pt-6">
					<WinnerBanner 
						userId={user?.uid} 
						userEmail={user?.email} 
					/>
				</div>
			)}

			{/* Conteúdo Centralizado */}
			<div className="max-w-6xl mx-auto px-4 py-12">
				{/* Hero Section Centralizado */}
				<div className="text-center mb-16">
					<div className="flex justify-center mb-4">
						<Badge className="px-4 py-2 bg-gradient-to-r from-primary/20 to-blue-500/20 text-foreground border-primary/30 font-medium text-base">
							<Sparkles className="h-5 w-5 mr-2" />
							{t('home.title')}
						</Badge>
					</div>
					
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
						{t('home.hero.title')}
					</h1>
					
					<p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
						{t('home.hero.subtitle')}
					</p>
					
					{/* Call-to-Action Centralizado */}
					<div className="flex justify-center">
						<Link href="/perfil">
							<Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-10 py-4 text-xl font-semibold hover:scale-105 rounded-xl">
								<Zap className="mr-3 h-7 w-7" />
								{isAuthenticated ? 'Ir ao Meu Perfil' : 'Começar a Calcular'}
								<ArrowRight className="ml-3 h-7 w-7" />
							</Button>
						</Link>
					</div>
				</div>



				{/* Community Activity Section - Centralizado */}
				<div className="mb-16">
					<div className="text-center mb-12">
						<div className="flex items-center justify-center space-x-3 mb-6">
							<div className="p-3 bg-orange-500/10 rounded-xl">
								<Globe className="h-8 w-8 text-orange-600" />
							</div>
							<h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
								🔥 {t('home.community.title')}
							</h2>
						</div>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
							{t('home.community.subtitle')}
						</p>
					</div>
				</div>

				{/* WorldShards Resources Section - Centralizado */}
				<div className="mb-16">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
							<Gamepad2 className="h-8 w-8 text-primary" />
							🎮 WorldShards Resources
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl mx-auto">
							Acesse o jogo, marketplace e tire suas dúvidas
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{/* Play Game */}
					<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-6">
							<div className="text-center space-y-4">
								<div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<Gamepad2 className="h-8 w-8 text-green-600" />
								</div>
								<div>
									<h3 className="font-bold text-green-900 dark:text-green-100 mb-2">{t('resources.game.title')}</h3>
									<p className="text-sm text-green-700 dark:text-green-300 mb-4">
										{t('resources.game.desc')}
									</p>
									<a 
										href="https://www.worldshards.online/en" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-green-600 hover:bg-green-700 text-white">
											<ExternalLink className="mr-2 h-4 w-4" />
											{t('resources.game.cta')}
										</Button>
									</a>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Marketplace */}
					<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-6">
							<div className="text-center space-y-4">
								<div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<ShoppingCart className="h-8 w-8 text-blue-600" />
								</div>
								<div>
									<h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{t('resources.marketplace.title')}</h3>
									<p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
										{t('resources.marketplace.desc')}
									</p>
									<a 
										href="https://openloot.com/games/worldshards" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
											<ExternalLink className="mr-2 h-4 w-4" />
											{t('resources.marketplace.cta')}
										</Button>
									</a>
								</div>
							</div>
						</CardContent>
					</Card>



					{/* FAQ */}
					<Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-6">
							<div className="text-center space-y-4">
								<div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<HelpCircle className="h-8 w-8 text-purple-600" />
								</div>
								<div>
									<h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">{t('resources.faq.title')}</h3>
									<p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
										{t('resources.faq.desc')}
									</p>
									<Button 
										className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
										<MessageCircle className="mr-2 h-4 w-4" />
										{t('resources.faq.cta')}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
				
				{/* Activity Stream - SEÇÃO INDEPENDENTE COM LARGURA MÁXIMA */}
				<div className="mb-16">
					<div className="w-full max-w-none px-4">
						<ActivityStream />
					</div>
				</div>

				{/* Sidebar Components - SEÇÃO SEPARADA */}
				<div className="mb-16" id="giveaway-section" data-section="giveaway">
					<div className="flex flex-col lg:flex-row gap-8 justify-center items-start max-w-[1600px] mx-auto px-4">
						
						{/* Giveaway Component */}
						{activeGiveaway && (
							<div className="lg:w-[500px]">
								<GiveawayBanner 
									giveaway={activeGiveaway} 
									onJoin={() => setShowGiveaway(true)}
									compact={false}
								/>
							</div>
						)}

						{/* Lista de Ganhadores Públicos */}
						<div className="lg:w-[500px]">
							<PublicWinnersList />
						</div>

						{/* Support Section */}
						<div className="lg:w-[500px]">
								<Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 shadow-lg w-[500px] min-h-[440px]">
									<CardContent className="p-8">
										<div className="text-center mb-8">
											<h3 className="text-2xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
												<Sparkles className="h-8 w-8 text-green-500" />
												💚 {t('support.title')}
											</h3>
											<p className="text-muted-foreground text-lg leading-relaxed">
												{t('support.donate')}
											</p>
											
											{/* Créditos do Criador */}
											<div className="mt-6 pt-6 border-t border-green-500/20">
												<p className="text-base text-muted-foreground mb-4 font-medium">{t('support.creator')}</p>
												<a 
													href="https://x.com/playerhold" 
													target="_blank" 
													rel="noopener noreferrer"
													className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200 shadow-lg"
												>
													<svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
														<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
													</svg>
													<span className="text-lg font-bold text-blue-600">@playerhold</span>
												</a>
											</div>
										</div>
										
										<div className="space-y-6">
											{/* OpenLoot Ambassador */}
											<Card className="border border-green-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:shadow-lg transition-shadow">
												<CardContent className="p-6">
													<div className="text-center space-y-4">
														<div className="flex items-center justify-center gap-3">
															<Globe className="h-6 w-6 text-blue-500" />
															<span className="font-bold text-lg">{t('support.ambassador')}</span>
														</div>
														<p className="text-base text-muted-foreground leading-relaxed">
															{t('support.ambassador.desc')}
														</p>
														<a 
															href="https://openloot.com/ambassador/link?code=HOLDBOY" 
															target="_blank" 
															rel="noopener noreferrer" 
															className="block"
														>
															<Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-base py-3">
																<ArrowRight className="mr-2 h-5 w-5" />
																Ambassador
															</Button>
														</a>
													</div>
												</CardContent>
											</Card>

											{/* Direct Donation */}
											<Card className="border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:shadow-lg transition-shadow">
												<CardContent className="p-6">
													<div className="text-center space-y-4">
														<div className="flex items-center justify-center gap-3">
															<Zap className="h-6 w-6 text-green-500" />
															<span className="font-bold text-lg">Doação Direta</span>
														</div>
														<p className="text-base text-muted-foreground">
															Carteira EVM
														</p>
														<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
															<div className="text-base font-mono break-all flex-1 select-all">
																0x05b...eCD0B5
															</div>
															<Button
																size="lg"
																variant="outline"
																onClick={() => {
																	navigator.clipboard.writeText('0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5');
																}}
																className="shrink-0 text-base h-10 px-4"
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
			<div id="faq-section" className="max-w-6xl mx-auto px-4 py-16">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 flex items-center justify-center gap-3">
						<HelpCircle className="h-8 w-8 text-primary" />
						❓ {t('faq.title')}
					</h2>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						{t('faq.subtitle')}
					</p>
				</div>

				<div className="max-w-5xl mx-auto space-y-8">
					{/* FAQ Items */}
					<Card className="border-blue-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Calculator className="h-5 w-5 text-blue-500" />
								{t('faq.calculator.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t('faq.calculator.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-green-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Map className="h-5 w-5 text-green-500" />
								{t('faq.planner.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t('faq.planner.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-purple-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Users className="h-5 w-5 text-purple-500" />
								{t('faq.stats.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t('faq.stats.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-yellow-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Coins className="h-5 w-5 text-yellow-500" />
								{t('faq.tokens.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t('faq.tokens.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-orange-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<BarChart3 className="h-5 w-5 text-orange-500" />
								{t('faq.export.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t('faq.export.answer')}
							</p>
						</CardContent>
					</Card>

					<Card className="border-indigo-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Globe className="h-5 w-5 text-indigo-500" />
								{t('faq.offline.question')}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t('faq.offline.answer')}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
			</div>

			{/* Enhanced Footer - Centralizado */}
			<footer className="mt-20 py-16 border-t border-border/50 bg-gradient-to-r from-background via-muted/5 to-background">
				<div className="max-w-4xl mx-auto px-4">
					<div className="text-center">
						<h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
							{t('home.title')}
						</h2>
						<p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
							{t('home.footer.description')}
						</p>
						<div className="flex flex-wrap justify-center gap-6 text-base text-muted-foreground">
							<span className="flex items-center gap-2">✨ {t('home.footer.feature1')}</span>
							<span className="flex items-center gap-2">📊 {t('home.footer.feature2')}</span>
							<span className="flex items-center gap-2">🌍 {t('home.footer.feature3')}</span>
							<span className="flex items-center gap-2">🆓 {t('home.footer.feature4')}</span>
						</div>
					</div>
				</div>
			</footer>
			
			{/* Giveaway Modal */}
			<GiveawayModal 
				open={showGiveaway}
				onOpenChange={setShowGiveaway}
				giveaway={activeGiveaway || undefined}
			/>
		</div>
	);
}