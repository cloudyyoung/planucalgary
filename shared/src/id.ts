import * as z from "zod"

export const IdInputSchema = z.object({
    id: z.string(),
})

export type IdInput = z.infer<typeof IdInputSchema>
