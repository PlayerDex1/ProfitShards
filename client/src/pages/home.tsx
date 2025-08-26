import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ActivityStream } from "@/components/ActivityStream";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, User, Calculator } from "lucide-react";
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
				{/* Header Links */}
				<div className="flex justify-between items-center mb-6">
					<Link href="/perfil" className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-lg hover:from-green-500/20 hover:to-emerald-600/20 hover:shadow-md transition-all duration-300">
						<Calculator className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
						<span className="font-medium text-green-600">
							Calculadora
						</span>
					</Link>
					
					<Link href="/perfil" className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 rounded-lg hover:from-primary/20 hover:to-blue-600/20 hover:shadow-md transition-all duration-300">
						<User className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
						<span className="font-medium text-primary">
							{isAuthenticated 
								? `Perfil de ${user}`
								: t('nav.profile')
							}
						</span>
					</Link>
				</div>

				{/* Welcome message for authenticated users */}
				{isAuthenticated && (
					<Card className="mb-6 bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
						<CardContent className="pt-6">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-primary/10 rounded-full">
									<TrendingUp className="h-6 w-6 text-primary animate-pulse" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-foreground">
										{t('profile.welcome', { name: userProfile?.username || (user ? user.split('@')[0] : t('auth.guest')) })}
									</h2>
									<p className="text-sm text-muted-foreground">
										{t('profile.subtitle')}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Main Content - Activity Feed */}
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
							🔥 Feed de Atividades da Comunidade
						</h1>
						<p className="text-muted-foreground">
							Acompanhe em tempo real o que a comunidade está fazendo no WorldShards
						</p>
					</div>
					
					<ActivityStream />
				</div>


			</div>
			
			{/* Footer */}
			<footer className="mt-12 py-8 border-t border-border/50 bg-gradient-to-r from-background via-muted/5 to-background">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">WorldShards Game</h2>
						<p className="text-sm text-muted-foreground">
							Ferramenta de cálculo de lucro desenvolvida pela comunidade
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}