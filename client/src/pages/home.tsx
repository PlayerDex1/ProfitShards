import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Sidebar } from "@/components/Sidebar";
import { Results } from "@/components/Results";
import { useCalculator } from "@/hooks/use-calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
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
				{/* Welcome message for authenticated users */}
				{isAuthenticated && (
					<Card className="mb-6 bg-primary/5 border-primary/20">
						<CardContent className="pt-6">
							<div className="flex items-center space-x-3">
								<TrendingUp className="h-6 w-6 text-primary" />
								<div>
									<h2 className="text-lg font-semibold text-foreground">
										{t('welcome.title', { user: user || 'Usuário' })}
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
							<Card>
								<CardHeader>
									<CardTitle className="text-foreground">
										{t('planner.title')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										Planejador de mapas em desenvolvimento...
									</p>
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