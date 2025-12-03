import * as z from "zod";

export const CourseTopicCreateSchema = z.object({
    number: z.string(),
    name: z.string(),
    long_name: z.string(),
    description: z.string().optional(),
    is_repeatable: z.boolean(),
    units: z.number().optional(),
    link: z.string(),
    course_id: z.uuid(),
});

export type CourseTopicCreate = z.infer<typeof CourseTopicCreateSchema>;