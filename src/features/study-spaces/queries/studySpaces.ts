import { getDb } from "@/features/study-spaces/server/deps";
import { listStudySpaces } from "@/features/study-spaces/services/studySpaces";

export async function loadStudySpaces() {
  const db = await getDb();
  return listStudySpaces(db);
}
