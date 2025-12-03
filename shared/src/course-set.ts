import * as z from "zod";

export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject { [key: string]: JsonValue; }


export const CourseSetCreateSchema = z.object({
    id: z.string(),
    name: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
    type: z.string(),
    description: z.string().nullable(),
    csid: z.string(),
    course_set_group_id: z.string(),
    json: z.any().nullable(),
    course_set_created_at: z.date(),
    course_set_last_updated_at: z.date(),
});

export type CourseSetCreate = z.infer<typeof CourseSetCreateSchema>;

export const CourseSetUpdateSchema = z.object({
    name: z.string().optional(),
    updated_at: z.date().optional(),
    type: z.string().optional(),
    description: z.string().nullable().optional(),
    csid: z.string().optional(),
    course_set_group_id: z.string().optional(),
    json: z.any().nullable().optional(),
    course_set_created_at: z.date().optional(),
    course_set_last_updated_at: z.date().optional(),
});

export type CourseSetUpdate = z.infer<typeof CourseSetUpdateSchema>;