/**
 * The Three Factions of Zaun, the Royal Hierarchy and open community
 * proposals (data/realm.json). Pure validation, shared by the build and tests.
 *
 * Rules:
 *  - one faction per platform, and no follower counts here (they come from the census)
 *  - a faction's achievement must belong to a story day that is officially recorded
 *  - the hierarchy is the approved six ranks, in order, with nobody promoted
 *  - proposals are open ideas only: no votes, winners or rankings
 */
import { PLATFORM_IDS, type KingdomData, type PlatformId } from './kingdom.ts';

export const APPROVED_RANKS = ['Wanderer', 'Settler', 'Artisan', 'Guildmaster', 'Noble', 'Royal Council'] as const;
export const CRESTS = ['ember', 'stonewright', 'moonveil'] as const;
export type Crest = (typeof CRESTS)[number];

export interface Faction {
  platform: PlatformId;
  name: string;
  crest: Crest;
  heraldry: string;
  identity: string;
  petition: { author: string; text: string } | null;
  achievement: { day: number; points: string[] } | null;
  invitation: string | null;
}

export interface Proposal {
  title: string;
  status: 'open';
}

export interface Realm {
  factions: Faction[];
  ranks: string[];
  proposals: Proposal[];
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

const ALLOWED_FACTION_KEYS = ['platform', 'name', 'crest', 'heraldry', 'identity', 'petition', 'achievement', 'invitation'];
const ALLOWED_PROPOSAL_KEYS = ['title', 'status'];

export function validateRealm(raw: unknown, kingdom: KingdomData): string[] {
  const errors: string[] = [];
  if (!isObject(raw)) return ['data/realm.json must contain a single JSON object.'];

  const recordedDays = new Set(kingdom.story.storyDays.map((d) => d.day));

  // --- Factions
  const factions = raw.factions;
  if (!Array.isArray(factions)) {
    errors.push('"factions" must be a list.');
  } else {
    const platforms = factions.map((f) => (isObject(f) ? f.platform : undefined));
    if (platforms.length !== PLATFORM_IDS.length || !PLATFORM_IDS.every((id) => platforms.includes(id))) {
      errors.push(`There must be exactly one faction for each platform: ${PLATFORM_IDS.join(', ')}.`);
    }
    factions.forEach((f: unknown, i) => {
      const where = `factions[${i}]`;
      if (!isObject(f)) return void errors.push(`${where} is not an object.`);
      for (const key of Object.keys(f)) {
        if (!ALLOWED_FACTION_KEYS.includes(key)) {
          errors.push(`${where}.${key} is not allowed (follower counts come from the census, not this file).`);
        }
      }
      if (!isText(f.name, 60)) errors.push(`${where}: name is required.`);
      if (!(CRESTS as readonly unknown[]).includes(f.crest)) errors.push(`${where}: crest must be one of ${CRESTS.join(', ')}.`);
      if (!isText(f.heraldry, 120)) errors.push(`${where}: heraldry is required.`);
      if (!isText(f.identity, 160)) errors.push(`${where}: identity is required.`);
      if (f.petition !== null) {
        if (!isObject(f.petition) || !isText(f.petition.author, 40) || !isText(f.petition.text, 200)) {
          errors.push(`${where}: petition must be null or { "author", "text" } from a genuine community comment.`);
        }
      }
      if (f.achievement !== null) {
        const a = f.achievement;
        if (!isObject(a) || typeof a.day !== 'number' || !Array.isArray(a.points) || a.points.length === 0) {
          errors.push(`${where}: achievement must be null or { "day", "points": [...] }.`);
        } else {
          if (!recordedDays.has(a.day)) {
            errors.push(`${where}: achievement is for Story Day ${a.day}, which is not recorded as published in data/kingdom.json.`);
          }
          if (!a.points.every((p) => isText(p, 240))) errors.push(`${where}: every achievement point must be text (up to 240 characters).`);
        }
      }
      if (f.invitation !== null && !isText(f.invitation, 240)) errors.push(`${where}: invitation must be null or text.`);
      if (f.petition === null && f.invitation === null) {
        errors.push(`${where}: a faction without a petition needs an invitation for its community.`);
      }
    });
  }

  // --- Royal Hierarchy
  if (JSON.stringify(raw.ranks) !== JSON.stringify(APPROVED_RANKS)) {
    errors.push(`"ranks" must be exactly the approved hierarchy: ${APPROVED_RANKS.join(' → ')}.`);
  }

  // --- Open proposals
  const proposals = raw.proposals;
  if (!Array.isArray(proposals)) {
    errors.push('"proposals" must be a list.');
  } else {
    proposals.forEach((p: unknown, i) => {
      const where = `proposals[${i}]`;
      if (!isObject(p)) return void errors.push(`${where} is not an object.`);
      for (const key of Object.keys(p)) {
        if (!ALLOWED_PROPOSAL_KEYS.includes(key)) {
          errors.push(`${where}.${key} is not allowed (no votes, winners or rankings are recorded here).`);
        }
      }
      if (!isText(p.title, 60)) errors.push(`${where}: title is required.`);
      if (p.status !== 'open') errors.push(`${where}: status must be "open".`);
    });
  }

  return errors;
}
