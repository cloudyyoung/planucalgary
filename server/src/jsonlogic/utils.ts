export interface OperatorsDict {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any) => any
}

export const bool = (value: any): boolean => {
  return !!value
}

export const cleanup = (obj: any): any => {
  if (obj === null) {
    return null
  }

  if (typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    const value = obj.map(cleanup).filter(bool)
    if (value.length === 0) return null
    return value
  }

  const keys = Object.keys(obj).sort()

  if (keys.length === 1) {
    const key = keys[0]
    const value = obj[key]

    // If the key is "and" or "or" and the value is an array with only one element,
    // we can remove the key and return the value directly.
    if (key === "and" || key === "or") {
      const array = value.map(cleanup).filter(bool)
      if (array.length === 0) return null
      if (array.length === 1) return cleanup(array[0])

      // Two or more values
      const newArray = []
      for (const value of array) {
        const childKeys = Object.keys(value)

        if (childKeys.length > 1) {
          newArray.push(value)
          continue
        }

        const childKey = childKeys[0]
        const childValue = value[childKey]

        // If the same logic operator is nested, we can flatten it
        if (childKey === key) {
          newArray.push(...childValue)
        } else {
          newArray.push(value)
        }
      }

      return { [key]: newArray }
    }
  }

  const newObj: { [key: string]: any } = {}

  for (const key of keys) {
    const value = obj[key]

    if (Array.isArray(value) && value.length === 0) {
      continue
    }

    const newValue = cleanup(value)

    if (!newValue) {
      continue
    }

    newObj[key] = newValue
  }

  if (Object.keys(newObj).length === 0) {
    return null
  }

  return newObj
}

export const isJsonEqual = (a: JSON, b: JSON): boolean => {
  return JSON.stringify(a) === JSON.stringify(b)
}
