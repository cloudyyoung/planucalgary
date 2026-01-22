import z from "zod";

export const getSortingReqQuerySchema = <T extends Readonly<Record<string, string>>>(schema: z.ZodEnum<T>) => {
    return z.enum(schema.options.flatMap((col) => [col, `-${col}`])).array().optional();
}

export const getSortings = (sortings: string[] | undefined) => {
    if (!sortings) return [];
    return sortings.map((sort) => {
        if (sort.startsWith("-")) {
            return { [sort.substring(1)]: "desc" as const }
        } else {
            return { [sort]: "asc" as const }
        }
    })
}
