export const getSchema = () => {
  const anyOf = [
    { $ref: "#/$defs/and" },
    { $ref: "#/$defs/or" },
    { $ref: "#/$defs/not" },
    { $ref: "#/$defs/units" },
    { $ref: "#/$defs/consent" },
    { $ref: "#/$defs/admission" },
    { $ref: "#/$defs/year" },
    { $ref: "#/$defs/dynamic_course" },
    { type: "string" },
  ]

  return {
    type: "json_schema" as const,
    json_schema: {
      name: "requisite_schema",
      description: "Schema for course prerequisites",
      strict: true,
      schema: {
        type: "object",
        required: ["requisite"],
        additionalProperties: false,
        properties: { requisite: { anyOf: anyOf } },
        $defs: {
          and: {
            type: "object",
            description: "Logic operator of a relationship A and B",
            required: ["and"],
            additionalProperties: false,
            properties: {
              and: {
                type: "array",
                description: "and",
                items: { anyOf: anyOf },
                additionalProperties: false,
              },
            },
          },
          or: {
            type: "object",
            description: "Logic operator of a relationship A or B",
            required: ["or"],
            additionalProperties: false,
            properties: {
              or: {
                type: "array",
                description: "or",
                items: { anyOf: anyOf },
                additionalProperties: false,
              },
            },
          },
          not: {
            type: "object",
            description: "Logic operator of a relationship not A",
            required: ["not"],
            additionalProperties: false,
            properties: {
              not: {
                type: "object",
                description: "not",
                anyOf: anyOf,
                additionalProperties: false,
              },
            },
          },
          units: {
            type: "object",
            description: "X units",
            required: ["units", "from", "include", "exclude"],
            additionalProperties: false,
            properties: {
              units: { type: "number", description: "X units", additionalProperties: false },
              from: {
                description:
                  "Specify the courses that the units are from, this is a strict list that the units must be from. The elements can be either a course code, or a dynamic_course object when the courses has to fulfill certain criterias.",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "array",
                    items: {
                      anyOf: [{ type: "string", description: "A course code" }, { $ref: "#/$defs/dynamic_course" }],
                    },
                  },
                  { type: "null" },
                ],
              },
              include: {
                description:
                  "Include a list of courses when counting units. This field is usually used when the requisite says some additional units must be taken besides the previously named courses",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "array",
                    items: {
                      anyOf: [{ type: "string", description: "A course code" }, { $ref: "#/$defs/dynamic_course" }],
                    },
                  },
                  { type: "null" },
                ],
              },
              exclude: {
                description:
                  "Exclude a list of courses when counting units. This field is usually used when the requisite says some additional units besides the previously named courses",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "array",
                    items: {
                      anyOf: [{ type: "string", description: "A course code" }, { $ref: "#/$defs/dynamic_course" }],
                    },
                  },
                  { type: "null" },
                ],
              },
            },
          },
          consent: {
            type: "object",
            description: "consent",
            required: ["consent"],
            additionalProperties: false,
            properties: {
              consent: {
                additionalProperties: false,
                anyOf: [{ $ref: "#/$defs/faculty" }, { $ref: "#/$defs/department" }],
              },
            },
          },
          admission: {
            type: "object",
            description: "admission to a program, a department, or a course",
            required: ["admission"],
            additionalProperties: false,
            properties: {
              admission: {
                additionalProperties: false,
                anyOf: [{ $ref: "#/$defs/faculty" }, { $ref: "#/$defs/program" }, { $ref: "#/$defs/department" }],
              },
            },
          },
          faculty: {
            type: "object",
            description: "a faculty",
            required: ["faculty"],
            additionalProperties: false,
            properties: {
              faculty: {
                type: "string",
                description: "faculty",
                additionalProperties: false,
              },
            },
          },
          department: {
            type: "object",
            description: "a department",
            required: ["department"],
            additionalProperties: false,
            properties: {
              department: {
                type: "string",
                description: "department",
                additionalProperties: false,
              },
            },
          },
          program: {
            type: "object",
            description: "a program",
            required: ["program", "faculty", "department", "honours", "type", "degree", "career", "year", "gpa"],
            additionalProperties: false,
            properties: {
              program: {
                description: "the field name of the program; leave null if no specific program name is specified",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              faculty: {
                description: "The faculty that offers the program",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "string",
                  },
                  { type: "null" },
                ],
              },
              department: {
                description: "The department that offers the program",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              honours: {
                description: "Whether the program has to be an honours program",
                additionalProperties: false,
                anyOf: [{ type: "boolean" }, { type: "null" }],
              },
              type: {
                description: "type of program; eg, major, minor, concentration",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "string",
                    enum: ["major", "minor", "concentration"],
                  },
                  { type: "null" },
                ],
              },
              degree: {
                description: "degree name; eg, BSc, BA, BEng, etc",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              career: {
                description: "career level; eg, undergraduate, master, doctoral",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "string",
                    enum: ["undergraduate", "master", "doctoral"],
                  },
                  { type: "null" },
                ],
              },
              year: {
                description: "academic standing",
                additionalProperties: false,
                anyOf: [
                  {
                    type: "string",
                    enum: ["first", "second", "third", "fourth", "fifth"],
                  },
                  { type: "null" },
                ],
              },
              gpa: {
                description: "minimum GPA",
                additionalProperties: false,
                anyOf: [{ type: "number" }, { type: "null" }],
              },
            },
          },
          year: {
            type: "object",
            description:
              "year of study, or year standing. eg, first-year, second-year, third-year, fourth-year, fifth-year standing or higher",
            additionalProperties: false,
            anyOf: [
              {
                type: "string",
                enum: ["first", "second", "third", "fourth", "fifth"],
              },
            ],
          },
          dynamic_course: {
            type: "object",
            description: "an object to describe some matching criteria for a group of courses",
            required: ["field", "level", "subject", "department", "faculty"],
            additionalProperties: false,
            properties: {
              field: {
                description:
                  "Field of study. Only include this field is the requisite specifically mentions a field of study. Eg, '6 units of courses in the field of Art.'",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              level: {
                description:
                  "Course level of study. When suffixed with +, it means at or above the level. Eg, '6 units of courses at the 300 level or above.'",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              subject: {
                description:
                  "Subject of study. Only include this field is the requisite specifically mentions a subject. Eg, '6 units of courses labelled Art.'",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              department: {
                description:
                  "Department of study. Only include this field is the requisite specifically mentions a department. Eg, '6 units of courses in the department of Art.'",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
              faculty: {
                description:
                  "Faculty of study. Only include this field is the requisite specifically mentions a faculty. Eg, '6 units of courses in the faculty of Science.'",
                additionalProperties: false,
                anyOf: [{ type: "string" }, { type: "null" }],
              },
            },
          },
        },
      },
    },
  }
}
