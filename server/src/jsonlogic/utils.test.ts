import { cleanup } from "./utils"

describe("Test util functions", () => {
  it("Test remove redundant logical nesting simple", () => {
    const redundant_obj = {
      and: ["CPSC501"],
    }

    const expected_obj = "CPSC501"
    const cleaned_obj = cleanup(redundant_obj)

    expect(cleaned_obj).toEqual(expected_obj)
  })

  it("Test remove redundant logical nesting object", () => {
    const redundant_obj = {
      and: [
        {
          level: "300+",
          units: 12,
          subject: "ART",
        },
      ],
    }

    const expected_obj = {
      level: "300+",
      units: 12,
      subject: "ART",
    }

    const cleaned_obj = cleanup(redundant_obj)

    expect(cleaned_obj).toEqual(expected_obj)
  })

  it("Test remove redundant logical nesting complex", () => {
    const redundant_obj = {
      and: [
        {
          level: "300+",
          units: 12,
          subject: "ART",
          field: null,
          from: null,
        },
        {
          or: [
            "CPSC219",
            {
              or: ["CPSC233"],
            },
            {
              and: ["ACSC211"],
            },
            {
              or: [],
            },
            { and: [{ or: [{ and: [{ or: [] }] }] }] },
            { and: [{ or: [{ and: [{ or: ["CPSC217"] }] }] }] },
            { and: [{ or: [{ and: [{ or: [] }] }, "CPSC211"] }] },
          ],
        },
      ],
    }

    const expected_obj = {
      and: [
        {
          level: "300+",
          units: 12,
          subject: "ART",
        },
        {
          or: ["CPSC219", "CPSC233", "ACSC211", "CPSC217", "CPSC211"],
        },
      ],
    }

    const cleaned_obj = cleanup(redundant_obj)
    expect(cleaned_obj).toEqual(expected_obj)
  })

  it("Test remove redundant logical nesting complex 2", () => {
    const redundant_obj = {
      and: [
        {
          units: 60,
        },
        {
          and: [
            "ANTH350",
            {
              consent: {
                department: "ANAR",
              },
            },
          ],
        },
      ],
    }

    const expected_obj = {
      and: [
        {
          units: 60,
        },
        "ANTH350",
        { consent: { department: "ANAR" } },
      ],
    }

    const cleaned_obj = cleanup(redundant_obj)
    expect(cleaned_obj).toEqual(expected_obj)
  })
})
