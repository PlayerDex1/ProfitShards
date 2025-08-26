import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ActivityStream } from "@/components/ActivityStream";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, Calculator, Map, BarChart3, Zap, Target, Users, ArrowRight, Sparkles, Globe } from "lucide-react";
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
			
			<div className="container mx-auto px-4 py-6">
				{/* Hero Section - Boas-vindas */}
				<div className="text-center mb-12">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
						<div className="relative bg-background/80 backdrop-blur border border-border/50 rounded-2xl p-8 md:p-12">
							<div className="flex justify-center mb-6">
								<Badge className="px-4 py-2 bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary border-primary/30">
									<Sparkles className="h-4 w-4 mr-2" />
									WorldShards Calculator
								</Badge>
							</div>
							
							<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
								Maximize Seus Lucros
							</h1>
							
							<p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
								Ferramenta completa para calcular, planejar e acompanhar suas runs no WorldShards. 
								<span className="text-primary font-semibold"> Junte-se à comunidade!</span>
							</p>
							
							{/* Quick Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
								<Link href="/perfil">
									<Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 px-8 py-6 text-lg">
										<Calculator className="mr-2 h-5 w-5" />
										Começar a Calcular
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
								
								{!isAuthenticated && (
									<Button variant="outline" size="lg" className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/10">
										<User className="mr-2 h-5 w-5" />
										Criar Conta Grátis
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Features Preview */}
				<div className="mb-12">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold text-foreground mb-4">
							🛠️ Suas Ferramentas de Sucesso
						</h2>
						<p className="text-muted-foreground text-lg">
							Tudo que você precisa para dominar o WorldShards em um só lugar
						</p>
					</div>
					
					<div className="grid md:grid-cols-3 gap-6">
						{/* Calculator Feature */}
						<Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
							<CardHeader>
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-green-500/10 rounded-lg">
										<Calculator className="h-6 w-6 text-green-600" />
									</div>
									<CardTitle className="text-green-600">Calculadora Avançada</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground mb-4">
									Calcule seus lucros com precisão, considerando todos os fatores: investimento, gems, luck e eficiência.
								</p>
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary" className="text-xs">ROI em tempo real</Badge>
									<Badge variant="secondary" className="text-xs">Simulação avançada</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Map Planner Feature */}
						<Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
							<CardHeader>
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-blue-500/10 rounded-lg">
										<Map className="h-6 w-6 text-blue-600" />
									</div>
									<CardTitle className="text-blue-600">Planejador de Mapas</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground mb-4">
									Registre suas runs, acompanhe estatísticas e otimize suas estratégias com dados reais.
								</p>
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary" className="text-xs">Histórico completo</Badge>
									<Badge variant="secondary" className="text-xs">Métricas detalhadas</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Analytics Feature */}
						<Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
							<CardHeader>
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-purple-500/10 rounded-lg">
										<BarChart3 className="h-6 w-6 text-purple-600" />
									</div>
									<CardTitle className="text-purple-600">Analytics & Insights</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground mb-4">
									Visualize tendências, compare performance e descubra as melhores oportunidades de lucro.
								</p>
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary" className="text-xs">Gráficos dinâmicos</Badge>
									<Badge variant="secondary" className="text-xs">Comparações</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Community Stats */}
				{isAuthenticated && (
					<Card className="mb-8 bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20">
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-primary/10 rounded-full">
										<TrendingUp className="h-6 w-6 text-primary animate-pulse" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-foreground">
											Bem-vindo de volta, {userProfile?.username || user?.split('@')[0]}! 👋
										</h2>
										<p className="text-sm text-muted-foreground">
											Pronto para mais uma sessão de farming lucrativo?
										</p>
									</div>
								</div>
								<Link href="/perfil">
									<Button className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30">
										<Target className="mr-2 h-4 w-4" />
										Ir ao Perfil
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Activity Feed - Ampliado */}
				<div className="mb-8">
					<div className="text-center mb-8">
						<div className="flex items-center justify-center space-x-3 mb-4">
							<div className="p-2 bg-orange-500/10 rounded-lg">
								<Globe className="h-6 w-6 text-orange-600" />
							</div>
							<h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
								🔥 Atividade da Comunidade
							</h2>
						</div>
						<p className="text-muted-foreground text-lg mb-6">
							Veja em tempo real o que outros players estão fazendo. Inspire-se e compita!
						</p>
						
						{/* Community Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-primary">1.2k+</div>
								<div className="text-sm text-muted-foreground">Runs Hoje</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">$45M</div>
								<div className="text-sm text-muted-foreground">Lucro Total</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">350+</div>
								<div className="text-sm text-muted-foreground">Players Ativos</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-600">98%</div>
								<div className="text-sm text-muted-foreground">Taxa Sucesso</div>
							</div>
						</div>
					</div>
					
					{/* Activity Stream */}
					<div className="max-w-6xl mx-auto">
						<ActivityStream />
					</div>
				</div>

				{/* Call to Action for Non-Authenticated Users */}
				{!isAuthenticated && (
					<Card className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/30">
						<CardContent className="p-8 text-center">
							<h3 className="text-2xl font-bold text-foreground mb-4">
								Pronto para Começar Sua Jornada? 🚀
							</h3>
							<p className="text-muted-foreground mb-6 text-lg">
								Junte-se a centenas de players que já estão maximizando seus lucros no WorldShards
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/perfil">
									<Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 px-8">
										<Zap className="mr-2 h-5 w-5" />
										Experimentar Agora (Grátis)
									</Button>
								</Link>
								<Button variant="outline" size="lg" className="px-8 border-primary/30 hover:bg-primary/10">
									<Users className="mr-2 h-5 w-5" />
									Ver Mais Features
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
			
			{/* Enhanced Footer */}
			<footer className="mt-16 py-12 border-t border-border/50 bg-gradient-to-r from-background via-muted/5 to-background">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3">
							WorldShards Calculator
						</h2>
						<p className="text-muted-foreground mb-6">
							A ferramenta definitiva para farming inteligente. Desenvolvida pela comunidade, para a comunidade.
						</p>
						<div className="flex justify-center space-x-6 text-sm text-muted-foreground">
							<span>✨ Cálculos Precisos</span>
							<span>📊 Analytics Avançados</span>
							<span>🌍 Comunidade Ativa</span>
							<span>🆓 Totalmente Gratuito</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}