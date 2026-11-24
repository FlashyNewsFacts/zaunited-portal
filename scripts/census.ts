/**
 * Prepares a census for the "Record census" GitHub Actions workflow.
 * It never commits, pushes or publishes anything itself.
 *
 * Inputs (environment variables, set by the workflow from the iPad form):
 *   TIKTOK_FOLLOWERS, TIKTOK_SOURCE         manual TikTok count and where it was read
 *   INSTAGRAM_FOLLOWERS, INSTAGRAM_SOURCE   manual Instagram count and where it was read
 *   YOUTUBE_SUBSCRIBERS                     optional manual fallback; leave blank for automatic
 *   YOUTUBE_API_KEY                         secret; used only when YOUTUBE_SUBSCRIBERS is blank
 *   CENSUS_SUMMARY_FILE                     where to write the pull-request description
 *   GITHUB_OUTPUT, GITHUB_STEP_SUMMARY      provided by GitHub Actions
 *
 * Writes data/kingdom.json only if the census passes every data rule.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applyCensus, parseCount, parseYouTubeSubscribers, serializeKingdom, type CensusInput } from '../src/lib/census.ts';
import type { KingdomData } from '../src/lib/kingdom.ts';
import { YOUTUBE_CHANNEL_ID } from '../src/lib/site.ts';

const TIKTOK_SOURCES = ['TikTok profile', 'TikTok app', 'Metricool'];
const INSTAGRAM_SOURCES = ['Instagram profile', 'Instagram app', 'Metricool'];
const DATA_FILE = fileURLToPath(new URL('../data/kingdom.json', import.meta.url));

function fail(message: string): never {
  console.error(`::error::${message.replace(/\n/g, '%0A')}`);
  console.error(`✖ ${message}`);
  process.exit(1);
}

function pickSource(value: string | undefined, allowed: string[], label: string): string {
  const source = (value ?? '').trim();
  if (!allowed.includes(source)) fail(`${label} source must be one of: ${allowed.join(', ')}.`);
  return source;
}

async function fetchYouTubeSubscribers(apiKey: string): Promise<number> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}`;
  let response: Response;
  try {
    // The key goes in a header, never in the URL, so it cannot appear in logs.
    response = await fetch(url, { headers: { 'x-goog-api-key': apiKey }, signal: AbortSignal.timeout(20_000) });
  } catch (error) {
    throw new Error(`Could not reach the YouTube Data API (${(error as Error).name}).`);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = (body as { error?: { message?: string } } | null)?.error?.message ?? 'no details';
    throw new Error(`YouTube Data API answered ${response.status}: ${reason}`);
  }
  return parseYouTubeSubscribers(body, YOUTUBE_CHANNEL_ID);
}

async function main(): Promise<void> {
  const env = process.env;
  let census: CensusInput;
  try {
    const tiktok = parseCount(env.TIKTOK_FOLLOWERS, 'TikTok followers');
    const instagram = parseCount(env.INSTAGRAM_FOLLOWERS, 'Instagram followers');
    const tiktokSource = pickSource(env.TIKTOK_SOURCE, TIKTOK_SOURCES, 'TikTok');
    const instagramSource = pickSource(env.INSTAGRAM_SOURCE, INSTAGRAM_SOURCES, 'Instagram');

    let youtube: CensusInput['youtube'];
    if ((env.YOUTUBE_SUBSCRIBERS ?? '').trim() !== '') {
      youtube = {
        count: parseCount(env.YOUTUBE_SUBSCRIBERS, 'YouTube subscribers'),
        source: 'YouTube Studio',
        method: 'manual',
      };
      console.log('YouTube: using the manual fallback count from the form.');
    } else {
      const apiKey = (env.YOUTUBE_API_KEY ?? '').trim();
      if (!apiKey) {
        fail(
          'The YOUTUBE_API_KEY secret is not set, so YouTube cannot be read automatically. ' +
            'Add the secret (docs/CENSUS.md), or run the form again with the YouTube count filled in.',
        );
      }
      try {
        youtube = { count: await fetchYouTubeSubscribers(apiKey), source: 'YouTube Data API', method: 'automatic' };
      } catch (error) {
        fail(
          `Automatic YouTube count failed: ${(error as Error).message} ` +
            'Run the form again and fill in "YouTube subscribers" from YouTube Studio (manual fallback).',
        );
      }
      console.log(`YouTube: ${youtube.count} subscribers (automatic, YouTube Data API).`);
    }

    census = {
      youtube,
      tiktok: { count: tiktok, source: tiktokSource, method: 'manual' },
      instagram: { count: instagram, source: instagramSource, method: 'manual' },
    };
  } catch (error) {
    fail((error as Error).message);
  }

  const current: KingdomData = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  let result;
  try {
    result = applyCensus(current, census, new Date());
  } catch (error) {
    fail((error as Error).message);
  }

  writeFileSync(DATA_FILE, serializeKingdom(result.data));
  console.log(`\n${result.title}\n\n${result.summary}\n`);

  if (env.CENSUS_SUMMARY_FILE) writeFileSync(env.CENSUS_SUMMARY_FILE, `${result.summary}\n`);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${result.summary}\n`);
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `title=${result.title.replace(/[\r\n]/g, ' ')}\n`);
}

await main();
