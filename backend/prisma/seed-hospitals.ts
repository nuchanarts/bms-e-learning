/**
 * Import hospitals from health_office.csv
 * Usage: npx ts-node prisma/seed-hospitals.ts <path-to-csv>
 */
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import readline from 'readline';
import prisma from '../src/lib/prisma';

function cleanValue(raw: string): string {
  // Strip all quotes and equals, then trim
  return raw.replace(/["=]/g, '').trim();
}

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '../health_office.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const rl = readline.createInterface({ input: createReadStream(csvPath), crlfDelay: Infinity });
  const rows: { hospcode: string; name: string; province: string; district: string }[] = [];
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // skip header

    // Parse CSV columns: ชื่อ(0), ..., รหัส 5 หลัก(3), ..., จังหวัด(16), อำเภอ(18)
    const cols = line.split(',');
    if (cols.length < 19) continue;

    const name = cleanValue(cols[0]);
    const hospcode = cleanValue(cols[3]);
    const province = cleanValue(cols[16]);
    const district = cleanValue(cols[18]);

    if (!hospcode || !name || hospcode === '-' || hospcode === '') continue;

    rows.push({ hospcode, name, province, district });
  }

  console.log(`Parsed ${rows.length} hospitals. Inserting...`);

  // Deduplicate by hospcode (keep first occurrence)
  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    if (seen.has(r.hospcode)) return false;
    seen.add(r.hospcode);
    return true;
  });
  console.log(`Unique hospcodes: ${unique.length}`);

  // Batch insert in chunks of 1000 with skipDuplicates
  const CHUNK = 1000;
  let done = 0;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const chunk = unique.slice(i, i + CHUNK);
    await prisma.hospital.createMany({ data: chunk, skipDuplicates: true });
    done += chunk.length;
    process.stdout.write(`\r${done}/${unique.length}`);
  }

  console.log(`\nDone. Imported ${done} hospitals.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
