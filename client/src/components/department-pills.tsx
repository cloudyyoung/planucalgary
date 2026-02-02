import { Department } from "@planucalgary/shared/prisma/client"
import { Pill, PillStatus } from "./ui/pill"

export const DepartmentPills = ({ departments }: { departments: (Department | string)[] }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {departments.map((department) => {
        if (typeof department === "string") {
          return (
            <Pill key={department}>
              {department}
            </Pill>
          )
        }
        return (
          <Pill key={department.code}>
            <PillStatus>{department.code}</PillStatus>
            <span>{department.display_name}</span>
          </Pill>
        )
      })}
    </div>
  )
}