import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Sidebar } from "@/components/Sidebar";
import { useCalculator } from "@/hooks/use-calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function Home() {
	const { formData, results, breakdown, updateFormData, saveToHistory } = useCalculator();
	const [activeSection, setActiveSection] = useState('calculator');
	const { session, totalLuck } = useEquipment();
	const { t } = useI18n();

	useEffect(() => {
		importBuildsFromUrl();
	}, []);

	const handleSaveToHistory = () => {
		if (results) {
			saveToHistory(formData, results);
		}
	};

	const renderContent = () => {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Calculadora</h2>
					<Link href="/perfil" className="text-white/90 underline">Abrir Perfil (Luck: {totalLuck})</Link>
				</div>
				<Calculator 
					formData={formData}
					onUpdateFormData={updateFormData}
					onSaveToHistory={handleSaveToHistory}
				/>

				{/* Final Profit Card only */}
				{results && (
					<Card className="bg-black border-gray-800">
						<CardContent className="p-4">
							<div className="flex items-center space-x-2 mb-3">
								<div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
									<TrendingUp className="w-4 h-4 text-black" />
								</div>
								<h3 className="text-base font-semibold text-white">{t('results.finalProfit')}</h3>
							</div>
							<div className="text-3xl font-bold text-white font-mono" data-testid="text-final-profit">
								${results.finalProfit.toFixed(2)}
							</div>
							<p className="text-white/80 text-sm mt-1">
								{results.finalProfit > 0 ? t('results.profitable') : t('results.loss')}
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		);
	};

	return (
		<div
			className="min-h-screen text-white"
			style={{
				// Usa sempre o asset local estável; se quiser, mantenha externa como backup no futuro
				backgroundImage: `linear-gradient(rgba(13,148,136,0.12), rgba(0,0,0,0.7)), url(/bg-home.jpeg), url(/og-image.png)`,
				backgroundSize: 'cover, cover',
				backgroundPosition: 'center, center',
				backgroundRepeat: 'no-repeat, no-repeat',
				backgroundAttachment: 'fixed',
				backgroundColor: '#000',
			}}
		>
			<Header />
			
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					<div className="lg:col-span-3">
						<Sidebar 
							results={results}
							activeSection={activeSection}
							onSectionChange={setActiveSection}
						/>
					</div>
					
					<div className="lg:col-span-9">
						{renderContent()}
					</div>
				</div>
			</main>

			<footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
				<div className="mt-8 flex flex-col items-center gap-2">
					<p className="text-white font-extrabold text-3xl sm:text-4xl tracking-wide">WorldShards</p>
				</div>
			</footer>
		</div>
	);
}
