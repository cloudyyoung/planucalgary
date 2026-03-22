export type SortDirection = "asc" | "desc"

export const getSortings = (sorting?: string[]) => {
  if (!sorting || sorting.length === 0) {
    return []
  }

  return sorting.map((field) => {
    const isDesc = field.startsWith("-")
    const key = isDesc ? field.slice(1) : field

    return {
      [key]: isDesc ? "desc" : "asc",
    }
  })
}
