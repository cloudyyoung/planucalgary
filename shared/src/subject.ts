import * as z from "zod"

export const SubjectCreateSchema = z.object({
    code: z.string(),
    title: z.string(),
})

export type SubjectCreate = z.infer<typeof SubjectCreateSchema>

export const SubjectUpdateSchema = SubjectCreateSchema.partial()
export type SubjectUpdate = z.infer<typeof SubjectUpdateSchema>
