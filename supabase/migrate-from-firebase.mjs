// One-off migration: Firebase Realtime Database JSON export -> Supabase Postgres.
//
// Setup — put your project URL and SECRET (service_role) key in .env.migration,
// which is gitignored. Keeping them in a file rather than on the command line
// keeps the key out of your shell history:
//
//   SUPABASE_URL=https://your-project-ref.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
//
// Then:
//   node --env-file=.env.migration supabase/migrate-from-firebase.mjs backup/export.json --dry-run
//   node --env-file=.env.migration supabase/migrate-from-firebase.mjs backup/export.json
//
// Safe to re-run: existing auth users are reused, and logs upsert on
// (user_id, logged_at) so nothing duplicates.
//
// Two things worth knowing:
//   * Users are created with email_confirm: true, which marks the address as
//     already verified and sends NO email. The import is silent.
//   * Passwords cannot come across — Firebase uses project-scoped scrypt,
//     Supabase uses bcrypt. Migrated users must set a password via
//     "FORGOT PASSWORD?" before they can log in. On Supabase's free tier the
//     built-in mailer is throttled to a few messages per hour, so a real
//     relaunch needs custom SMTP configured first.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const [, , exportPath, ...flags] = process.argv;
const dryRun = flags.includes('--dry-run');

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!exportPath || !url || !serviceRoleKey) {
  console.error(
    'Usage: node --env-file=.env.migration supabase/migrate-from-firebase.mjs <export.json> [--dry-run]\n' +
      '.env.migration must define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Realtime Database stores arrays as objects with numeric keys when sparse,
// so `tags` can arrive as ["Yoga"] or {"0":"Yoga"}. Normalize both.
const toArray = value => {
  if (Array.isArray(value)) return value.filter(v => v != null);
  if (value && typeof value === 'object') return Object.values(value).filter(v => v != null);
  return [];
};

const RATING_FIELDS = [
  'happy',
  'creative',
  'active',
  'relaxed',
  'sleepy',
  'anxiety',
  'migraines',
  'depression',
  'pain',
  'insomnia'
];

const data = JSON.parse(readFileSync(exportPath, 'utf8'));
const users = data.users || {};
const logsByUser = data.logs || {};
const totalLogs = Object.values(logsByUser).reduce((n, l) => n + Object.keys(l || {}).length, 0);

console.log(
  `Loaded ${Object.keys(users).length} user(s) and ${totalLogs} log(s).` +
    (dryRun ? ' DRY RUN — nothing will be written.' : '') +
    '\n'
);

// Page through existing auth users once up front. Doing this lazily per
// collision would be O(n^2) on a re-run.
const existingByEmail = new Map();
if (!dryRun) {
  process.stdout.write('Reading existing auth users... ');
  for (let page = 1; ; page += 1) {
    const { data: list, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error('\nCould not list existing users:', error.message);
      process.exit(1);
    }
    list.users.forEach(u => existingByEmail.set((u.email || '').toLowerCase(), u.id));
    if (list.users.length < 1000) break;
  }
  console.log(`${existingByEmail.size} already present.\n`);
}

const idMap = new Map(); // firebase uid -> supabase uuid
const failures = [];
let created = 0;
let reused = 0;
let done = 0;

for (const [firebaseUid, profile] of Object.entries(users)) {
  const email = (profile?.email || '').trim();
  done += 1;

  if (!email) {
    failures.push(`${firebaseUid}: no email in export`);
    continue;
  }

  if (dryRun) {
    idMap.set(firebaseUid, `dry-run-${firebaseUid}`);
    continue;
  }

  let userId = existingByEmail.get(email.toLowerCase());

  if (userId) {
    reused += 1;
  } else {
    const { data: result, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true
    });

    if (error) {
      failures.push(`${email}: ${error.message}`);
      continue;
    }

    userId = result.user.id;
    existingByEmail.set(email.toLowerCase(), userId);
    created += 1;
  }

  idMap.set(firebaseUid, userId);

  // The on_auth_user_created trigger normally inserts this row already. Upsert
  // rather than update so a missing row is created instead of silently
  // affecting nothing and losing the name and tags.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, name: profile.name ?? null, tags: toArray(profile.tags) });

  if (profileError) failures.push(`${email} profile: ${profileError.message}`);

  if (done % 25 === 0) {
    process.stdout.write(`  users: ${done}/${Object.keys(users).length}\r`);
  }
}

if (!dryRun) {
  console.log(`Users: ${created} created, ${reused} reused.                    \n`);
}

let written = 0;
let skipped = 0;
let coercedType = 0;

for (const [firebaseUid, logs] of Object.entries(logsByUser)) {
  const userId = idMap.get(firebaseUid);
  const entries = Object.entries(logs || {});

  if (!userId) {
    failures.push(`${entries.length} log(s) for unmapped user ${firebaseUid}`);
    skipped += entries.length;
    continue;
  }

  const rows = entries.map(([loggedAt, log]) => {
    if (log.type !== 'Flower' && log.type !== 'Concentrate') coercedType += 1;

    const row = {
      user_id: userId,
      logged_at: new Date(loggedAt).toISOString(),
      strain: log.strain ?? 'Unknown',
      // 11 logs in the 2018 export predate the type field.
      type: log.type === 'Concentrate' ? 'Concentrate' : 'Flower',
      tags: toArray(log.tags),
      final_rating: log.finalRating ?? 0,
      notes: log.notes ?? null
    };
    RATING_FIELDS.forEach(field => {
      row[field] = log[field] ?? 0;
    });
    return row;
  });

  if (dryRun) {
    written += rows.length;
    continue;
  }

  const { error } = await supabase.from('logs').upsert(rows, { onConflict: 'user_id,logged_at' });

  if (error) {
    failures.push(`logs for ${firebaseUid}: ${error.message}`);
    skipped += rows.length;
  } else {
    written += rows.length;
    process.stdout.write(`  logs: ${written}/${totalLogs}\r`);
  }
}

console.log(`\nDone. ${written} log(s) written, ${skipped} skipped.`);
console.log(`${coercedType} log(s) had no type and were recorded as Flower.`);

if (failures.length > 0) {
  console.log(`\n${failures.length} problem(s):`);
  failures.slice(0, 40).forEach(f => console.log('  ! ' + f));
  if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
  process.exitCode = 1;
} else {
  console.log('No failures.');
}
