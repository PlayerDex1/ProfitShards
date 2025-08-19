import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createEncryptedBackup, restoreEncryptedBackup } from '@/lib/backup';

export function BackupPanel() {
	const [password, setPassword] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [message, setMessage] = useState<string>('');

	const onExport = async () => {
		try {
			if (!password) { setMessage('Choose a backup password.'); return; }
			const blob = await createEncryptedBackup(password);
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
			await restoreEncryptedBackup(password, text, true);
			setMessage('Backup restored.');
		} catch (e: any) {
			setMessage(e?.message || 'Import failed.');
		}
	};

	return (
		<Card className="bg-black/50 border-white/10">
			<CardHeader className="py-4">
				<CardTitle className="text-lg">Backup (Encrypted)</CardTitle>
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

