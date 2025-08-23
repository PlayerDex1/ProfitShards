import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Results } from "@/components/Results";
import { useCalculator } from "@/hooks/use-calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
	const { formData, results, breakdown, updateFormData, saveToHistory } = useCalculator();
	const { totalLuck } = useEquipment();
	const { t } = useI18n();
	const { user, userProfile, isAuthenticated } = useAuth();

	useEffect(() => {
		importBuildsFromUrl();
	}, []);

	const handleSaveToHistory = () => {
		if (results) {
			saveToHistory(formData, results);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<Header />
			
			<div className="container mx-auto px-4 py-6">
				{/* Profile Link */}
				<div className="flex justify-end items-center mb-6">
					<Link href="/perfil" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
						<User className="h-5 w-5" />
						<span className="font-medium">
							{isAuthenticated 
								? `Perfil de ${user}`
								: t('nav.profile')
							}
						</span>
					</Link>
				</div>

				{/* Welcome message for authenticated users */}
				{isAuthenticated && (
					<Card className="mb-6 bg-primary/5 border-primary/20">
						<CardContent className="pt-6">
							<div className="flex items-center space-x-3">
								<TrendingUp className="h-6 w-6 text-primary" />
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

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content - Calculator */}
					<div className="lg:col-span-2">
						<Calculator
							formData={formData}
							onUpdateFormData={updateFormData}
							onSaveToHistory={handleSaveToHistory}
						/>
					</div>

					{/* Results */}
					<div className="lg:col-span-1">
						<Results 
							results={results}
							breakdown={breakdown}
							formData={formData}
							totalLuck={totalLuck}
						/>
					</div>
				</div>
			</div>
			
			{/* Footer */}
			<footer className="mt-12 py-8 border-t border-border/50">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-foreground mb-2">WorldShards Game</h2>
						<p className="text-sm text-muted-foreground">
							Ferramenta de cálculo de lucro desenvolvida pela comunidade
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}