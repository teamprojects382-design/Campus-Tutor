import { z } from "zod";

import { studySpaceIdSchema, studySpaceInputSchema, studySpaceRowSchema } from "@/features/study-spaces/schemas/studySpace";

export type StudySpaceInput = z.infer<typeof studySpaceInputSchema>;
export type StudySpaceId = z.infer<typeof studySpaceIdSchema>;
export type StudySpace = z.infer<typeof studySpaceRowSchema>;
