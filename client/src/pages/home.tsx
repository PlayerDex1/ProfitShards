import { useState } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Results } from "@/components/Results";
import { EquipmentButton, EquipmentInterface } from "@/components/equipment";
import { Sidebar } from "@/components/Sidebar";
import { useCalculator } from "@/hooks/use-calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { useI18n } from "@/i18n";

export default function Home() {
	const { formData, results, breakdown, updateFormData, saveToHistory } = useCalculator();
	const [activeSection, setActiveSection] = useState('calculator');
	const { session, totalLuck, isOpen, openEquipment, closeEquipment, updateEquipment } = useEquipment();
	const { t } = useI18n();

	const handleSaveToHistory = () => {
		if (results) {
			saveToHistory(formData, results);
		}
	};

	const renderContent = () => {
		switch (activeSection) {
			case 'history':
				return (
					<div className="space-y-4">
						<Results results={results} breakdown={breakdown} includeHistory />
					</div>
				);
			default:
				return (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">Calculadora</h2>
							<EquipmentButton onClick={openEquipment} totalLuck={totalLuck} />
						</div>
						<Calculator 
							formData={formData}
							onUpdateFormData={updateFormData}
							onSaveToHistory={handleSaveToHistory}
						/>
						<Results results={results} breakdown={breakdown} includeHistory />

						{/* Donations below calculator + equipment + history */}
						<div className="mt-8 space-y-3">
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-semibold text-white">{t('donate.title')}</h3>
							</div>
							<a
								href="https://openloot.com/ambassador/link?code=HOLDBOY"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block text-center bg-white text-black rounded-lg py-2 px-3 text-sm hover:bg-white/90"
							>
								{t('donate.openloot')}
							</a>
							<div className="bg-white/5 p-3 rounded-lg">
								<div className="text-xs text-white/70 mb-1">{t('donate.wallet')}</div>
								<div className="text-white font-mono text-xs break-all">0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5</div>
							</div>
						</div>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-black text-white">
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

			{isOpen && (
				<EquipmentInterface
					session={session}
					totalLuck={totalLuck}
					onClose={closeEquipment}
					onEquipmentChange={updateEquipment}
				/>
			)}
		</div>
	);
}
