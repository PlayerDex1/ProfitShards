import { nanoid } from 'nanoid';
import { EquipmentSession } from '@/types/equipment';
import { getCurrentUsername, useAuth } from '@/hooks/use-auth';

export interface EquipmentBuild {
  id: string;
  name: string;
  session: EquipmentSession;
  createdAt: number;
}

function keyForUser(username: string | null): string {
  const user = username ?? 'guest';
  return `worldshards-equip-builds-${user}`;
}

export function getBuilds(): EquipmentBuild[] {
  try {
    const raw = localStorage.getItem(keyForUser(getCurrentUsername()));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBuild(name: string, session: EquipmentSession): EquipmentBuild {
  const builds = getBuilds();
  const build: EquipmentBuild = { id: nanoid(8), name: name.trim() || 'Build', session, createdAt: Date.now() };
  const next = [...builds, build].slice(-50);
  
  // Sempre salvar no localStorage (fallback)
  localStorage.setItem(keyForUser(getCurrentUsername()), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('worldshards-equip-builds-updated'));
  
  // Para usuários autenticados, também salvar no servidor
  const user = getCurrentUsername();
  if (user && user !== 'guest') {
    fetch('/api/user/save-calculation', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'equipment',
        data: {
          buildName: build.name,
          equipmentData: build.session,
          createdAt: build.createdAt
        }
      })
    }).catch(error => {
      console.warn('⚠️ Falha ao salvar build no servidor:', error);
    });
  }
  
  return build;
}

export function deleteBuild(id: string) {
  const builds = getBuilds().filter(b => b.id !== id);
  localStorage.setItem(keyForUser(getCurrentUsername()), JSON.stringify(builds));
  window.dispatchEvent(new CustomEvent('worldshards-equip-builds-updated'));
}

export function findBuild(id: string): EquipmentBuild | undefined {
  return getBuilds().find(b => b.id === id);
}

export function importBuilds(jsonText: string) {
  try {
    const imported: EquipmentBuild[] = JSON.parse(jsonText);
    const existing = getBuilds();
    const merged = [...existing, ...imported.map(b => ({ ...b, id: nanoid(8) }))].slice(-200);
    localStorage.setItem(keyForUser(getCurrentUsername()), JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('worldshards-equip-builds-updated'));
  } catch (e) {
    console.error('Invalid builds JSON', e);
  }
}

export function exportBuilds(): string {
  const builds = getBuilds();
  return JSON.stringify(builds, null, 2);
}

export function importBuildsFromUrl() {
	try {
		const params = new URLSearchParams(location.search);
		const short = params.get('b');
		if (short) {
			// dynamic import to keep bundle lean
			import('lz-string').then(({ decompressFromEncodedURIComponent }) => {
				const json = decompressFromEncodedURIComponent(short || '') || '';
				if (json) importBuilds(json);
			});
			return;
		}
		const legacy = params.get('builds');
		if (legacy) {
			try {
				const json = decodeURIComponent(escape(atob(legacy)));
				importBuilds(json);
			} catch {}
		}
	} catch {}
}