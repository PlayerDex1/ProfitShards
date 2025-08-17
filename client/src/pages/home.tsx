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
							<EquipmentButton onClick={openEquipment} totalLuck={totalLuck} />
						</div>
						<Calculator 
							formData={formData}
							onUpdateFormData={updateFormData}
							onSaveToHistory={handleSaveToHistory}
						/>
						<Results results={results} breakdown={breakdown} includeHistory />

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
					<img
						src="https://uc90a4073598eb2abdfdc25fd606.previews.dropboxusercontent.com/p/thumb/ACvIAUwrTbHvs5wgQSOQGBqZaigkyyjczmvALj9BvIFzrn4Vk9jjFdR8qxAt3N6wEAfQF9gVFh7JfcEHLTmNA2pLqUBKyg1kkBdHym0IJgjhFwP9oMOPbcnbsE8FQMHrgejlzakA3OMBS8dEVnech2Alq1fu6mGX0JeNSzBGR2i4XEnrBq4KrWAREy60w1a6z0QFWPQQ3Sylo8sYimbLy6toNWgr2Q0ISAy179ozOeBLsBeFzX-CI1oMBm9o7iDPVDxrkLc-4nAj7eIoQeFtgbv8qndQWNpyn7ORVa0NbUqiwyGbScT-G3KJXx7qnWuVffJkLCSFZQkt8DyPfTIQWDuZ31YEvGqBtpDhY51CngzxKg/p.png"
						alt="WorldShards Game logo"
						className="h-12 w-12 object-contain"
					/>
					<p className="text-white font-semibold">WorldShards Game</p>
				</div>
			</footer>

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
