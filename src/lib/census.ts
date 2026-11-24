/**
 * Census logic used by the "Record census" GitHub Actions workflow.
 *
 * Pure functions only (no network, files or environment), so every rule is
 * unit-tested. scripts/census.ts does the I/O around them.
 *
 * A census:
 *  - records all three platform counts with the same UTC timestamp,
 *  - permanently unlocks any milestone the new combined total has reached
 *    (dated with the UK calendar date of the census),
 *  - never removes an unlock and never touches the story records,
 *  - must pass validateKingdom() before anything is proposed.
 */
import {
  PLATFORM_IDS,
  deriveKingdom,
  formatDate,
  formatVerification,
  londonDate,
  validateKingdom,
  type KingdomData,
  type MilestoneRecord,
  type PlatformId,
  type VerificationMethod,
} from './kingdom.ts';

export interface CensusEntry {
  count: number;
  source: string;
  method: VerificationMethod;
}

export type CensusInput = Record<PlatformId, CensusEntry>;

export interface CensusResult {
  data: KingdomData;
  unlocked: MilestoneRecord[];
  title: string;
  summary: string;
}

const PLATFORM_NAMES: Record<PlatformId, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};

/** Accepts "12", " 1,234 " or "1 234"; rejects anything that isn't a whole number. */
export function parseCount(raw: string | undefined, label: string): number {
  const cleaned = (raw ?? '').trim().replace(/[,\s_]/g, '');
  if (!/^\d{1,9}$/.test(cleaned)) {
    throw new Error(`${label}: "${(raw ?? '').trim()}" is not a whole number. Enter digits only, e.g. 12.`);
  }
  return Number(cleaned);
}

/**
 * Reads the subscriber count from a YouTube Data API `channels.list`
 * (part=statistics) response, checking it is for the expected channel.
 */
export function parseYouTubeSubscribers(response: unknown, channelId: string): number {
  const items = (response as { items?: unknown })?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('YouTube returned no channel. Check the channel ID and the API key restrictions.');
  }
  const item = items[0] as { id?: unknown; statistics?: Record<string, unknown> };
  if (item.id !== channelId) {
    throw new Error(`YouTube returned a different channel (${String(item.id)}).`);
  }
  const stats = item.statistics ?? {};
  if (stats.hiddenSubscriberCount === true) {
    throw new Error('The channel hides its subscriber count, so it cannot be read automatically.');
  }
  const value = stats.subscriberCount;
  if (typeof value !== 'string' || !/^\d{1,12}$/.test(value)) {
    throw new Error('YouTube did not return a subscriber count.');
  }
  return Number(value);
}

/** A UTC timestamp with whole seconds, e.g. "2026-11-24T08:15:00Z". */
export function censusTimestamp(at: Date): string {
  return new Date(Math.floor(at.getTime() / 1000) * 1000).toISOString().replace('.000Z', 'Z');
}

/** The file format used for data/kingdom.json (stable, so census diffs stay small). */
export function serializeKingdom(data: KingdomData): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function applyCensus(current: KingdomData, input: CensusInput, at: Date): CensusResult {
  const data: KingdomData = structuredClone(current);
  const verifiedAt = censusTimestamp(at);

  for (const id of PLATFORM_IDS) {
    const entry = input[id];
    data.population[id] = {
      count: entry.count,
      verifiedAt,
      source: entry.source.trim(),
      method: entry.method,
    };
  }

  // Every counted platform is verified at the same moment, so this census is
  // "fresh" and may record new unlocks. Existing unlocks are never changed.
  const total = PLATFORM_IDS.reduce((sum, id) => sum + input[id].count, 0);
  const unlockDate = londonDate(at);
  const unlocked: MilestoneRecord[] = [];
  for (const milestone of data.milestones) {
    if (milestone.unlockedOn === null && total >= milestone.population) {
      milestone.unlockedOn = unlockDate;
      unlocked.push(milestone);
    }
  }

  if (JSON.stringify(data.story) !== JSON.stringify(current.story)) {
    throw new Error('A census must never change the story records.');
  }

  const { errors } = validateKingdom(data, at);
  if (errors.length > 0) {
    throw new Error(`The proposed census is invalid:\n- ${errors.join('\n- ')}`);
  }

  return { data, unlocked, ...describeCensus(current, data, unlocked, verifiedAt) };
}

function describeCensus(
  before: KingdomData,
  after: KingdomData,
  unlocked: MilestoneRecord[],
  verifiedAt: string,
): { title: string; summary: string } {
  const was = deriveKingdom(before);
  const now = deriveKingdom(after);
  const shortDate = formatDate(londonDate(new Date(verifiedAt)));

  const title =
    `Census ${shortDate}: ${now.combined} combined platform follows` +
    (unlocked.length ? `, unlocks ${unlocked.map((m) => m.title).join(' and ')}` : '');

  const show = (value: number | null) => (value === null ? 'awaiting' : String(value));
  const rows = PLATFORM_IDS.map((id) => {
    const old = before.population[id].count;
    const p = after.population[id];
    const changed = old !== p.count ? ' ✏️' : '';
    return `| ${PLATFORM_NAMES[id]} | ${show(old)} | **${p.count}**${changed} | ${p.source} | ${p.method} |`;
  });

  const milestoneLines = unlocked.length
    ? unlocked.map((m) => `- 🔓 **Newly unlocked: ${m.title}** (${m.population} Zaunites): "Unlock recorded ${formatDate(m.unlockedOn as string)}"`)
    : ['- No new milestones.'];
  const next = now.nextMilestone
    ? `- Next: **${now.nextMilestone.title}** at ${now.combined} / ${now.nextMilestone.population}`
    : '- Every milestone is unlocked.';

  const summary = [
    `## Proposed census: ${formatVerification(verifiedAt)}`,
    '',
    '| Platform | Live site now | Proposed | Source | Checked |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    `| **Combined platform follows** | ${was.combined} | **${now.combined}** | | |`,
    '',
    '**Milestones**',
    ...milestoneLines,
    next,
    '',
    `**The Hollowing:** unchanged (${now.storyDaysRemaining} story days remain). A census never changes story days.`,
    '',
    '### Before you merge',
    '- [ ] Each proposed number matches what you saw on the platform.',
    '- [ ] The green check **"Validate data, test, type-check and build"** is shown below.',
    '',
    'Merging publishes this census to https://zaunited-portal.pages.dev in about 1–2 minutes. ' +
      'If anything looks wrong, close this pull request instead; nothing changes on the site.',
  ].join('\n');

  return { title, summary };
}
