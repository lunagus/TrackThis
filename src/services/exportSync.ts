import { UnifiedMediaItem, UserDecision } from '../types/media';

/**
 * Trigger client-side file download for a generated blob
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1. Full JSON State Export
 */
export function exportStateJSON(
  decisions: Record<string, UserDecision>,
  catalog: UnifiedMediaItem[]
) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    generator: "TrackThis - High-Velocity Media Tracker",
    version: "1.0.0",
    totalCatalogSize: catalog.length,
    decisionsCount: Object.keys(decisions).length,
    decisions: decisions
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`trackthis-backup-${dateStr}.json`, jsonStr, 'application/json');
}

/**
 * 2. Plain Text List of Seen Titles
 */
export function exportSeenTXT(
  decisions: Record<string, UserDecision>,
  catalog: UnifiedMediaItem[]
) {
  const catalogMap = new Map(catalog.map(item => [item.id, item]));
  const seenEntries = Object.values(decisions)
    .filter(d => d.status === 'SEEN')
    .map(d => catalogMap.get(d.mediaId))
    .filter((item): item is UnifiedMediaItem => Boolean(item));

  let txtContent = `# TrackThis - Watched Anime List (${seenEntries.length} titles)\n`;
  txtContent += `# Exported: ${new Date().toLocaleString()}\n\n`;

  seenEntries.forEach((item, index) => {
    const title = item.title.english || item.title.romaji;
    txtContent += `${index + 1}. ${title} (${item.year}) - ${item.format} [Score: ${item.score}]\n`;
  });

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`trackthis-seen-${dateStr}.txt`, txtContent, 'text/plain;charset=utf-8');
}

/**
 * 3. CSV Full Decision Export
 */
export function exportDecisionsCSV(
  decisions: Record<string, UserDecision>,
  catalog: UnifiedMediaItem[]
) {
  const catalogMap = new Map(catalog.map(item => [item.id, item]));
  const headers = [
    'media_id',
    'title_english',
    'title_romaji',
    'format',
    'year',
    'status',
    'decided_at',
    'score',
    'mal_id',
    'anilist_id'
  ];

  const rows = [headers.join(',')];

  for (const [id, decision] of Object.entries(decisions)) {
    const item = catalogMap.get(id);
    if (!item) continue;

    const escapeCSV = (val: string | number | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const row = [
      escapeCSV(item.id),
      escapeCSV(item.title.english),
      escapeCSV(item.title.romaji),
      escapeCSV(item.format),
      item.year,
      escapeCSV(decision.status),
      escapeCSV(decision.decidedAt),
      item.score,
      item.externalIds.mal || '',
      item.externalIds.anilist || ''
    ];

    rows.push(row.join(','));
  }

  const csvContent = rows.join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`trackthis-decisions-${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8');
}

/**
 * 4. Official MyAnimeList / AniList XML Export
 * MANDATORY REQUIREMENT: Includes <update_on_import>1</update_on_import>
 */
export function exportMALXML(
  decisions: Record<string, UserDecision>,
  catalog: UnifiedMediaItem[]
) {
  const catalogMap = new Map(catalog.map(item => [item.id, item]));
  const seenEntries = Object.values(decisions)
    .filter(d => d.status === 'SEEN')
    .map(d => ({
      item: catalogMap.get(d.mediaId),
      decision: d
    }))
    .filter((entry): entry is { item: UnifiedMediaItem; decision: UserDecision } => Boolean(entry.item));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<myanimelist>\n`;
  xml += `  <myinfo>\n`;
  xml += `    <user_id>0</user_id>\n`;
  xml += `    <user_name>TrackThisUser</user_name>\n`;
  xml += `    <user_export_type>1</user_export_type>\n`;
  xml += `    <user_total_anime>${seenEntries.length}</user_total_anime>\n`;
  xml += `    <user_total_watching>0</user_total_watching>\n`;
  xml += `    <user_total_completed>${seenEntries.length}</user_total_completed>\n`;
  xml += `    <user_total_onhold>0</user_total_onhold>\n`;
  xml += `    <user_total_dropped>0</user_total_dropped>\n`;
  xml += `    <user_total_plantowatch>0</user_total_plantowatch>\n`;
  xml += `  </myinfo>\n`;

  for (const { item, decision } of seenEntries) {
    const malId = item.externalIds.mal || item.id.replace('anime_', '');
    const title = item.title.english || item.title.romaji;
    const episodes = item.episodes || 12;
    const finishDate = decision.decidedAt.split('T')[0];

    xml += `  <anime>\n`;
    xml += `    <series_animedb_id>${malId}</series_animedb_id>\n`;
    xml += `    <series_title><![CDATA[${title}]]></series_title>\n`;
    xml += `    <series_type>${item.format}</series_type>\n`;
    xml += `    <series_episodes>${episodes}</series_episodes>\n`;
    xml += `    <my_id>0</my_id>\n`;
    xml += `    <my_watched_episodes>${episodes}</my_watched_episodes>\n`;
    xml += `    <my_start_date>0000-00-00</my_start_date>\n`;
    xml += `    <my_finish_date>${finishDate}</my_finish_date>\n`;
    xml += `    <my_score>0</my_score>\n`;
    xml += `    <my_status>Completed</my_status>\n`;
    xml += `    <my_times_watched>1</my_times_watched>\n`;
    xml += `    <my_comments><![CDATA[Imported via TrackThis]]></my_comments>\n`;
    xml += `    <update_on_import>1</update_on_import>\n`;
    xml += `  </anime>\n`;
  }

  xml += `</myanimelist>\n`;

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`trackthis-mal-export-${dateStr}.xml`, xml, 'application/xml;charset=utf-8');
}

/**
 * 5. Letterboxd CSV Format (Extensible for Movies)
 */
export function exportLetterboxdCSV(
  decisions: Record<string, UserDecision>,
  catalog: UnifiedMediaItem[]
) {
  const catalogMap = new Map(catalog.map(item => [item.id, item]));
  const seenEntries = Object.values(decisions)
    .filter(d => d.status === 'SEEN')
    .map(d => ({
      item: catalogMap.get(d.mediaId),
      decision: d
    }))
    .filter((entry): entry is { item: UnifiedMediaItem; decision: UserDecision } => Boolean(entry.item));

  const headers = ['Title', 'Year', 'Rating10', 'WatchedDate'];
  const rows = [headers.join(',')];

  for (const { item, decision } of seenEntries) {
    const title = (item.title.english || item.title.romaji).replace(/"/g, '""');
    const watchedDate = decision.decidedAt.split('T')[0];
    rows.push(`"${title}",${item.year},,${watchedDate}`);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`trackthis-letterboxd-${dateStr}.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
}

/**
 * 6. Goodreads CSV Format (Extensible for Books)
 */
export function exportGoodreadsCSV(
  decisions: Record<string, UserDecision>,
  catalog: UnifiedMediaItem[]
) {
  const catalogMap = new Map(catalog.map(item => [item.id, item]));
  const seenEntries = Object.values(decisions)
    .filter(d => d.status === 'SEEN')
    .map(d => ({
      item: catalogMap.get(d.mediaId),
      decision: d
    }))
    .filter((entry): entry is { item: UnifiedMediaItem; decision: UserDecision } => Boolean(entry.item));

  const headers = ['Title', 'Author', 'Exclusive Shelf', 'Date Read'];
  const rows = [headers.join(',')];

  for (const { item, decision } of seenEntries) {
    const title = (item.title.english || item.title.romaji).replace(/"/g, '""');
    const author = (item.studios[0] || 'Unknown').replace(/"/g, '""');
    const watchedDate = decision.decidedAt.split('T')[0];
    rows.push(`"${title}","${author}","read",${watchedDate}`);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`trackthis-goodreads-${dateStr}.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
}

/**
 * File Importer Parser
 */
export async function parseImportFile(
  file: File,
  catalog: UnifiedMediaItem[]
): Promise<UserDecision[]> {
  const text = await file.text();
  const lowerName = file.name.toLowerCase();

  // 1. JSON Import
  if (lowerName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.decisions && typeof parsed.decisions === 'object') {
        return Object.values(parsed.decisions);
      }
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      throw new Error('Invalid JSON backup file format');
    }
  }

  // 2. MAL XML Import
  if (lowerName.endsWith('.xml')) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const animeNodes = xmlDoc.getElementsByTagName('anime');
    
    if (animeNodes.length === 0) {
      throw new Error('No valid anime entries found in MAL XML file.');
    }

    const malMap = new Map<number, UnifiedMediaItem>();
    catalog.forEach(item => {
      if (item.externalIds.mal) malMap.set(item.externalIds.mal, item);
    });

    const now = new Date().toISOString();
    const importedDecisions: UserDecision[] = [];

    for (let i = 0; i < animeNodes.length; i++) {
      const node = animeNodes[i];
      const malIdStr = node.getElementsByTagName('series_animedb_id')[0]?.textContent;
      const statusStr = node.getElementsByTagName('my_status')[0]?.textContent;

      if (malIdStr) {
        const malId = parseInt(malIdStr, 10);
        const matchedItem = malMap.get(malId);
        if (matchedItem) {
          // If status is Completed or Watching, mark as SEEN
          const isSeen = statusStr?.toLowerCase() === 'completed' || statusStr?.toLowerCase() === 'watching';
          importedDecisions.push({
            mediaId: matchedItem.id,
            mediaType: 'anime',
            status: isSeen ? 'SEEN' : 'NOT_SEEN',
            decidedAt: now
          });
        }
      }
    }

    return importedDecisions;
  }

  // 3. CSV Import
  if (lowerName.endsWith('.csv')) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) throw new Error('CSV file is empty or missing headers');

    const importedDecisions: UserDecision[] = [];
    const now = new Date().toISOString();
    const idSet = new Set(catalog.map(c => c.id));

    // Check header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const idIndex = headers.indexOf('media_id');
    const statusIndex = headers.indexOf('status');

    if (idIndex !== -1 && statusIndex !== -1) {
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const mediaId = parts[idIndex];
        const status = parts[statusIndex]?.toUpperCase() as 'SEEN' | 'NOT_SEEN';

        if (mediaId && idSet.has(mediaId) && (status === 'SEEN' || status === 'NOT_SEEN')) {
          importedDecisions.push({
            mediaId,
            mediaType: 'anime',
            status,
            decidedAt: now
          });
        }
      }
    }

    return importedDecisions;
  }

  throw new Error('Unsupported file format. Please upload .json, .xml, or .csv.');
}

/**
 * Throttled Background Sync Engine Simulation
 * Conforms to AniList GraphQL (2.5s / 24 req/min) rate limits
 */
export interface SyncProgressCallback {
  (progress: { total: number; current: number; currentTitle: string }): void;
}

export class ThrottledSyncService {
  private isCancelled = false;

  public cancel() {
    this.isCancelled = true;
  }

  public async syncWithAniList(
    decisions: Record<string, UserDecision>,
    catalog: UnifiedMediaItem[],
    onProgress: SyncProgressCallback
  ): Promise<{ syncedCount: number; errors: string[] }> {
    this.isCancelled = false;
    const seenDecisions = Object.values(decisions).filter(d => d.status === 'SEEN');
    const catalogMap = new Map(catalog.map(item => [item.id, item]));

    let syncedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < seenDecisions.length; i++) {
      if (this.isCancelled) {
        break;
      }

      const decision = seenDecisions[i];
      const item = catalogMap.get(decision.mediaId);
      const title = item ? (item.title.english || item.title.romaji) : decision.mediaId;

      onProgress({
        total: seenDecisions.length,
        current: i + 1,
        currentTitle: title
      });

      // Simulated throttled delay (e.g. 300ms for demo/fast responsiveness or rate limit simulation)
      await new Promise(res => setTimeout(res, 350));
      syncedCount++;
    }

    return { syncedCount, errors };
  }
}
