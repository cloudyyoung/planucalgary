import { Button } from "@components"
import { AcademicCapIcon, ArrowRightCircleIcon, PlusIcon } from "@heroicons/react/24/solid"

const Programs = () => {
  return (
    <>
      <header className="bg-inherit">
        <h1 className="px-app py-2 title">Programs</h1>
      </header>

      <main className="px-app py-4 flex flex-row gap-4 flex-1">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col w-72 gap-1">
            <Program displayName="Bachelor of Science (BSc) in Actuarial Science - Honours" type="ACP" isSelected />
            <Program displayName="Bachelor of Science (BSc) in Biomechanics" type="ACP" />
            <Program displayName="Minor: Software Engineering" type="MIN" />
            <Program displayName="Minor: Data Science" type="MIN" />
            <Program displayName="Embedded Certificate: Creative Writing" type="EMC" />
          </div>
          <div>
            <Button variant="filled">
              <PlusIcon className="w-5 mr-2 flex-none" />
              Add program
            </Button>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-6 flex-1">
          <div className="font-serif text-5xl py-4 text-primary">Bachelor of Science (BSc) in Biomechanics</div>
        </div>
      </main>
    </>
  )
}

interface ProgramProps {
  displayName: string
  type: string // ACP | MIN | EMC
  isSelected?: boolean
}

const Program = ({
  displayName: name,
  type: type,
  isSelected: is_selected = false
}: ProgramProps) => {
  const iconClassNames = "w-5 mr-2 flex-none"

  return (
    <Button variant={is_selected ? "tonal" : "text"} className="justify-start text-left">
      {
        type === "ACP" ? (
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