import { vi } from "vitest";
import { db } from "@/db";
import { runMigrations } from "@/db/migrate";

// Next.js request-scoped APIs are not available outside a request; stub them for tests.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Each worker gets a fresh in-memory PGlite database (DATABASE_URL=memory://).
await runMigrations(db, undefined);
