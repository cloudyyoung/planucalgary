import * as z from "zod";

export const CourseSetCreateSchema = z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().nullable(),
    csid: z.string(),
    course_set_group_id: z.string(),
    json: z.any().nullable(),
    course_set_created_at: z.date(),
    course_set_last_updated_at: z.date(),
});

export type CourseSetCreate = z.infer<typeof CourseSetCreateSchema>;

export const CourseSetUpdateSchema = CourseSetCreateSchema.partial()

export type CourseSetUpdate = z.infer<typeof CourseSetUpdateSchema>;