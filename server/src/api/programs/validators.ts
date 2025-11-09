import { z } from "zod"

export const ProgramStartTermSchema = z.object({
  start_term: z
    .object({
      year: z.number(),
      term: z.enum(["WINTER", "SPRING", "SUMMER", "FALL"]).nullable(),
    })
    .nullable(),
})

export type ProgramStartTerm = z.infer<typeof ProgramStartTermSchema>

export const ProgramCreateRelationsSchema = z.object({
  departments: z.array(z.string()),
  faculties: z.array(z.string()),
})

export type ProgramCreateRelations = z.infer<typeof ProgramCreateRelationsSchema>

export const ProgramUpdateRelationsSchema = ProgramCreateRelationsSchema.partial()

export type ProgramUpdateRelations = z.infer<typeof ProgramUpdateRelationsSchema>

export const ProgramListSchema = z.object({
  keywords: z.string().optional(),
})

export type ProgramList = z.infer<typeof ProgramListSchema>
