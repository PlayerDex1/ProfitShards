import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'pt' | 'en';

type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = {
  pt: {
    'header.title': 'Calculadora de Lucro - Worldshards',
    'header.subtitle': 'Configure seus investimentos e calcule o lucro líquido final',
    'header.login': 'Entrar',
    'header.logout': 'Sair',
    'header.theme': 'Alternar tema',
    'header.lang': 'Idioma',

    'auth.title': 'Entrar',
    'auth.username': 'Apelido',
    'auth.password': 'Senha',
    'auth.cancel': 'Cancelar',
    'auth.login': 'Entrar',
    'auth.note': 'As credenciais ficam apenas no seu navegador.',

    'equipment.title': 'Equipamento - ',
    'equipment.config': 'Configuração de equipamento para esta sessão',
    'equipment.rarity': 'Raridade',
    'equipment.luck': 'Luck',
    'equipment.totalLuck': 'Total de Luck',
    'equipment.save': 'Salvar',
    'equipment.cancel': 'Cancelar',
    'equipment.apply': 'Aplicar',
    'equipment.applyBuildB': 'Aplicar Build B',
    'equipment.builds': 'Builds Salvas',
    'equipment.builds.none': 'Nenhuma build salva ainda',
    'equipment.builds.name': 'Nome da build',
    'equipment.export': 'Exportar',
    'equipment.import': 'Importar',
    'equipment.compare': 'Comparar Builds',
    'equipment.selectA': 'Selecione Build A',
    'equipment.selectB': 'Selecione Build B',
    'equipment.luckA': 'Luck A',
    'equipment.luckB': 'Luck B',
    'equipment.diff': 'Diferença',
    'equipment.effect': 'Efeito estimado',
    'equipment.tip.title': 'Dica',
    'equipment.tip.body': 'Use os presets de raridade e os botões ± para ajustar rapidamente. Suas builds e sessões são salvas por usuário.',
    'equipment.whatif': 'What‑if de Luck',
    'equipment.whatif.hint': 'Ajuste para simular total de Luck e ver impacto nos cálculos (aprimoramento futuro).',

    'button.delete': 'Excluir',
    'results.totalTokenValue': 'Valor Total dos Tokens',
    'results.gemsCost': 'Custo das Gemas',
    'results.grossProfit': 'Lucro Bruto',
    'results.rebuyCost': 'Custo Recompra Gemas',
    'results.roi': 'ROI',
    'results.no_history': 'Nenhum cálculo salvo ainda',
    'results.history_will_appear': 'Seus cálculos aparecerão aqui automaticamente',
    'results.finalProfitTitle': 'Lucro Líquido Final',
    'results.profitable': 'Investimento Lucrativo',
    'results.loss': 'Prejuízo',
    'results.summaryTitle': 'Resumo',
    'results.tokenDistribution': 'Distribuição de Tokens',
    'results.equipTokens': 'Tokens dos Equipamentos',
    'results.farmedTokens': 'Tokens Farmados',
    'results.totalTokensCount': 'Total de Tokens',
    'results.efficiencyMetrics': 'Métricas de Eficiência',
    'results.totalTokensLabel': 'Total de Tokens',
    'results.farmEfficiency': 'Eficiência Farm',
    'results.performanceOverTime': 'Performance ao Longo do Tempo',
    'results.history.title': 'Histórico de Cálculos',
    'results.history.show': 'Mostrar',
    'results.history.hide': 'Ocultar',
    'results.history.clear': 'Limpar',
    'results.history.clickToShow': 'Clique em "Mostrar" para ver o histórico',

    'status.excellent': 'Excelente',
    'status.positive': 'Positivo',
    'status.negative': 'Negativo',
    'status.neutral': 'Neutro',

    'calc.title': 'Calculadora',
    'calc.investment': 'Investimento Inicial (USD)',
    'calc.gemsConsumed': 'Gemas Consumidas',
    'calc.loadsUsed': 'Cargas Utilizadas',
    'calc.gemsPurchased': 'Gemas Compradas',
    'calc.tokensEquipment': 'Tokens dos Equipamentos',
    'calc.tokenPrice': 'Preço Token (USD)',
    'calc.gemsRemaining': 'Gemas Restantes',
    'calc.tokensFarmed': 'Tokens Farmados',
    'calc.gemPrice': 'Preço Gema (USD)',
    'calc.button': 'Calcular Lucro Líquido',

    'sidebar.summary': 'Resumo Rápido',
    'sidebar.totalProfit': 'Lucro Total',
    'sidebar.roi': 'ROI',
    'sidebar.efficiency': 'Eficiência',
    'sidebar.nav.calculator': 'Calculadora',
    'sidebar.nav.equipment': 'Equipamentos',
    'sidebar.nav.history': 'Histórico',

    'home.calculator': 'Calculadora',
    'equipment.button': 'Equipamento (Luck: {luck})',

    '404.title': '404 Página não encontrada',
    '404.hint': 'Você esqueceu de adicionar a página ao roteador?',
  },
  en: {
    'header.title': 'Profit Calculator - Worldshards',
    'header.subtitle': 'Set your investments and calculate net profit',
    'header.login': 'Sign in',
    'header.logout': 'Sign out',
    'header.theme': 'Toggle theme',
    'header.lang': 'Language',

    'auth.title': 'Sign in',
    'auth.username': 'Nickname',
    'auth.password': 'Password',
    'auth.cancel': 'Cancel',
    'auth.login': 'Sign in',
    'auth.note': 'Credentials are stored only in your browser.',

    'equipment.title': 'Equipment - ',
    'equipment.config': 'Equipment configuration for this session',
    'equipment.rarity': 'Rarity',
    'equipment.luck': 'Luck',
    'equipment.totalLuck': 'Total Luck',
    'equipment.save': 'Save',
    'equipment.cancel': 'Cancel',
    'equipment.apply': 'Apply',
    'equipment.applyBuildB': 'Apply Build B',
    'equipment.builds': 'Saved Builds',
    'equipment.builds.none': 'No builds saved yet',
    'equipment.builds.name': 'Build name',
    'equipment.export': 'Export',
    'equipment.import': 'Import',
    'equipment.compare': 'Compare Builds',
    'equipment.selectA': 'Select Build A',
    'equipment.selectB': 'Select Build B',
    'equipment.luckA': 'Luck A',
    'equipment.luckB': 'Luck B',
    'equipment.diff': 'Difference',
    'equipment.effect': 'Estimated effect',
    'equipment.tip.title': 'Tip',
    'equipment.tip.body': 'Use rarity presets and ± buttons for quick adjustments. Your builds and sessions are saved per user.',
    'equipment.whatif': 'Luck What‑if',
    'equipment.whatif.hint': 'Adjust to simulate total Luck and see impact (future enhancement).',

    'button.delete': 'Delete',
    'results.totalTokenValue': 'Total Token Value',
    'results.gemsCost': 'Gems Cost',
    'results.grossProfit': 'Gross Profit',
    'results.rebuyCost': 'Gems Rebuy Cost',
    'results.roi': 'ROI',
    'results.no_history': 'No calculations saved yet',
    'results.history_will_appear': 'Your calculations will appear here automatically',
    'results.finalProfitTitle': 'Final Net Profit',
    'results.profitable': 'Profitable Investment',
    'results.loss': 'Loss',
    'results.summaryTitle': 'Summary',
    'results.tokenDistribution': 'Token Distribution',
    'results.equipTokens': 'Equipment Tokens',
    'results.farmedTokens': 'Farmed Tokens',
    'results.totalTokensCount': 'Total Tokens',
    'results.efficiencyMetrics': 'Efficiency Metrics',
    'results.totalTokensLabel': 'Total Tokens',
    'results.farmEfficiency': 'Farm Efficiency',
    'results.performanceOverTime': 'Performance Over Time',
    'results.history.title': 'Calculations History',
    'results.history.show': 'Show',
    'results.history.hide': 'Hide',
    'results.history.clear': 'Clear',
    'results.history.clickToShow': 'Click "Show" to view history',

    'status.excellent': 'Excellent',
    'status.positive': 'Positive',
    'status.negative': 'Negative',
    'status.neutral': 'Neutral',

    'calc.title': 'Calculator',
    'calc.investment': 'Initial Investment (USD)',
    'calc.gemsConsumed': 'Gems Consumed',
    'calc.loadsUsed': 'Loads Used',
    'calc.gemsPurchased': 'Gems Purchased',
    'calc.tokensEquipment': 'Equipment Tokens',
    'calc.tokenPrice': 'Token Price (USD)',
    'calc.gemsRemaining': 'Gems Remaining',
    'calc.tokensFarmed': 'Farmed Tokens',
    'calc.gemPrice': 'Gem Price (USD)',
    'calc.button': 'Calculate Net Profit',

    'sidebar.summary': 'Quick Summary',
    'sidebar.totalProfit': 'Total Profit',
    'sidebar.roi': 'ROI',
    'sidebar.efficiency': 'Efficiency',
    'sidebar.nav.calculator': 'Calculator',
    'sidebar.nav.equipment': 'Equipment',
    'sidebar.nav.history': 'History',

    'home.calculator': 'Calculator',
    'equipment.button': 'Equipment (Luck: {luck})',

    '404.title': '404 Page Not Found',
    '404.hint': 'Did you forget to add the page to the router?',
  },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({ lang: 'pt', setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('worldshards-lang') as Lang | null;
    if (saved === 'en' || saved === 'pt') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('worldshards-lang', l);
    window.dispatchEvent(new CustomEvent('worldshards-lang-updated'));
  };

  const t = useMemo(() => (key: string) => dicts[lang][key] ?? key, [lang]);

  return React.createElement(LangContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useI18n() {
  return useContext(LangContext);
}