import { Button } from "@components"
import { AcademicCapIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid"

const Programs = () => {
  return (
    <>
      <header className="bg-inherit">
        <h1 className="px-app py-2 title">Programs</h1>
      </header>

      <main className="px-app py-4 flex flex-row gap-4 flex-1">
        <div className="flex flex-col w-72 gap-1">
          <Program displayName="Bachelor of Science (BSc) in Actuarial Science - Honours" degreeDesignationCode="BSC-H" />
          <Program displayName="Bachelor of Science (BSc) in Biomechanics" degreeDesignationCode="BSC" />
          <Program displayName="Minor: Software Engineering" degreeDesignationCode={null} />
          <Program displayName="Minor: Data Science" degreeDesignationCode={null} />
          <Program displayName="Embedded Certificate: Creative Writing" degreeDesignationCode={null} />
        </div>
        <div className="bg-surface rounded-xl p-6 flex-1">
          <div className="font-serif">Bachelor of Science (BSc) in Biomechanics</div>
        </div>
      </main>
    </>
  )
}

interface ProgramProps {
  displayName: string
  degreeDesignationCode: string | null
}

const Program = ({ displayName: name, degreeDesignationCode: degree_designation_code }: ProgramProps) => {
  const iconClassNames = "w-5 mr-3 flex-none"

  return (
    <Button variant="text" className="justify-start text-left">
      {
        degree_designation_code ? (
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