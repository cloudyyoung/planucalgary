import * as z from "zod"

export const FacultyCreateSchema = z.object({
    name: z.string(),
    display_name: z.string(),
    code: z.string(),
    is_active: z.boolean(),
})

export type FacultyCreate = z.infer<typeof FacultyCreateSchema>

export const FacultyUpdateSchema = FacultyCreateSchema.partial()

export type FacultyUpdate = z.infer<typeof FacultyUpdateSchema>