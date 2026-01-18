export const getSortableColumns = (columns: string[]) => {
    return columns.flatMap((col) => [col, `-${col}`])
}

export const getSortings = (sortings: string[]) => {
    const a = {} as { [key: string]: "asc" | "desc" }
    for (const sort of sortings) {
        if (sort.startsWith("-")) {
            a[sort.slice(1)] = "desc"
        } else {
            a[sort] = "asc"
        }
    }
    return a
}