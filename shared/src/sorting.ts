export const getSortableColumns = (columns: string[]) => {
    return columns.flatMap((col) => [col, `-${col}`])
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
