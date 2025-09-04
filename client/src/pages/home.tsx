import React, { useState, useEffect } from "react";
import { HeaderModern } from "@/components/HeaderModern";
import { HeroModern } from "@/components/HeroModern";
import { FeaturesModern } from "@/components/FeaturesModern";
import { Sidebar } from "@/components/Sidebar";
import { useI18n } from "@/i18n";
import { importBuildsFromUrl } from "@/lib/equipmentBuilds";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, User, Calculator, Map, BarChart3, Zap, Target, Users, ArrowRight, 
  Sparkles, Globe, ExternalLink, ShoppingCart, HelpCircle, Gamepad2, Coins, MessageCircle, Gift, Star, CheckCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGiveaway } from "@/hooks/use-giveaway";
import { GiveawayBanner } from "@/components/GiveawayBanner";
import { GiveawayModal } from "@/components/GiveawayModal";
import { WinnerBanner } from "@/components/WinnerBanner";
import { WinnersDisplay } from "@/components/WinnersDisplay";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { ActivityStream } from "@/components/ActivityStream";

export default function Home() {
	const { t } = useI18n();
	const { user, userProfile, isAuthenticated } = useAuth();
	const { activeGiveaway } = useGiveaway();
	const { checkForWinnerNotification } = usePushNotifications();
	const [showGiveaway, setShowGiveaway] = useState(false);

	// Função para abrir giveaway e atualizar URL
	const openGiveaway = () => {
		setShowGiveaway(true);
		const newUrl = `${window.location.pathname}?join=giveaway`;
		window.history.pushState({}, '', newUrl);
		console.log('🎊 GIVEAWAY OPENED + URL UPDATED:', newUrl);
	};

	// Função para fechar giveaway e limpar URL
	const closeGiveaway = () => {
		setShowGiveaway(false);
		window.history.pushState({}, '', window.location.pathname);
		console.log('❌ GIVEAWAY CLOSED + URL CLEANED');
	};

	useEffect(() => {
		importBuildsFromUrl();
	}, []);

	// Verificar se o usuário é ganhador quando a página carrega
	useEffect(() => {
		if (user && activeGiveaway) {
			const timer = setTimeout(() => {
				checkForWinnerNotification(activeGiveaway.id);
			}, 2000);
			
			return () => clearTimeout(timer);
		}
	}, [user, activeGiveaway, checkForWinnerNotification]);

	// Efeito para abrir modal do giveaway via URL
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const joinGiveaway = urlParams.get('join') === 'giveaway';
		const focusGiveaway = urlParams.get('giveaway') === 'true';
		
		if ((joinGiveaway || focusGiveaway) && activeGiveaway) {
			console.log('🎯 GIVEAWAY URL DETECTED:', { 
				join: joinGiveaway, 
				focus: focusGiveaway,
				activeGiveaway: !!activeGiveaway 
			});
			
			setTimeout(() => {
				if (joinGiveaway) {
					console.log('🎊 OPENING GIVEAWAY MODAL VIA URL...');
					setShowGiveaway(true);
				} else if (focusGiveaway) {
					const giveawaySection = document.getElementById('giveaway-section');
					if (giveawaySection) {
						console.log('📜 SCROLLING TO GIVEAWAY SECTION...');
						giveawaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
						
						giveawaySection.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
						giveawaySection.style.transition = 'all 0.3s ease';
						
						setTimeout(() => {
							giveawaySection.style.boxShadow = '';
						}, 3000);
					}
				}
			}, 1500);
		}
	}, [activeGiveaway]);

	return (
		<div className="min-h-screen bg-background">
			<HeaderModern />
			
			{/* Giveaway Banner */}
			{activeGiveaway && <GiveawayBanner onJoin={openGiveaway} />}
			
			{/* Winner Banner */}
			<WinnerBanner />
			
			{/* Winners Display */}
			<WinnersDisplay />
			
			<main>
				{/* Hero Section Moderno */}
				<HeroModern />
				
				{/* Features Section Moderna */}
				<FeaturesModern />
				
				{/* Main Content Grid */}
				<div className="container mx-auto px-4 py-20">
					<div className="grid lg:grid-cols-4 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-3 space-y-8">
							{/* Activity Stream */}
							<ActivityStream />
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1">
							<Sidebar />
						</div>
					</div>
				</div>
			</main>

			{/* Giveaway Modal */}
			{showGiveaway && (
				<GiveawayModal 
					onClose={closeGiveaway}
					activeGiveaway={activeGiveaway}
				/>
			)}
		</div>
	);
}