import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["app", "lib", "components"];
const patterns = ["createAdminClient", "supabaseAdmin"];
const matches = [];

function walk(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(item)) continue;
      walk(path);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(path)) continue;

    const content = readFileSync(path, "utf8");
    patterns.forEach((pattern) => {
      if (content.includes(pattern)) {
        matches.push(path);
      }
    });
  }
}

for (const root of roots) {
  try {
    walk(root);
  } catch {
    // folder may not exist
  }
}

const uniqueMatches = [...new Set(matches)];

if (uniqueMatches.length > 0) {
  console.log("Files using admin Supabase client:");
  uniqueMatches.forEach((file) => console.log(`- ${file}`));
  console.log("\nReview every file and make sure it is protected by admin role or cron auth before any DB call.");
} else {
  console.log("No admin client usage found.");
}
