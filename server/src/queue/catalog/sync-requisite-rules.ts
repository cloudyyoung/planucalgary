import { RequisiteRuleValue } from "@planucalgary/shared"
import { PrismaClient, RequisiteRule } from "@planucalgary/shared/prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/client"


export async function buildRequisiteRuleRelations(rule: RequisiteRule, prisma: Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) {
  if (!rule.raw_json) return

  const rawJson = rule.raw_json as any as RequisiteRuleValue
  const values = rawJson.values
  const flattenedValues: string[] = values.flatMap((v) => {
    if (typeof v === "string") {
      return [v]
    } else if (typeof v === "object" && v.logic && Array.isArray(v.value)) {
      return v.value
    }
    return []
  })

  return await prisma.requisiteRule.update({
    where: { id: rule.id },
    data: {
      referring_courses: {
        set: flattenedValues.map(id => ({ course_group_id: id })),
      },
      referring_programs: {
        set: flattenedValues.map(id => ({ program_group_id: id })),
      },
      referring_course_sets: {
        set: flattenedValues.map(id => ({ course_set_group_id: id })),
      },
      referring_requisite_sets: {
        set: flattenedValues.map(id => ({ requisite_set_group_id: id })),
      },
    },
  })
}
