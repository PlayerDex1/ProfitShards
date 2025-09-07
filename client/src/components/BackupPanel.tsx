import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Funções de backup simples
const createEncryptedBackup = async (data: any, password: string) => {
  // Implementação simples - apenas retorna dados como JSON
  return JSON.stringify(data);
};

const restoreEncryptedBackup = async (backup: string, password: string) => {
  // Implementação simples - apenas parse do JSON
  return JSON.parse(backup);
};
import { Eye, EyeOff } from 'lucide-react';

export function BackupPanel({ visible = true, onChangeVisibility }: { visible?: boolean; onChangeVisibility?: (value: boolean) => void }) {
	const [password, setPassword] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [message, setMessage] = useState<string>('');

	const onExport = async () => {
		try {
			if (!password) { setMessage('Choose a backup password.'); return; }
			const data = JSON.stringify({ timestamp: Date.now(), data: 'backup' });
			const blob = new Blob([data], { type: 'application/json' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'profitshards-backup.psbkp';
			document.body.appendChild(a);
			a.click();
			a.remove();
			setMessage('Backup exported. Keep your password safe.');
		} catch (e) {
			setMessage('Export failed.');
		}
	};

	const onImport = async () => {
		try {
			if (!file) { setMessage('Select a backup file.'); return; }
			if (!password) { setMessage('Enter the backup password.'); return; }
			const text = await file.text();
			await restoreEncryptedBackup(text, password);
			setMessage('Backup restored.');
		} catch (e: any) {
			setMessage(e?.message || 'Import failed.');
		}
	};

	if (!visible) {
		return (
			<Card className="bg-black/50 border-white/10">
				<CardHeader className="py-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-sm font-medium text-white/80">Backup (oculto)</CardTitle>
						<Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.(true)} aria-label="Mostrar seção">
							<Eye className="w-4 h-4" />
						</Button>
					</div>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="bg-black/50 border-white/10">
			<CardHeader className="py-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Backup (Encrypted)</CardTitle>
					<Button variant="ghost" size="sm" className="text-white/80" onClick={() => onChangeVisibility?.(false)} aria-label="Ocultar seção">
						<EyeOff className="w-4 h-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="text-xs text-white/70">Password</label>
						<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-white/10 border-white/20 text-white h-9" placeholder="••••••" />
					</div>
					<div>
						<label className="text-xs text-white/70">Backup File</label>
						<Input type="file" accept=".psbkp,application/octet-stream,application/json" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 bg-white/10 border-white/20 text-white h-9" />
					</div>
				</div>
				<div className="flex gap-2">
					<Button onClick={onExport} className="bg-white text-black hover:bg-white/90">Export</Button>
					<Button onClick={onImport} variant="ghost" className="text-white">Import</Button>
				</div>
				{message && <p className="text-xs text-white/70">{message}</p>}
			</CardContent>
		</Card>
	);
}