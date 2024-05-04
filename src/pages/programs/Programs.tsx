import { AcademicCapIcon, ArrowRightCircleIcon, PlusIcon } from "@heroicons/react/24/solid"
import { Button, ButtonProps } from "@components"
import { useEffect, useState } from "react";
import api from "src/api";
import { CatalogProgram } from "./types";
import ProgramDetails from "./ProgramDetails";

const Programs = () => {
  const [enrolledPrograms, setEnrolledPrograms] = useState<CatalogProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<CatalogProgram>()
  const [programData, setProgramData] = useState<CatalogProgram>()

  useEffect(() => setEnrolledPrograms([
    { coursedog_id: "ACSCBSCH-2022-09-01", display_name: "Bachelor of Science (BSc) in Actuarial Science - Honours", type: "ACP", requisites: [] },
    { coursedog_id: "BCEMBSC-2022-09-01", display_name: "Bachelor of Science (BSc) in Biochemistry", type: "ACP", requisites: [] },
    { coursedog_id: "CPSCBSC-2022-09-01", display_name: "Bachelor of Science (BSc) in Computer Science", type: "ACP", requisites: [] },
    { coursedog_id: "ENSF-MIN-1901-01-01", display_name: "Minor: Software Engineering", type: "MIN", requisites: [] },
    { coursedog_id: "DATA-MIN-1901-01-01", display_name: "Minor: Data Science", type: "MIN", requisites: [] },
    { coursedog_id: "CRWR-EMC-1901-01-01", display_name: "Embedded Certificate: Creative Writing", type: "EMC", requisites: [] },
  ]), [])

  useEffect(() => {
    if (selectedProgram) {
      api.get(`/programs/${selectedProgram.coursedog_id}`)
        .then(({ data }) => {
          setProgramData(data)
          console.log(data)
        })
    }
  }, [selectedProgram])

  return (
    <>
      <main className="px-app py-4 pt-0 flex flex-row gap-4 flex-1 overflow-hidden">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <header className="bg-inherit">
              <h1 className="title pt-2">Programs</h1>
            </header>
            <div className="flex flex-col w-72 gap-1">
              {
                enrolledPrograms.map((program, index) => (
                  <EnrolledProgramButton
                    key={index}
                    displayName={program.display_name}
                    programType={program.type}
                    isSelected={program.coursedog_id === selectedProgram?.coursedog_id}
                    onClick={() => setSelectedProgram(program)}
                  />
                ))
              }
            </div>
          </div>
          <div>
            <Button variant="filled">
              <PlusIcon className="w-5 mr-2 flex-none" />
              Add program
            </Button>
          </div>
        </div>
        <div className="bg-surface rounded-3xl px-6 flex flex-1 overflow-y-auto flex-wrap text-on-surface leading-8">
          <div className="mx-auto max-w-7xl flex-1">
            <div className="font-serif text-5xl py-24 text-primary">
              {selectedProgram?.display_name}
            </div>
            <div className="">
              {
                programData ? (
                  <ProgramDetails programData={programData} />
                ) : (
                  <div className="text-center py-24">
                    <div className="text-2xl text-on-surface-low">Select a program to view details</div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </main>
    </>
  )
}


interface EnrolledProgramButtonProps {
  displayName: string
  programType: string // ACP | MIN | EMC
  isSelected?: boolean
  onClick: ButtonProps["onClick"]
}

const EnrolledProgramButton = ({
  displayName: name,
  programType,
  isSelected: is_selected = false,
  onClick,
}: EnrolledProgramButtonProps) => {
  const iconClassNames = "w-5 mr-2 flex-none"
  return (
    <Button variant={is_selected ? "tonal" : "text"} className="justify-start text-left px-0 py-2" onClick={onClick}>
      {
        programType === "ACP" ? (
          <AcademicCapIcon className={iconClassNames} />
        ) : (
          <ArrowRightCircleIcon className={iconClassNames} />
        )
      }
      {name}
    </Button>
  )
}

export default Programs
export { Programs }