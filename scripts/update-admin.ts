/**
 * One-time update of the existing owner row in admin_users.
 *
 * Does not insert. Does not run seed. Does not print secrets.
 *
 * Required:
 *   DATABASE_URL
 *   NEW_ADMIN_EMAIL  (preferred) or ADMIN_EMAIL
 *   NEW_ADMIN_PASSWORD, or a hidden prompt if unset
 *
 * Does not read ADMIN_PASSWORD (avoids hashing a stale seed value from .env.local).
 *
 *   npx --yes tsx --env-file=.env.local scripts/update-admin.ts
 */
import { stdin, stdout } from "node:process";
import readline from "node:readline";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { adminUsers } from "../src/db/schema";
import { isLocalDevAdminPassword } from "../src/lib/auth/deployment";
import { getPoolConfig, isLocalDatabaseUrl } from "../src/lib/db-pool";

const BCRYPT_COST = 12;

function readEmail(): string {
  const raw = process.env.NEW_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
  const email = raw.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Set NEW_ADMIN_EMAIL (or ADMIN_EMAIL) to a valid email.");
  }
  return email;
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    stdout.write(question);
    const wasRaw = stdin.isRaw;
    stdin.setRawMode?.(true);
    let value = "";
    const cleanup = () => {
      stdin.off("data", onData);
      if (stdin.setRawMode) stdin.setRawMode(Boolean(wasRaw));
      rl.close();
    };
    const onData = (char: Buffer) => {
      const s = char.toString("utf8");
      if (s === "\n" || s === "\r" || s === "\r\n") {
        stdout.write("\n");
        cleanup();
        resolve(value);
        return;
      }
      if (s === "\u0003") {
        cleanup();
        reject(new Error("Cancelled"));
        return;
      }
      if (s === "\u0008" || s === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      if (s === "\u001b") return;
      value += s;
    };
    stdin.on("data", onData);
  });
}

async function readPassword(): Promise<string> {
  const fromEnv = process.env.NEW_ADMIN_PASSWORD;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  if (!stdin.isTTY) {
    throw new Error("Set NEW_ADMIN_PASSWORD or run in a TTY for a hidden prompt.");
  }
  const typed = await promptHidden("New admin password (input hidden): ");
  if (!typed) throw new Error("Password is required.");
  return typed;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const email = readEmail();
  const password = await readPassword();

  if (isLocalDevAdminPassword(password)) {
    throw new Error("Refusing the local-dev placeholder password.");
  }
  if (!isLocalDatabaseUrl(url) && password.length < 12) {
    throw new Error("Remote database: use a password of at least 12 characters.");
  }

  const pool = new pg.Pool(getPoolConfig(url));
  const db = drizzle(pool);

  try {
    const existing = await db.select().from(adminUsers);

    if (existing.length === 0) {
      throw new Error("No admin_users row found. Refusing to insert.");
    }
    if (existing.length !== 1) {
      throw new Error(
        `Expected exactly 1 admin_users row, found ${existing.length}. Refusing to update.`,
      );
    }

    const current = existing[0];
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    const updated = await db
      .update(adminUsers)
      .set({ email, passwordHash })
      .where(eq(adminUsers.id, current.id))
      .returning({ id: adminUsers.id, email: adminUsers.email });

    if (updated.length !== 1) {
      throw new Error(`Expected 1 updated row, got ${updated.length}.`);
    }

    const verifyRows = await db.select().from(adminUsers);
    if (verifyRows.length !== 1) {
      throw new Error(`Post-update admin count is ${verifyRows.length}, expected 1.`);
    }
    if (verifyRows[0].id !== current.id) {
      throw new Error("Admin id changed unexpectedly.");
    }
    if (verifyRows[0].email !== email) {
      throw new Error("Admin email did not match the intended value.");
    }

    const hashOk = await bcrypt.compare(password, verifyRows[0].passwordHash);
    if (!hashOk) {
      throw new Error("Password verification against the stored hash failed.");
    }

    console.log("Admin credentials updated successfully.");
    console.log(`Updated admin email: ${updated[0].email}`);
    console.log("Rows updated: 1");
    console.log("Password verification successful");
    console.log("Admin account count: 1");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "Update failed.");
  process.exit(1);
});
