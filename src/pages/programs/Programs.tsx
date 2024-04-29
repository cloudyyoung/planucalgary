import { Button } from "@components"

const Programs = () => {
  return (
    <>
      <header className="bg-surface">
        <h1 className="px-app py-2 title">Programs</h1>
      </header>

      <main className="px-app py-4 flex flex-row gap-4 flex-1">
        <div className="flex flex-col w-72 gap-2">
          <Program name="Bachelor of Science (BSc) in Actuarial Science - Honours" />
          <Program name="Bachelor of Science (BSc) in Biomechanics" />
        </div>
        <div className="bg-white rounded-xl p-6 flex-1">
          <div className="font-serif">Bachelor of Science (BSc) in Biomechanics</div>
        </div>
      </main>
    </>
  )
}

interface ProgramProps {
  name: string
}

const Program = ({ name }: ProgramProps) => {
  return (
    <Button variant="outline" className="text-left">
      {name}
    </Button>
  )
}

export default Programs
export { Programs }