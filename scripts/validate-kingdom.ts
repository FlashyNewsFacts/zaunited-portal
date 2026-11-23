/**
 * Checks data/kingdom.json before every build.
 * Run with: npm run validate:data
 *
 * If anything is wrong, this prints a plain-English explanation and exits
 * with an error, so a broken edit never reaches the live site.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateKingdom } from '../src/lib/kingdom.ts';

const file = fileURLToPath(new URL('../data/kingdom.json', import.meta.url));

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(file, 'utf8'));
} catch (error) {
  console.error('✖ data/kingdom.json is not valid JSON.');
  console.error(`  ${(error as Error).message}`);
  console.error('  Common causes: a missing or extra comma, curly “smart” quotes instead of straight "quotes", or a missing } or ].');
  process.exit(1);
}

const { errors, warnings } = validateKingdom(raw);

for (const warning of warnings) console.warn(`⚠ ${warning}`);

if (errors.length > 0) {
  console.error(`✖ data/kingdom.json has ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

console.log('✔ data/kingdom.json is valid.');
