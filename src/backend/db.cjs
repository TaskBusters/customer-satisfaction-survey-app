const path = require("path");
const fs = require("fs");

// Try multiple possible .env locations
const possibleEnvPaths = [
  path.join(__dirname, "../../.env"),
  path.join(__dirname, "../.env"),
  path.join(process.cwd(), ".env"),
];

let envLoaded = false;
let actualEnvPath = null;

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    console.log("[db.cjs] Found .env at:", envPath);
    const envConfig = require("dotenv").config({ path: envPath });
    
    if (!envConfig.error) {
      actualEnvPath = envPath;
      envLoaded = true;
      console.log("[db.cjs] Successfully loaded .env with", Object.keys(envConfig.parsed || {}).length, "variables");
      break;
    }
  }
}

if (!envLoaded) {
  console.error("[db.cjs] WARNING: Could not find or load .env file!");
  console.error("[db.cjs] Searched in:");
  possibleEnvPaths.forEach(p => console.error("  -", p));
  console.error("[db.cjs] Trying to use environment variables directly...");
}

// Verify DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error("[db.cjs] CRITICAL: DATABASE_URL is not set!");
  console.error("[db.cjs] Available env vars:", Object.keys(process.env).filter(k => k.includes('DB') || k.includes('DATABASE')));
  
  // Hardcode the connection string as a last resort (ONLY FOR DEVELOPMENT)
  process.env.DATABASE_URL = "postgresql://customersatisfactionsurvey_user:DyByd6lx4N8U6lnAkDsX0yaCMhxpBUN6@dpg-d4s3ft7diees73djbcag-a.singapore-postgres.render.com/customersatisfactionsurvey";
  console.error("[db.cjs] Using hardcoded DATABASE_URL (development only!)");
} else {
  console.log("[db.cjs] DATABASE_URL loaded successfully");
  console.log("[db.cjs] Database host:", process.env.DATABASE_URL.match(/(?:@)([^:/]+)/)?.[1] || "unknown");
}

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10, // maximum number of connections
});

// Test the connection
pool.on('connect', () => {
  console.log('[db.cjs] PostgreSQL connection established');
});

pool.on('error', (err) => {
  console.error('[db.cjs] PostgreSQL connection error:', err.message);
});

module.exports = pool;