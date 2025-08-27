import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ActivityStream } from "@/components/ActivityStream";
import { CommunityStats } from "@/components/CommunityStats";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, User, Calculator, Map, BarChart3, Zap, Target, Users, ArrowRight, 
  Sparkles, Globe, ExternalLink, ShoppingCart, HelpCircle, Gamepad2, Coins, MessageCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";


export default function Home() {
	const { t } = useI18n();
	const { user, userProfile, isAuthenticated } = useAuth();

	useEffect(() => {
		importBuildsFromUrl();
	}, []);

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
			
			<div className="container mx-auto px-4 py-8">
				{/* Hero Section Compacto - Foco no Feed */}
				<div className="text-center mb-6">
					<div className="flex justify-center mb-3">
						<Badge className="px-3 py-1 bg-gradient-to-r from-primary/20 to-blue-500/20 text-foreground border-primary/30 font-medium">
							<Sparkles className="h-4 w-4 mr-2" />
							{t('home.title')}
						</Badge>
					</div>
					
					<h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
						{t('home.hero.title')}
					</h1>
					
					<p className="text-muted-foreground mb-4 max-w-xl mx-auto text-sm">
						{t('home.hero.subtitle')}
					</p>
					
					{/* Call-to-Action MUITO VISÍVEL */}
					<Link href="/perfil">
						<Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold hover:scale-105">
							<Zap className="mr-3 h-6 w-6" />
							{isAuthenticated ? 'Ir ao Meu Perfil' : 'Começar a Calcular'}
							<ArrowRight className="ml-3 h-6 w-6" />
						</Button>
					</Link>
				</div>

				



				{/* Activity Feed - Ampliado */}
				<div className="mb-8">
					<div className="text-center mb-8">
						<div className="flex items-center justify-center space-x-3 mb-4">
							<div className="p-2 bg-orange-500/10 rounded-lg">
								<Globe className="h-6 w-6 text-orange-600" />
							</div>
							<h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
								🔥 {t('home.community.title')}
							</h2>
						</div>
						<p className="text-muted-foreground text-lg mb-6">
							{t('home.community.subtitle')}
						</p>
				</div>

			{/* WorldShards Resources Section */}
			<div className="mb-12">
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
						<Gamepad2 className="h-6 w-6 text-primary" />
						🎮 WorldShards Resources
					</h2>
					<p className="text-muted-foreground">
						Acesse o jogo, marketplace e tire suas dúvidas
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Play Game */}
					<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-6">
							<div className="text-center space-y-4">
								<div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<Gamepad2 className="h-8 w-8 text-green-600" />
								</div>
								<div>
									<h3 className="font-bold text-green-900 dark:text-green-100 mb-2">Jogar Agora</h3>
									<p className="text-sm text-green-700 dark:text-green-300 mb-4">
										Acesse o jogo WorldShards e comece sua aventura
									</p>
									<a 
										href="https://www.worldshards.online/en" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-green-600 hover:bg-green-700 text-white">
											<ExternalLink className="mr-2 h-4 w-4" />
											Jogar
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
									<h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Marketplace</h3>
									<p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
										Compre e venda items, equipamentos e tokens
									</p>
									<a 
										href="https://openloot.com/games/worldshards" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
											<ExternalLink className="mr-2 h-4 w-4" />
											OpenLoot
										</Button>
									</a>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Token Price */}
					<Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-900 hover:shadow-lg transition-all duration-200 group">
						<CardContent className="p-6">
							<div className="text-center space-y-4">
								<div className="p-3 bg-yellow-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
									<Coins className="h-8 w-8 text-yellow-600" />
								</div>
								<div>
									<h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">Token Price</h3>
									<p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
										Acompanhe o preço dos tokens em tempo real
									</p>
									<a 
										href="https://www.coingecko.com/en/coins/worldshards" 
										target="_blank" 
										rel="noopener noreferrer"
										className="block"
									>
										<Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
											<ExternalLink className="mr-2 h-4 w-4" />
											CoinGecko
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
									<h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">FAQ & Ajuda</h3>
									<p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
										Perguntas frequentes e guias de uso
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
										Ver FAQ
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
				
			{/* Activity Stream + Support - Layout Lateral Expandido */}
			<div className="max-w-[1600px] mx-auto px-6">
					<div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
						{/* Activity Stream - Coluna Principal (4/5) */}
						<div className="lg:col-span-4">
							<ActivityStream />
						</div>

						{/* Support Section - Sidebar (1/5) */}
						<div className="lg:col-span-1">
							<div className="sticky top-8">
								<Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 shadow-lg">
									<CardContent className="p-6">
										<div className="text-center mb-6">
											<h3 className="text-lg font-bold text-foreground mb-2 flex items-center justify-center gap-2">
												<Sparkles className="h-4 w-4 text-green-500" />
												💚 {t('support.title')}
											</h3>
											<p className="text-muted-foreground text-sm">
												{t('support.donate')}
											</p>
											
											{/* Créditos do Criador */}
											<div className="mt-4 pt-4 border-t border-green-500/20">
												<p className="text-xs text-muted-foreground mb-2">Criado por</p>
												<a 
													href="https://x.com/playerhold" 
													target="_blank" 
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200"
												>
													<svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
														<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
													</svg>
													<span className="text-sm font-semibold text-blue-600">@playerhold</span>
												</a>
											</div>
										</div>
										
										<div className="space-y-4">
											{/* OpenLoot Ambassador */}
											<Card className="border border-green-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:shadow-md transition-shadow">
												<CardContent className="p-4">
													<div className="text-center space-y-3">
														<div className="flex items-center justify-center gap-2">
															<Globe className="h-4 w-4 text-blue-500" />
															<span className="font-semibold text-sm">{t('support.ambassador')}</span>
														</div>
														<p className="text-xs text-muted-foreground">
															Use meu link de embaixador
														</p>
														<a 
															href="https://openloot.com/ambassador/link?code=HOLDBOY" 
															target="_blank" 
															rel="noopener noreferrer" 
															className="block"
														>
															<Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-xs">
																<ArrowRight className="mr-1 h-3 w-3" />
																Ambassador
															</Button>
														</a>
													</div>
												</CardContent>
											</Card>

											{/* Direct Donation */}
											<Card className="border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:shadow-md transition-shadow">
												<CardContent className="p-4">
													<div className="text-center space-y-3">
														<div className="flex items-center justify-center gap-2">
															<Zap className="h-4 w-4 text-green-500" />
															<span className="font-semibold text-sm">Doação Direta</span>
														</div>
														<p className="text-xs text-muted-foreground">
															Carteira EVM
														</p>
														<div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
															<div className="text-xs font-mono break-all flex-1 select-all">
																0x05b...eCD0B5
															</div>
															<Button
																size="sm"
																variant="outline"
																onClick={() => {
																	navigator.clipboard.writeText('0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5');
																}}
																className="shrink-0 text-xs h-6 px-2"
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
				</div>
			</div>

				{/* Call to Action for Non-Authenticated Users */}
				{!isAuthenticated && (
					<Card className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/30">
						<CardContent className="p-8 text-center">
							<h3 className="text-2xl font-bold text-foreground mb-4">
								{t('home.cta.title')}
							</h3>
							<p className="text-muted-foreground mb-6 text-lg">
								{t('home.cta.subtitle')}
							</p>
							<div className="flex flex-col sm:flex-row gap-6 justify-center">
								<Link href="/perfil">
									<Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 px-10 py-4 text-lg font-semibold min-h-[52px] min-w-[180px] shadow-lg hover:shadow-xl transition-all duration-200">
										<Zap className="mr-3 h-5 w-5" />
										{t('home.cta.try')}
									</Button>
								</Link>
								<Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-primary/30 hover:bg-primary/10 min-h-[52px] min-w-[180px] hover:border-primary/50 transition-all duration-200">
									<Users className="mr-3 h-5 w-5" />
									{t('home.cta.features')}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
			


			{/* FAQ Section */}
			<div id="faq-section" className="mb-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
						<HelpCircle className="h-8 w-8 text-primary" />
						❓ Perguntas Frequentes
					</h2>
					<p className="text-muted-foreground text-lg">
						Tire suas dúvidas sobre o WorldShards Calculator
					</p>
				</div>

				<div className="max-w-4xl mx-auto space-y-6">
					{/* FAQ Items */}
					<Card className="border-blue-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Calculator className="h-5 w-5 text-blue-500" />
								Como funciona a calculadora de lucros?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								A calculadora analisa seu investimento, equipamentos, sorte e eficiência para determinar o lucro potencial nas dungeons. 
								Insira os dados do seu setup e receba uma análise detalhada com ROI, distribuição de tokens e recomendações.
							</p>
						</CardContent>
					</Card>

					<Card className="border-green-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Map className="h-5 w-5 text-green-500" />
								O que é o planejador de mapas?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								O planejador permite registrar suas runs, analisar eficiência por mapa (Small, Medium, Large, XLarge) e contribuir para as 
								estatísticas da comunidade. Acompanhe seu progresso e compare com outros jogadores.
							</p>
						</CardContent>
					</Card>

					<Card className="border-purple-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Users className="h-5 w-5 text-purple-500" />
								Como funcionam as estatísticas da comunidade?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								As estatísticas são atualizadas em tempo real com dados anônimos dos usuários. Você pode ver runs recentes, 
								lucros totais, players ativos e mapas mais populares. Todos os dados são agregados e não identificam usuários individuais.
							</p>
						</CardContent>
					</Card>

					<Card className="border-yellow-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Coins className="h-5 w-5 text-yellow-500" />
								Os preços dos tokens são atualizados automaticamente?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								Atualmente usamos preços fixos para cálculos. Em breve implementaremos integração com APIs de preços em tempo real 
								para refletir as cotações atuais do mercado. Você pode acompanhar preços atuais no CoinGecko.
							</p>
						</CardContent>
					</Card>

					<Card className="border-orange-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<BarChart3 className="h-5 w-5 text-orange-500" />
								Posso exportar meus dados e histórico?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								Sim! No perfil você pode baixar todo seu histórico de cálculos e runs em formato JSON. 
								Também é possível limpar dados individualmente ou fazer backup completo de suas informações.
							</p>
						</CardContent>
					</Card>

					<Card className="border-indigo-200/50">
						<CardHeader>
							<CardTitle className="text-left text-lg flex items-center gap-2">
								<Globe className="h-5 w-5 text-indigo-500" />
								O site funciona offline?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								Parcialmente sim! A calculadora e histórico funcionam offline após o primeiro carregamento. 
								Apenas recursos que dependem de dados da comunidade (feed, estatísticas) precisam de conexão com internet.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Enhanced Footer */}
			<footer className="mt-16 py-12 border-t border-border/50 bg-gradient-to-r from-background via-muted/5 to-background">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3">
							{t('home.title')}
						</h2>
						<p className="text-muted-foreground mb-6">
							{t('home.footer.description')}
						</p>
						<div className="flex justify-center space-x-6 text-sm text-muted-foreground">
							<span>✨ {t('home.footer.feature1')}</span>
							<span>📊 {t('home.footer.feature2')}</span>
							<span>🌍 {t('home.footer.feature3')}</span>
							<span>🆓 {t('home.footer.feature4')}</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}