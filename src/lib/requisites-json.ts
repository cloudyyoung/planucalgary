const is_object = (obj: object, key: string | string[]): boolean => {
  if (typeof obj !== "object") {
    return false
  }
  const keys = Array.isArray(key) ? key : [key]
  return Object.keys(obj).every((k) => keys.includes(k))
}

interface OperatorMatcherResult {
  key: string;
  children: any[];
}

const operator_matchers: Record<string, (obj: any, ...args: any[]) => OperatorMatcherResult | undefined> = {
  and: (obj: any) => {
    if (!is_object(obj, "and")) return

    const and_arguments = obj.and as any[]
    return {key: 'and', children: and_arguments}
  },
  or: (obj: any) => {
    if (!is_object(obj, "or")) return

    const or_arguments = obj.or as any[]
    return {key: 'or', children: or_arguments}
  },
  not: (obj: any) => {
    if (!is_object(obj, "not")) return

    const not_argument = obj.not
    return {key: 'not', children: [not_argument]}
  },
  units: (obj: any) => {
    if (!is_object(obj, ["units", "from", "not"])) return

    const units = obj.units as number
    const from = obj.from as any[]
    return {key: `${units} units`, children: from}
  }
}

export const getOperator = (obj: any): OperatorMatcherResult | undefined => {
  for (const [_, matcher] of Object.entries(operator_matchers)) {
    const result = matcher(obj)
    if (result) return result
  }
  return undefined
}
