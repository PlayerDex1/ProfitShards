import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Sidebar } from "@/components/Sidebar";
import { Results } from "@/components/Results";
import { MapPlanner } from "@/components/MapPlanner";
import { useCalculator } from "@/hooks/use-calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
	const { formData, results, breakdown, updateFormData, saveToHistory } = useCalculator();
	const [activeSection, setActiveSection] = useState('calculator');
	const { session, totalLuck } = useEquipment();
	const { t } = useI18n();
	const { user, isAuthenticated } = useAuth();

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
				{/* Navigation and Welcome */}
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							{t('home.title')}
						</h1>
						<p className="text-muted-foreground mt-1">
							{t('home.subtitle')}
						</p>
					</div>
					
					{/* Profile Link */}
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
										Bem-vindo, {user}!
									</h2>
									<p className="text-sm text-muted-foreground">
										Seus dados são salvos automaticamente na nuvem
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar */}
					<div className="lg:col-span-1">
						<Sidebar 
							activeSection={activeSection} 
							onSectionChange={setActiveSection}
						/>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-2">
						{activeSection === 'calculator' && (
							<Calculator
								formData={formData}
								onUpdateFormData={updateFormData}
								onSaveToHistory={handleSaveToHistory}
							/>
						)}
						
						{activeSection === 'planner' && (
							<MapPlanner />
						)}
						
						{activeSection === 'equipment' && (
							<Card>
								<CardHeader>
									<CardTitle className="text-foreground">
										{t('equipment.title')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Configure seus equipamentos para otimizar os cálculos.
									</p>
									<Link href="/perfil" className="text-primary hover:text-primary/80 underline">
										Ir para página de equipamentos completa →
									</Link>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Results */}
					<div className="lg:col-span-1">
						{results && (
							<Results 
								results={results}
								breakdown={breakdown}
								formData={formData}
								totalLuck={totalLuck}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}