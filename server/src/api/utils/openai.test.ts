import { getSchema } from "../../jsonlogic/schema"
import { getRelatedData } from "./openai"

describe("openai", () => {
  it("get related data", async () => {
    const { subjects, faculties, departments, courses } = await getRelatedData(
      // "18 units of courses labelled Art History at the 300 level or above and consent of the Department.",
      // "3 units from Philosophy 309, 311, 333, 359; and 3 units in a course labelled Philosophy.",
      "3 units from Physics 211, 221, 227 or Engineering 202; and 3 units from Mathematics 267 or 277.",
      "ART",
      "AR",
    )
    const subjectCodes = subjects.map((subject) => subject.code)
    const facultyCodes = faculties.map((faculty) => faculty.code)
    const departmentCodes = departments.map((department) => department.code)
    const courseCodes = courses.map((course) => course.code)

    const schema = getSchema()
    console.error(schema)

    console.error(subjectCodes)
    console.error(facultyCodes)
    console.error(departmentCodes)
    console.error(courseCodes)
  })
})
