import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    
    // Criar tabela se não existir
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS giveaways (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          prize TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          max_participants INTEGER,
          current_participants INTEGER DEFAULT 0,
          rules TEXT,
          requirements TEXT,
          winner_announcement TEXT,
          image_url TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (setupError) {
      console.log('Tabela já existe:', setupError);
    }

    // 1. Buscar TODOS os giveaways (sem filtro)
    const allResult = await env.DB.prepare(`
      SELECT 
        id, title, description, prize, start_date, end_date, status,
        max_participants, current_participants, created_at, updated_at
      FROM giveaways 
      ORDER BY created_at DESC
    `).all();

    // 2. Data/hora atual
    const now = new Date();
    const nowISO = now.toISOString();
    const nowSQLite = now.toISOString().replace('T', ' ').slice(0, 19); // SQLite format

    // 3. Analisar cada giveaway
    const analysis = allResult.results.map((row: any) => {
      const startDate = new Date(row.start_date);
      const endDate = new Date(row.end_date);
      
      return {
        id: row.id,
        title: row.title,
        status: row.status,
        start_date: row.start_date,
        end_date: row.end_date,
        created_at: row.created_at,
        analysis: {
          isStatusActive: row.status === 'active',
          hasStarted: now >= startDate,
          hasNotEnded: now <= endDate,
          startDateParsed: startDate.toISOString(),
          endDateParsed: endDate.toISOString(),
          currentTime: nowISO,
          wouldBeActive: row.status === 'active' && now >= startDate && now <= endDate
        }
      };
    });

    // 4. Teste da query original
    const activeResult = await env.DB.prepare(`
      SELECT 
        id, title, status, start_date, end_date
      FROM giveaways 
      WHERE status = 'active'
        AND start_date <= datetime('now')
        AND end_date >= datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `).first();

    // 5. Teste com diferentes formatos de data
    const tests = {
      test1_datetime_now: await env.DB.prepare(`SELECT datetime('now') as now`).first(),
      test2_active_status: await env.DB.prepare(`SELECT COUNT(*) as count FROM giveaways WHERE status = 'active'`).first(),
      test3_date_comparison: await env.DB.prepare(`
        SELECT id, title, start_date, end_date,
               datetime('now') as current_time,
               (start_date <= datetime('now')) as started,
               (end_date >= datetime('now')) as not_ended
        FROM giveaways 
        WHERE status = 'active'
      `).all()
    };

    return createResponse({
      debug: {
        totalGiveaways: allResult.results.length,
        currentTime: {
          iso: nowISO,
          sqlite: nowSQLite,
          js: now.toString()
        },
        allGiveaways: allResult.results,
        analysis: analysis,
        activeQueryResult: activeResult,
        tests: tests,
        conclusion: {
          foundActive: !!activeResult,
          activeTitle: activeResult?.title || 'NENHUM',
          possibleIssues: [
            !allResult.results.length ? 'Nenhum giveaway no banco' : null,
            !allResult.results.some(g => g.status === 'active') ? 'Nenhum com status active' : null,
            'Problema de timezone/formato de data',
            'Query SQL com problema'
          ].filter(Boolean)
        }
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return createErrorResponse(`Debug failed: ${error.message}`, 500);
  }
}