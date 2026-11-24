/**
 * Kingdom records: validation and derived values.
 *
 * This module is pure (no Node, Astro or browser APIs) so the same rules run
 * in three places: the data validator script, the unit tests and the page
 * build. If data/kingdom.json breaks a rule, the build fails and the live
 * site keeps showing its last good version.
 */

export const PLATFORM_IDS = ['youtube', 'tiktok', 'instagram'] as const;
export type PlatformId = (typeof PLATFORM_IDS)[number];

export const VERIFICATION_METHODS = ['automatic', 'manual'] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export interface PlatformRecord {
  /** Verified follower/subscriber count, or null while awaiting verification. */
  count: number | null;
  /**
   * When the count was checked: a UTC timestamp ("2026-11-24T08:15:00Z") from
   * the census form, or just a date ("2026-11-24") when the time is unknown.
   */
  verifiedAt: string | null;
  /** Where the count was read from, e.g. "YouTube Data API" or "TikTok profile". */
  source: string | null;
  /** "automatic" (read by the census workflow from an official API) or "manual" (checked by the team). */
  method: VerificationMethod | null;
}

/** A newly unlocked milestone needs all three counts verified within this many hours of each other. */
export const CENSUS_WINDOW_HOURS = 48;

export interface MilestoneRecord {
  population: number;
  title: string;
  description: string;
  /** Date the milestone was first verified as reached. Once set, it stays unlocked forever. */
  unlockedOn: string | null;
}

export interface StoryDayRecord {
  day: number;
  title: string;
  publishedOn: string;
  links?: Partial<Record<PlatformId, string>>;
}

export interface KingdomData {
  population: Record<PlatformId, PlatformRecord>;
  milestones: MilestoneRecord[];
  story: {
    hollowingTotalDays: number;
    prophecy: { title: string; summary: string };
    historicalEpisodes: { title: string; summary: string }[];
    storyDays: StoryDayRecord[];
  };
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRealDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** A date ("2026-11-24") or a UTC timestamp ("2026-11-24T08:15:00Z"). */
function isVerificationTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (DATE_RE.test(value)) return isRealDate(value);
  if (!TIMESTAMP_RE.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().replace('.000Z', 'Z') === value;
}

/**
 * The earliest and latest moment a verification could have happened. A bare
 * date covers the whole day, so comparisons stay on the safe side.
 */
export function verificationRange(value: string): { start: number; end: number } {
  if (DATE_RE.test(value)) {
    const start = new Date(`${value}T00:00:00Z`).getTime();
    return { start, end: start + ONE_DAY_MS - 1 };
  }
  const t = new Date(value).getTime();
  return { start: t, end: t };
}

export interface CensusSpread {
  /** True when every platform has a verified count and all were checked within CENSUS_WINDOW_HOURS. */
  fresh: boolean;
  /** Earliest possible verification moment across platforms (ms), or null if none verified. */
  oldest: number | null;
  /** Latest possible verification moment across platforms (ms), or null if none verified. */
  newest: number | null;
}

export function censusSpread(population: Record<PlatformId, PlatformRecord>): CensusSpread {
  const ranges = PLATFORM_IDS.map((id) => population[id])
    .filter((p) => p && p.count !== null && isVerificationTime(p.verifiedAt))
    .map((p) => verificationRange(p.verifiedAt as string));
  if (ranges.length === 0) return { fresh: false, oldest: null, newest: null };
  const oldest = Math.min(...ranges.map((r) => r.start));
  const newest = Math.max(...ranges.map((r) => r.end));
  const fresh = ranges.length === PLATFORM_IDS.length && newest - oldest <= CENSUS_WINDOW_HOURS * HOUR_MS;
  return { fresh, oldest, newest };
}

/** True when the date is after "today" (one day of slack covers UK vs UTC midnight). */
function isFutureDate(value: string, today: Date): boolean {
  return new Date(`${value}T00:00:00Z`).getTime() > today.getTime() + ONE_DAY_MS;
}

function isNonEmptyText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Sum of the verified platform counts (platforms awaiting verification are left out). */
export function combinedTotal(population: Record<PlatformId, PlatformRecord>): number {
  return PLATFORM_IDS.reduce((sum, id) => sum + (population[id]?.count ?? 0), 0);
}

/**
 * Checks kingdom.json against every rule. Errors stop the build; warnings are
 * printed but do not.
 */
export function validateKingdom(raw: unknown, today: Date = new Date()): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(raw)) {
    return { errors: ['The file must contain a single JSON object { ... }.'], warnings };
  }

  // --- Population -----------------------------------------------------------
  const population = raw.population;
  if (!isObject(population)) {
    errors.push('"population" is missing or is not an object.');
  } else {
    for (const id of PLATFORM_IDS) {
      const p = population[id];
      const where = `population.${id}`;
      if (!isObject(p)) {
        errors.push(`"${where}" is missing.`);
        continue;
      }
      if ('verifiedOn' in p) {
        errors.push(`${where}.verifiedOn has been renamed to "verifiedAt" (same date format).`);
      }
      const { count, verifiedAt, source, method } = p;
      if (count === null) {
        if (verifiedAt !== null || source !== null || method !== null) {
          warnings.push(`${where}: count is null, so verifiedAt, source and method are ignored.`);
        }
        continue;
      }
      if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
        errors.push(`${where}.count must be a whole number (0 or more) or null. Found: ${JSON.stringify(count)}. Do not put quotes around numbers.`);
      }
      if (!isVerificationTime(verifiedAt)) {
        errors.push(
          `${where}.verifiedAt must be when you checked the count: a date like "2026-11-24", ` +
            `or a UTC time like "2026-11-24T08:15:00Z".`,
        );
      } else if (verificationRange(verifiedAt).start > today.getTime() + ONE_DAY_MS) {
        errors.push(`${where}.verifiedAt (${verifiedAt}) is in the future.`);
      }
      if (!isNonEmptyText(source, 120)) {
        errors.push(`${where}.source must say where the count came from (for example "YouTube Studio"), up to 120 characters.`);
      }
      if (!(VERIFICATION_METHODS as readonly unknown[]).includes(method)) {
        errors.push(`${where}.method must be "automatic" or "manual".`);
      }
    }
    for (const key of Object.keys(population)) {
      if (!(PLATFORM_IDS as readonly string[]).includes(key)) {
        errors.push(`population.${key} is not a recognised platform (expected: ${PLATFORM_IDS.join(', ')}).`);
      }
    }
  }

  // --- Milestones -----------------------------------------------------------
  const milestones = raw.milestones;
  if (!Array.isArray(milestones) || milestones.length === 0) {
    errors.push('"milestones" must be a list with at least one milestone.');
  } else {
    const typedPopulation = isObject(population)
      ? (population as unknown as Record<PlatformId, PlatformRecord>)
      : null;
    const total = typedPopulation ? combinedTotal(typedPopulation) : 0;
    const spread = typedPopulation ? censusSpread(typedPopulation) : { fresh: false, oldest: null, newest: null };
    // Unlocks recorded from (newest census − window) onwards count as "new" and
    // must be backed by a fresh census: all three counts within the window.
    const recentFrom =
      spread.newest === null
        ? null
        : new Date(spread.newest - CENSUS_WINDOW_HOURS * HOUR_MS).toISOString().slice(0, 10);
    let previousPopulation = 0;
    let previousUnlocked = true;
    let previousUnlockedOn: string | null = null;

    milestones.forEach((m: unknown, index) => {
      const where = `milestones[${index}]`;
      if (!isObject(m)) {
        errors.push(`${where} is not an object.`);
        return;
      }
      const label = typeof m.title === 'string' ? `"${m.title}"` : where;
      if (typeof m.population !== 'number' || !Number.isInteger(m.population) || m.population < 1) {
        errors.push(`${label}: population must be a whole number of 1 or more.`);
        return;
      }
      if (m.population <= previousPopulation) {
        errors.push(`${label}: milestones must be listed in increasing order of population, with no duplicates.`);
      }
      previousPopulation = m.population;
      if (!isNonEmptyText(m.title, 80)) errors.push(`${where}: title is required (up to 80 characters).`);
      if (!isNonEmptyText(m.description, 240)) errors.push(`${label}: description is required (up to 240 characters).`);

      const unlockedOn = m.unlockedOn;
      if (unlockedOn === null) {
        if (total >= m.population) {
          if (spread.fresh) {
            errors.push(
              `${label} has been reached (combined total ${total} ≥ ${m.population}) but is not recorded. ` +
                `Unlocks are permanent, so add the date to this milestone: "unlockedOn": "YYYY-MM-DD".`,
            );
          } else {
            warnings.push(
              `${label} appears reached (combined total ${total}), but the three counts were not all verified ` +
                `within ${CENSUS_WINDOW_HOURS} hours of each other. Run a full census before recording the unlock.`,
            );
          }
        }
        previousUnlocked = false;
        return;
      }
      if (!isRealDate(unlockedOn)) {
        errors.push(`${label}: unlockedOn must be null or a date written like "2026-11-23".`);
        return;
      }
      if (isFutureDate(unlockedOn, today)) errors.push(`${label}: unlockedOn (${unlockedOn}) is in the future.`);
      if (!previousUnlocked) {
        errors.push(`${label} is unlocked, but a smaller milestone before it is still locked.`);
      }
      if (previousUnlockedOn && unlockedOn < previousUnlockedOn) {
        errors.push(`${label}: unlockedOn (${unlockedOn}) is earlier than the milestone before it (${previousUnlockedOn}).`);
      }
      if (recentFrom !== null && unlockedOn >= recentFrom && !spread.fresh) {
        errors.push(
          `${label} was unlocked on ${unlockedOn}, but the counts behind it were not all verified within ` +
            `${CENSUS_WINDOW_HOURS} hours of each other. Record a full census (all three platforms) first.`,
        );
      }
      if (total < m.population) {
        warnings.push(
          `${label} stays unlocked (recorded ${unlockedOn}) although the combined total is now ${total}. ` +
            `This is expected if follower counts dropped after it was reached.`,
        );
      }
      previousUnlockedOn = unlockedOn;
    });
  }

  // --- Story ----------------------------------------------------------------
  const story = raw.story;
  if (!isObject(story)) {
    errors.push('"story" is missing or is not an object.');
  } else {
    const totalDays = story.hollowingTotalDays;
    if (typeof totalDays !== 'number' || !Number.isInteger(totalDays) || totalDays < 1) {
      errors.push('story.hollowingTotalDays must be a whole number of 1 or more.');
    }
    if (!isObject(story.prophecy) || !isNonEmptyText(story.prophecy.title, 120)) {
      errors.push('story.prophecy must have a title.');
    }
    if (!Array.isArray(story.historicalEpisodes)) {
      errors.push('story.historicalEpisodes must be a list (it can be empty: []).');
    }
    const days = story.storyDays;
    if (!Array.isArray(days)) {
      errors.push('story.storyDays must be a list (it starts empty: []).');
    } else {
      let previousDate: string | null = null;
      days.forEach((d: unknown, index) => {
        const where = `story.storyDays[${index}]`;
        if (!isObject(d)) {
          errors.push(`${where} is not an object.`);
          return;
        }
        const expectedDay = index + 1;
        if (d.day !== expectedDay) {
          errors.push(
            `${where}: day must be ${expectedDay}. Story days are recorded in order, starting at Day 1 ` +
              `(the Prophecy is Day 0 and is not listed here). Found: ${JSON.stringify(d.day)}.`,
          );
        }
        if (typeof totalDays === 'number' && typeof d.day === 'number' && d.day > totalDays) {
          errors.push(`${where}: day ${d.day} is beyond the ${totalDays}-day Hollowing countdown.`);
        }
        if (!isNonEmptyText(d.title, 120)) errors.push(`${where}: title is required (up to 120 characters).`);
        if (!isRealDate(d.publishedOn)) {
          errors.push(`${where}: publishedOn must be the date the episode was published, written like "2026-11-23".`);
        } else {
          if (isFutureDate(d.publishedOn, today)) {
            errors.push(`${where}: publishedOn (${d.publishedOn}) is in the future. Only record episodes that are already published.`);
          }
          if (previousDate && d.publishedOn < previousDate) {
            errors.push(`${where}: publishedOn (${d.publishedOn}) is earlier than the story day before it (${previousDate}).`);
          }
          previousDate = d.publishedOn;
        }
        if (d.links !== undefined) {
          if (!isObject(d.links)) {
            errors.push(`${where}: links must be an object like { "youtube": "https://..." }.`);
          } else {
            for (const [key, url] of Object.entries(d.links)) {
              if (!(PLATFORM_IDS as readonly string[]).includes(key)) {
                errors.push(`${where}: links.${key} is not a recognised platform.`);
              } else if (!isHttpsUrl(url)) {
                errors.push(`${where}: links.${key} must be a full https:// address.`);
              }
            }
          }
        }
      });
    }
  }

  return { errors, warnings };
}

// --- Derived view ------------------------------------------------------------

export type MilestoneState = 'unlocked' | 'next' | 'locked';

export interface MilestoneView extends MilestoneRecord {
  state: MilestoneState;
}

export interface KingdomView {
  combined: number;
  verifiedPlatforms: PlatformId[];
  awaitingPlatforms: PlatformId[];
  /** Most recent verifiedAt across platforms, or null if nothing is verified yet. */
  lastVerifiedAt: string | null;
  /** True when all three counts were verified within CENSUS_WINDOW_HOURS of each other. */
  censusFresh: boolean;
  milestones: MilestoneView[];
  nextMilestone: MilestoneView | null;
  latestUnlocked: MilestoneView | null;
  /** 0–100, progress of the combined total towards the next milestone. */
  progressPercent: number;
  storyDaysPublished: number;
  storyDaysRemaining: number;
}

export function deriveKingdom(data: KingdomData): KingdomView {
  const verifiedPlatforms = PLATFORM_IDS.filter((id) => data.population[id].count !== null);
  const awaitingPlatforms = PLATFORM_IDS.filter((id) => data.population[id].count === null);
  const combined = combinedTotal(data.population);

  const times = verifiedPlatforms
    .map((id) => data.population[id].verifiedAt)
    .filter((d): d is string => typeof d === 'string')
    .sort((a, b) => verificationRange(a).end - verificationRange(b).end);
  const lastVerifiedAt = times.at(-1) ?? null;
  const censusFresh = censusSpread(data.population).fresh;

  let foundNext = false;
  const milestones: MilestoneView[] = data.milestones.map((m) => {
    if (m.unlockedOn) return { ...m, state: 'unlocked' };
    if (!foundNext) {
      foundNext = true;
      return { ...m, state: 'next' };
    }
    return { ...m, state: 'locked' };
  });

  const nextMilestone = milestones.find((m) => m.state === 'next') ?? null;
  const latestUnlocked = milestones.filter((m) => m.state === 'unlocked').at(-1) ?? null;
  const progressPercent = nextMilestone
    ? Math.min(100, Math.max(0, Math.floor((combined / nextMilestone.population) * 100)))
    : 100;

  const storyDaysPublished = data.story.storyDays.length;
  const storyDaysRemaining = Math.max(0, data.story.hollowingTotalDays - storyDaysPublished);

  return {
    combined,
    verifiedPlatforms,
    awaitingPlatforms,
    lastVerifiedAt,
    censusFresh,
    milestones,
    nextMilestone,
    latestUnlocked,
    progressPercent,
    storyDaysPublished,
    storyDaysRemaining,
  };
}

/** Formats "2026-11-23" as "23 November 2026" (UK style). */
export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** UK calendar date (Europe/London) of a moment, as "YYYY-MM-DD". */
export function londonDate(moment: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(moment);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Formats a verification time for visitors, in UK time:
 * "2026-11-24" → "24 November 2026"; "2026-11-24T08:15:00Z" → "24 November 2026, 08:15 GMT".
 */
export function formatVerification(value: string): string {
  if (DATE_RE.test(value)) return formatDate(value);
  const moment = new Date(value);
  const date = formatDate(londonDate(moment));
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  }).format(moment);
  return `${date}, ${time}`;
}
