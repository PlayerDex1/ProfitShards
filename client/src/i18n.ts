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