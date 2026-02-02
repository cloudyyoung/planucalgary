import { Faculty } from "@planucalgary/shared/prisma/client"
import { Pill, PillStatus } from "./ui/pill"

export const FacultyPills = ({ faculties }: { faculties: (Faculty | string)[] }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {faculties.map((faculty) => {
        if (typeof faculty === "string") {
          return (
            <Pill key={faculty}>
              {faculty}
            </Pill>
          )
        }
        return (
          <Pill key={faculty.code}>
            <PillStatus>{faculty.code}</PillStatus>
            <span>{faculty.display_name}</span>
          </Pill>
        )
      })}
    </div>
  )
}