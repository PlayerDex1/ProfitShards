import { Calculator, Package, BarChart3, Heart, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalculationResults } from "@/types/calculator";
import { useI18n } from "@/i18n";
import { useState } from "react";

interface SidebarProps {
	results: CalculationResults | null;
	activeSection: string;
	onSectionChange: (section: string) => void;
}

export function Sidebar({ results, activeSection, onSectionChange }: SidebarProps) {
	const { t } = useI18n();
	const [copied, setCopied] = useState(false);
	const menuItems = [
		{ id: 'calculator', label: t('sidebar.nav.calculator'), icon: Calculator },
		{ id: 'equipment', label: t('sidebar.nav.equipment'), icon: Package },
		{ id: 'history', label: t('sidebar.nav.history'), icon: BarChart3 },
	];

	const wallet = '0x05b6D4956C8317FF143120Ec5C100c6FE0eCD0B5';
	const copyWallet = async () => {
		try {
			await navigator.clipboard.writeText(wallet);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	};

	return (
		<div className="lg:col-span-3">
			<div className="bg-black rounded-xl shadow-sm border border-gray-800 p-6">
				<h2 className="text-lg font-semibold text-white mb-4">{t('sidebar.summary')}</h2>
				
				{/* Quick Stats */}
				<div className="space-y-4">
					<div className="bg-white/5 p-4 rounded-lg">
						<div className="text-sm text-white/70 font-medium">{t('sidebar.totalProfit')}</div>
						<div className="text-2xl font-bold text-white font-mono" data-testid="text-total-profit">
							{results ? `$${results.netProfit.toFixed(2)}` : '$0.00'}
						</div>
					</div>
					
					<div className="bg-white/5 p-4 rounded-lg">
						<div className="text-sm text-white/70 font-medium">{t('sidebar.roi')}</div>
						<div className="text-2xl font-bold text-white font-mono" data-testid="text-roi">
							{results ? `${results.roi.toFixed(1)}%` : '0.0%'}
						</div>
					</div>
					
					<div className="bg-white/5 p-4 rounded-lg">
						<div className="text-sm text-white/70 font-medium">{t('sidebar.efficiency')}</div>
						<div className="text-2xl font-bold text-white font-mono" data-testid="text-efficiency">
							{results ? `${results.efficiency.toFixed(1)}/10` : '0.0/10'}
						</div>
					</div>
				</div>

				{/* Donations */}
				<div className="mt-8 space-y-3">
					<div className="flex items-center gap-2">
						<Heart className="w-4 h-4 text-white" />
						<h3 className="text-sm font-semibold text-white">{t('donate.title')}</h3>
					</div>
					<a
						href="https://openloot.com/ambassador/link?code=HOLDBOY"
						target="_blank"
						rel="noopener noreferrer"
						className="block text-center bg-white text-black rounded-lg py-2 text-sm hover:bg-white/90"
					>
						{t('donate.openloot')}
					</a>
					<div className="bg-white/5 p-3 rounded-lg">
						<div className="text-xs text-white/70 mb-1">{t('donate.wallet')}</div>
						<div className="flex items-center gap-2">
							<span className="text-white font-mono text-xs break-all">{wallet}</span>
							<button onClick={copyWallet} className="ml-auto inline-flex items-center gap-1 text-white/80 hover:text-white text-xs">
								<Copy className="w-3 h-3" /> {copied ? t('donate.copied') : t('donate.copy')}
							</button>
						</div>
					</div>
				</div>
				
				{/* Navigation Menu */}
				<div className="mt-8">
					<nav className="space-y-2">
						{menuItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeSection === item.id;
							
							return (
								<button
									key={item.id}
									onClick={() => onSectionChange(item.id)}
									data-testid={`button-nav-${item.id}`}
									className={cn(
										"flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
										isActive
											? "text-black bg-white"
											: "text-white/80 hover:text-white hover:bg-white/10"
									)}
								>
									<Icon className="w-4 h-4 mr-3" />
									{item.label}
								</button>
							);
						})}
					</nav>
				</div>
			</div>
		</div>
	);
}
