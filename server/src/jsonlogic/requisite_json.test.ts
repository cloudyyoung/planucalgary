import { ValidateOptions, ValidateResult, getValidator } from "./requisite_json"

describe("validator", () => {
  let validate: (json: any, options?: ValidateOptions) => ValidateResult

  beforeAll(async () => {
    validate = await getValidator()
  })

  it("validate course, truthy", () => {
    const json = "CPSC217"
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("validate course, falsy", () => {
    const json = "ABCD1237"
    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("validate and with two courses, truthy", () => {
    const json = { and: ["CPSC217", "CPSC231"] }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("validate and with two courses, truthy", () => {
    const json = { and: ["ABCD222", "TTTT222"] }
    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("validate units with from, truthy", () => {
    const json = {
      from: ["ENGG213", "COMS363", "SGMA217"],
      units: 3,
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("validate and with two arguments of units, falsy", () => {
    const json = {
      and: [
        {
          from: ["CPSC251", "MATH271", "MATH273", "MATH999"],
          units: 3,
        },
        {
          from: ["CPSC219", "CPSC233", "CPSC235", "ENCM335", "ENCM339", "ENSF337"],
          units: 3,
        },
      ],
    }

    const result = validate(json, { strict: true })
    expect(result.valid).toBe(false)
  })

  it("validate and with two arguments of units + another or, truthy", () => {
    const json = {
      and: [
        {
          from: ["DRAM210", "DRAM223", "DRAM225"],
          units: 12,
        },
        {
          or: ["DRAM242", "DRAM243"],
        },
      ],
    }

    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("validate and with only one argument, false", () => {
    const json = {
      and: [
        {
          or: ["DRAM243"],
        },
      ],
    }

    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("validate year, truthy", () => {
    const json = {
      and: [
        {
          year: "third",
        },
        {
          consent: {
            faculty: "AR",
          },
        },
      ],
    }

    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a really simple json: course, truthy", () => {
    const json = "CPSC217"
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a simple json: course, falsy", () => {
    const json = "ABCD123"
    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("valid a simple json: and with two courses, truthy", () => {
    const json = { and: ["ACCT445", "ACCT357"] }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a simple json: and with two courses, falsy", () => {
    const json = { and: ["ABCD123", "CDEF456"] }
    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("valid a simpler json, and with units + or, truthy", () => {
    const json = {
      and: [
        {
          units: 24,
          from: [
            {
              subject: "CPSC",
            },
          ],
        },
        {
          or: ["ACCT425", "ACCT357"],
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a simpler json: and with units + units + or, falsy", () => {
    const json = {
      and: [
        {
          units: 24,
          from: [
            {
              subject: "ABCD",
            },
          ],
        },
        {
          units: 24,
          from: [
            {
              department: "XXXXXX",
            },
          ],
        },
        {
          or: [true, "ACCT301"],
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("valid a complex json: and with units + consent, truthy", () => {
    const json = {
      and: [
        {
          units: 15,
          from: [
            {
              subject: "ART",
              department: "ART",
            },
          ],
        },
        {
          consent: {
            faculty: "SC",
          },
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a year json", () => {
    const json = {
      year: "fourth",
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a complex json: and with course + admission + consent, truthy", () => {
    const json = {
      and: [
        "KNES260",
        {
          admission: {
            faculty: "KN",
          },
        },
        {
          consent: {
            faculty: "KN",
          },
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a complex json: and with units + consent, truthy", () => {
    const json = {
      and: [
        {
          units: 18,
          from: [
            {
              level: "300+",
              subject: "ARHI",
            },
          ],
        },
        {
          consent: {
            department: "ART",
          },
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a complex json: and with units + nested or + year, truthy", () => {
    const json = {
      and: [
        {
          from: ["MATH249", "MATH265", "MATH275"],
          units: 3,
        },
        {
          or: [
            {
              units: 3,
              from: [
                {
                  faculty: "SC",
                },
              ],
            },
            {
              units: 3,
              from: [
                {
                  faculty: "EN",
                },
              ],
            },
          ],
        },
        {
          year: "third",
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })

  it("valid a complex json: or with untracked course, truthy", () => {
    const json = {
      or: ["PLAN602", "Environmental Design Planning 602"],
    }
    const result = validate(json, { strict: true })
    expect(result.valid).toBe(true)
  })

  it("valid a complex json: units with level, falsy", () => {
    const json = {
      units: 3,
      from: [
        {
          level: "AA",
        },
      ],
    }
    const result = validate(json)
    expect(result.valid).toBe(false)
  })

  it("validate course with topic number", () => {
    const json = {
      from: ["ENCI481", "ENEE377", "ENEE519.09"],
      units: 3,
    }
    const result = validate(json)
    expect(result.valid).toBe(true)
  })
})
