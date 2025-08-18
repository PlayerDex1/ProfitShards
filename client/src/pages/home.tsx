import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Results } from "@/components/Results";
import { EquipmentButton, EquipmentInterface } from "@/components/equipment";
import { Sidebar } from "@/components/Sidebar";
import { useCalculator } from "@/hooks/use-calculator";
import { useEquipment } from "@/hooks/useEquipment";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link } from "wouter";

export default function Home() {
	const { formData, results, breakdown, updateFormData, saveToHistory } = useCalculator();
	const [activeSection, setActiveSection] = useState('calculator');
	const { session, totalLuck, isOpen, openEquipment, closeEquipment, updateEquipment } = useEquipment();
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
							<Link href="/perfil" className="text-white/90 underline">Abrir Perfil (Luck: {totalLuck})</Link>
						</div>
						<Calculator 
							formData={formData}
							onUpdateFormData={updateFormData}
							onSaveToHistory={handleSaveToHistory}
						/>
						<Results results={results} breakdown={breakdown} />

					</div>
				);
		}
	};

	return (
		<div
			className="min-h-screen text-white"
			style={{
				backgroundImage: "url(https://ucc1148e8d60a90d462482626b53.previews.dropboxusercontent.com/p/thumb/ACtx04ToK2TB0oJhHFpp1D__lhrKR4Cs_LTM0Br8HFGWmgfhWCQDGspJkB_ltkCOmNO5oSnqE0mSFmus5cYzmHzSXi1TO4O1Z0kZCi9ZrLGLqjleyLISiFvISzRK0LyVcAEwUDNaCW1xYgm_TuuDI01Hxs44PHqTHo3OwaIs5RuhSstCI1jAI_FJWKYPSumXTvTOwDF83Ns2kUP8_GIWWVAliYzAjrtIm-jv7GCJQtP_qdvZ9_mimGBZPUvm5Z5ZayNNUNYikBSOccwitFLMc4MaziSV0Yj8QaIiKusjwIUSVYav7J1MFhqOnowqS9Gr9IvOcU7zO9gqnCScFon8PTrBAjBYUCZ4CL9rct2hd_De_A/p.jpeg)",
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundAttachment: 'fixed',
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
