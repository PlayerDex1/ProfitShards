import { getCurrentUsername } from '@/hooks/use-auth';

type BackupPayload = Record<string, string>;

export interface BackupFile {
	v: number;
	app: string;
	user: string;
	salt: string; // base64
	iv: string; // base64
	ciphertext: string; // base64
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(buf: ArrayBuffer): string {
	const bytes = new Uint8Array(buf);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
	const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

function getUserScopedKeys(targetUser?: string | null): string[] {
	const u = (targetUser ?? getCurrentUsername() ?? 'guest');
	return [
		`worldshards-form-${u}`,
		`worldshards-history-${u}`,
		`worldshards-equip-session-${u}`,
		`worldshards-equip-history-${u}`,
		`worldshards-equip-builds-${u}`,
		`worldshards-mapdrops-${u}`,
		`worldshards-prefs-${u}`,
	];
}

export function collectUserData(targetUser?: string | null): BackupPayload {
	const keys = getUserScopedKeys(targetUser);
	const data: BackupPayload = {};
	for (const k of keys) {
		const v = localStorage.getItem(k);
		if (v !== null) data[k] = v;
	}
	return data;
}

export async function createEncryptedBackup(password: string): Promise<Blob> {
	const user = getCurrentUsername() ?? 'guest';
	const payload = collectUserData(user);
	const json = JSON.stringify(payload);
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveKey(password, salt);
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(json));
	const file: BackupFile = {
		v: 1,
		app: 'ProfitShards',
		user,
		salt: toBase64(salt.buffer),
		iv: toBase64(iv.buffer),
		ciphertext: toBase64(ciphertext),
	};
	return new Blob([JSON.stringify(file, null, 2)], { type: 'application/octet-stream' });
}

export async function restoreEncryptedBackup(password: string, fileText: string, restoreToCurrentUser: boolean = true): Promise<{ restoredKeys: number }>{
	const parsed: BackupFile = JSON.parse(fileText);
	if (!parsed || parsed.v !== 1 || parsed.app !== 'ProfitShards') throw new Error('Invalid backup');
	const salt = fromBase64(parsed.salt);
	const iv = fromBase64(parsed.iv);
	const key = await deriveKey(password, salt);
	let decrypted: ArrayBuffer;
	try {
		decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fromBase64(parsed.ciphertext));
	} catch {
		throw new Error('Wrong password or corrupted file');
	}
	const json = decoder.decode(decrypted);
	const data: BackupPayload = JSON.parse(json);
	const currentUser = getCurrentUsername() ?? 'guest';
	const srcUser = parsed.user;
	const keys = Object.keys(data);
	let count = 0;
	for (const k of keys) {
		let targetKey = k;
		if (restoreToCurrentUser) {
			// replace src user suffix with current user in key names
			const replaced = k.replace(srcUser, currentUser);
			targetKey = replaced;
		}
		localStorage.setItem(targetKey, data[k]);
		count++;
	}
	// Dispatch events to refresh UI where applicable
	window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
	window.dispatchEvent(new CustomEvent('worldshards-equip-history-updated'));
	window.dispatchEvent(new CustomEvent('worldshards-equip-builds-updated'));
	window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
	return { restoredKeys: count };
}

