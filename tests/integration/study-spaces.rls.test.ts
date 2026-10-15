import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

import { createStudySpace, getStudySpace, updateStudySpace, deleteStudySpace, listStudySpaces } from "@/features/study-spaces/services/studySpaces";
import { MAX_STUDY_SPACES_PER_USER } from "@/features/study-spaces/constants";
import { NotFoundError } from "@/lib/errors";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasLocalSupabase = Boolean(supabaseUrl && supabaseAnonKey && serviceRoleKey);

describe.runIf(hasLocalSupabase)("study spaces rls", () => {
  let admin: SupabaseClient;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    admin = createClient(supabaseUrl as string, serviceRoleKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userA, error: userAError } = await admin.auth.admin.createUser({
      email: "studyspace-a@example.com",
      password: "Password123!",
      email_confirm: true,
    });

    const { data: userB, error: userBError } = await admin.auth.admin.createUser({
      email: "studyspace-b@example.com",
      password: "Password123!",
      email_confirm: true,
    });

    if (userAError || !userA.user) {
      throw new Error("Unable to create first test user.");
    }

    if (userBError || !userB.user) {
      throw new Error("Unable to create second test user.");
    }

    userAId = userA.user.id;
    userBId = userB.user.id;
  });

  afterAll(async () => {
    if (userAId) {
      await admin.auth.admin.deleteUser(userAId);
    }
    if (userBId) {
      await admin.auth.admin.deleteUser(userBId);
    }
  });

  it("allows the owner to create and list spaces and keeps another user empty", async () => {
    const clientA = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const clientB = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: sessionA } = await clientA.auth.signInWithPassword({
      email: "studyspace-a@example.com",
      password: "Password123!",
    });
    const { data: sessionB } = await clientB.auth.signInWithPassword({
      email: "studyspace-b@example.com",
      password: "Password123!",
    });

    if (!sessionA.user || !sessionB.user) {
      throw new Error("Failed to sign in test users.");
    }

    const aResult = await createStudySpace(clientA, userAId, { name: "Physics 101", courseCode: "PHYS101", description: "Review notes" });
    expect(aResult.ok).toBe(true);

    if (aResult.ok) {
      const listA = await listStudySpaces(clientA);
      expect(listA.ok).toBe(true);
      if (listA.ok) {
        expect(listA.value).toHaveLength(1);
      }

      const listB = await listStudySpaces(clientB);
      expect(listB.ok).toBe(true);
      if (listB.ok) {
        expect(listB.value).toHaveLength(0);
      }
    }
  });

  it("returns not found for another user's space", async () => {
    const clientA = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const clientB = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await clientA.auth.signInWithPassword({ email: "studyspace-a@example.com", password: "Password123!" });
    await clientB.auth.signInWithPassword({ email: "studyspace-b@example.com", password: "Password123!" });

    const created = await createStudySpace(clientA, userAId, { name: "Chemistry", courseCode: "CHEM100", description: "Exam prep" });
    if (!created.ok) {
      throw new Error("Could not create test study space for user A.");
    }

    const ownResult = await getStudySpace(clientA, created.value.id);
    expect(ownResult.ok).toBe(true);

    const otherResult = await getStudySpace(clientB, created.value.id);
    expect(otherResult.ok).toBe(false);
    if (!otherResult.ok) {
      expect(otherResult.error).toBeInstanceOf(NotFoundError);
    }

    const randomResult = await getStudySpace(clientB, "550e8400-e29b-41d4-a716-446655440000");
    expect(randomResult.ok).toBe(false);
    if (!randomResult.ok) {
      expect(randomResult.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("blocks updates and deletes by another user", async () => {
    const clientA = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const clientB = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await clientA.auth.signInWithPassword({ email: "studyspace-a@example.com", password: "Password123!" });
    await clientB.auth.signInWithPassword({ email: "studyspace-b@example.com", password: "Password123!" });

    const created = await createStudySpace(clientA, userAId, { name: "Literature", courseCode: "LIT200", description: "Book notes" });
    if (!created.ok) {
      throw new Error("Could not create study space.");
    }

    const updateResult = await updateStudySpace(clientB, created.value.id, { name: "Hacked", courseCode: "OWNED", description: "Nope" });
    expect(updateResult.ok).toBe(false);

    const deleteResult = await deleteStudySpace(clientB, created.value.id);
    expect(deleteResult.ok).toBe(false);

    const readBack = await getStudySpace(clientA, created.value.id);
    expect(readBack.ok).toBe(true);
  });

  it("enforces the per-user cap", async () => {
    const clientA = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await clientA.auth.signInWithPassword({ email: "studyspace-a@example.com", password: "Password123!" });

    for (let index = 0; index < MAX_STUDY_SPACES_PER_USER; index += 1) {
      const created = await createStudySpace(clientA, userAId, { name: `Space ${index + 1}`, courseCode: `C${index + 1}`, description: "n/a" });
      if (!created.ok && index < MAX_STUDY_SPACES_PER_USER - 1) {
        throw new Error("Unexpected cap failure before limit.");
      }
    }

    const blocked = await createStudySpace(clientA, userAId, { name: "Space 21", courseCode: "C21", description: "blocked" });
    expect(blocked.ok).toBe(false);
  });
});
