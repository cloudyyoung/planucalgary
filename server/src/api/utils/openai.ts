import OpenAI from "openai"

import { OPENAI_API_KEY } from "../../config"
import { prismaClient } from "../../middlewares"
import { Course, CourseTopic, Department, Faculty, RequisiteType, Subject } from "@prisma/client"
import { cleanup } from "../../jsonlogic/utils"
import { getSchema } from "../../jsonlogic/schema"

export const OpenAIClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

export default OpenAIClient

export async function generatePrereq(
  req: string,
  req_type: RequisiteType,
  department: string,
  faculty: string,
  n: number,
): Promise<string[]> {
  const reqCleaned = req.replace("Prerequisite or Corequisite: ", "")

  const { subjects, faculties, departments, courses } = await getRelatedData(reqCleaned, department, faculty)

  const systemPrompt = getSystemPrompt()
  const userPrompt = getUserPrompt(reqCleaned, req_type, department, faculty, subjects, faculties, departments, courses)
  const responseFormat = getResponseFormat()

  const response = await OpenAIClient.chat.completions.create({
    model: "gpt-4o",
    n: n,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: responseFormat,
    store: true,
  })

  const contents = []

  for (const completion of response.choices) {
    if (completion.message.content === null) {
      continue
    }

    try {
      const content = JSON.parse(completion.message.content.trim())
      const obj = content["requisite"]
      const cleaned = cleanup(obj)
      contents.push(cleaned)
    } catch (e) {
      console.error(e)
      continue
    }
  }

  return contents
}

export const getRelatedData = async (req: string, department?: string, faculty?: string) => {
  let reqCleaned = req.replace("Prerequisite or Corequisite: ", "")

  const [subjects, faculties, departments] = await Promise.all([
    prismaClient.subject.findMany(),
    prismaClient.faculty.findMany(),
    prismaClient.department.findMany(),
  ])

  const relatedSubjects = []
  const sortedSubjects = subjects.sort((a, b) => b.title.length - a.title.length)

  for (const subject of sortedSubjects) {
    if (reqCleaned.includes(subject.title)) {
      relatedSubjects.push(subject)
      reqCleaned = reqCleaned.replace(subject.title, subject.code)
    }
  }

  const CourseNumberRegex = /([0-9]{2,3})(-[0-9])?([AB]?)(.[0-9]{2})?/g
  const numbers = reqCleaned.match(CourseNumberRegex) ?? []
  const subjectCodes = relatedSubjects.map((subject) => subject.code)
  const courseNumbers = numbers.map((number) => number.split(".")[0])

  const relatedCourses = await prismaClient.course.findMany({
    distinct: ["code"],
    include: {
      subject: true,
      topics: true,
    },
    where: {
      subject_code: {
        in: subjectCodes,
      },
      course_number: {
        in: Array.from([...numbers, ...courseNumbers]),
      },
    },
  })

  const relatedFaculties = faculties.filter((faculty) => reqCleaned.includes(faculty.display_name))
  const relatedDepartments = departments.filter((department) => reqCleaned.includes(department.name))

  const extraFaculty = faculties.find((faculty_obj) => faculty_obj.code === faculty)
  const extraDepartment = departments.find((department_obj) => department_obj.code === department)

  if (extraFaculty) {
    relatedFaculties.push(extraFaculty)
  }

  if (extraDepartment) {
    relatedDepartments.push(extraDepartment)
  }

  return {
    subjects: relatedSubjects,
    faculties: relatedFaculties,
    departments: relatedDepartments,
    courses: relatedCourses,
  }
}

const getResponseFormat = () => {
  return getSchema()
}

const getSystemPrompt = () => {
  return `
You are an advanced admission bot for a university tasked with processing course prerequisites for use in a structured database. Your job is to:
  1. Input:
    - The type of the requisite text. It can be a prerequisite (PREREQ), corequisite (COREQ), antirequisite (ANTIREQ), course set (COURSE_SET), or requisite set (REQUISITE_SET).
    - The requisite text.
    - The department and faculty related to the requisite. This is useful when the requisite text refers to "the department" or "the faculty".
  2. Rewrite the requisite string to expand course names.
    - When you see a list of courses with the same subject title, expand the subject title to the full course name.
    - For example, "Mathematics 101, 102, and 103" should be expanded to "Mathematics 101, Mathematics 102, and Mathematics 103".
  3. Replace course full names with their corresponding course codes.
    - If a course full name is found in the text, replace the full name string with the corresponding course code. Don't replace substrings.
    - If a course full name is not mentioned in the text, keep it as is. Remember, to keep the course full name as is if it is not in the list of courses.
    - If course number has more than a number, for example, "Mathematics 101.03", keep the whole number.
    - If course number has "A" or "B" at the end, for example, "Mathematics 101A", keep the whole number.
    - Don't mix use faculty or department codes on course code.
    - Don't replace course full names that are not in the given list.
    - Don't replace course full name is its *whole* name is not mentioned in the list of courses. Don't fall into the trap of replacing substrings. For example, if the course full name is "Applied Mathematics 101" and the text contains "Mathematics 101", don't replace it. "Applied Mathematics" is different from "Mathematics".
  4. Replace faculty names with their corresponding faculty codes.
    - If a faculty name is found in the text, replace the full name string with the corresponding faculty code.
    - If a faculty name is not mentioned in the text, keep it as is.
    - Don't replace faculty names that are not in the given list.
  5. Replace department names with their corresponding department codes.
    - If a department name found in the text, replace the full name string with the corresponding department code.
    - If a department name is not mentioned in the text, keep it as is.
    - Don't replace department names that are not in the given list.
  6. Output: Return a JSON object with the prerequisites in a structured format.
    - Avoid deeply nested logical structures for readability.
    - Simplify logical expressions wherever possible without losing meaning.
    - Ensure no requirement has "units" equal to 0, because it does not make sense to have a course with 0 units.
  7. Rules:
    - Represent logical prerequisites clearly in JSON format using keys like "and" or "or".
    - Handle exceptions gracefully by assuming ambiguous text needs clarification and simplifying to the most likely structure.
    - Try to use the logical operators you are provided with to represent the prerequisites as accurately as possible.
  8. Examples:
    Input Text: "Mathematics 101, Newjeans and Bunnies Club 499, and Physics 201.03 or Chemistry 102A, and Applied Mathematics 217."
    Output JSON:
      \`\`\`json
      {
        "and": [
          "MATH101",
          "Newjeans and Bunnies Club 499",
          {
            "or": [
              "PHYS201.03",
              "CHEM102A",
            ]
          },
          "Applied Mathematics 217",
        ]
      }
      \`\`\`

      Input Text: "Credit for Anthropology 213 and 346 will not be allowed."
      Output JSON:
      \`\`\`json
      {
        "and": [
          "ANTH213",
          "ANTH346",
        ]
      }
      \`\`\`

      Input Text: "Credit for Chemistry 201 and any of 209, 211, 301 or Engineering 204 will not be allowed."
      Output JSON:
      \`\`\`json
      {
        "and": [
          "CHEM201",
          {
            "or": [
              "CHEM209",
              "CHEM211",
              "CHEM301",
              "ENGG204",
            ]
          }
        ]
      }
      \`\`\`

      Input Text: "18 units - Biology 241, 243, 311 and 331"
      Output JSON:
      \`\`\`json
      {
        "from": [
          "BIOL241",
          "BIOL243",
          "BIOL311",
          "BIOL331"
        ],
        "units": 18
      }
      \`\`\`


  9. Additional Details:
    - Include clear logical operators (and, or) and group courses appropriately.
    - Handle cases like "any one of" or "at least X units in…" correctly.
    - Ensure your JSON object is syntactically correct.
    - You would normally do not need to use "not" operator in the JSON object for anti-requisites.

Given these guidelines, your task is to process the provided course and prerequisite text and return a well-formatted JSON object as described. If additional clarification is needed, infer reasonable assumptions. Always output valid JSON.

Some notices:
When you see a course followed by a unit number requirements from the same course level, for example: "Art History 340 and 6 units of courses labelled Art at the 300 level." The 6 units should be in addition to the Art History 340 course. In order to represent this, you can use the "not" field to exclude the course that is being repeated:
\`\`\`
{
  "and": [
    "ARHI340",
    {
      "units": 6,
      "from": [
        {"level": "300", "subject": "ART"}
      ]
      "not": [
        "ARHI340"
      ],
    }
  ]
}
\`\`\`
`
}

const getUserPrompt = (
  req: string,
  req_type: RequisiteType,
  req_department: string,
  req_faculty: string,
  subjects: Subject[],
  faculties: Faculty[],
  departments: Department[],
  courses: (Course & { subject: Subject; topics: CourseTopic[] })[],
) => {
  return `
# Requisite

The type of this requisite is: ${req_type}
The requisite text is: ${req}

If the requisite text mentions specifically a department or faculty, use the following information; otherwise, ignore it:
The course-related department is: ${req_department}
The course-related faculty is: ${req_faculty}


# Related Data

Here is a full list of course full name and their corresponding course codes you can use.
${courses
  .flatMap((course) => {
    if (course.topics.length > 0) {
      return course.topics.map((topic) => {
        const topicNumber = topic.number.padStart(2, "0")
        return `- Course full name is: "${course.subject.title} ${course.course_number}.${topicNumber}", its course code is: "${course.code}.${topicNumber}"`
      })
    }
    return [
      `- Course full name is: "${course.subject.title} ${course.course_number}", its course code is: "${course.code}"`,
    ]
  })
  .join("\n")}

Here is a full list of subject codes and their corresponding names you can use.
${subjects.map((subject) => `- Subject full title is: "${subject.title}", its subject title is: "${subject.code}"`).join("\n")}

Here is a full list of faculties and their corresponding names you can use.
${faculties.map((faculty) => `- Faculty full name is: "${faculty.name}", its faculty code is: "${faculty.code}"`).join("\n")}

Here is a full list of departments and their corresponding names you can use.
${departments.map((department) => `- Department full name is: "${department.display_name}", its department code is: "${department.code}"`).join("\n")}
`
}

export const getFineTuneJson = async (
  req_type: RequisiteType,
  req: string,
  department: string,
  faculty: string,
  json: any,
) => {
  const { subjects, faculties, departments, courses } = await getRelatedData(req, department, faculty)

  const systemPrompt = getSystemPrompt()
  const userPrompt = getUserPrompt(req, req_type, department, faculty, subjects, faculties, departments, courses)

  const response = {
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
      {
        role: "assistant",
        content: JSON.stringify({ requisite: json }),
      },
    ],
  }

  return response
}
