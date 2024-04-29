import { Accordion } from "flowbite-react";
import { AcademicCapIcon, ArrowRightCircleIcon, PlusIcon } from "@heroicons/react/24/solid"
import { Button } from "@components"

const Programs = () => {
  return (
    <>
      <main className="px-app py-4 pt-0 flex flex-row gap-4 flex-1">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <header className="bg-inherit">
              <h1 className="title pt-2">Programs</h1>
            </header>
            <div className="flex flex-col w-72 gap-1">
              <Program displayName="Bachelor of Science (BSc) in Actuarial Science - Honours" type="ACP" isSelected />
              <Program displayName="Bachelor of Science (BSc) in Biomechanics" type="ACP" />
              <Program displayName="Minor: Software Engineering" type="MIN" />
              <Program displayName="Minor: Data Science" type="MIN" />
              <Program displayName="Embedded Certificate: Creative Writing" type="EMC" />
            </div>
          </div>
          <div>
            <Button variant="filled">
              <PlusIcon className="w-5 mr-2 flex-none" />
              Add program
            </Button>
          </div>
        </div>
        <div className="bg-surface rounded-2xl px-6 flex flex-1 overflow-y-auto flex-wrap text-on-surface leading-8">
          <div className="mx-auto max-w-7xl flex-1">
            <div className="font-serif text-5xl py-24 text-primary">Bachelor of Science (BSc) in Biomechanics</div>
            <div className="py-4">
              <Accordion collapseAll>
                <Accordion.Panel>
                  <Accordion.Title>Overview</Accordion.Title>
                  <Accordion.Content>
                    <h3><strong>Contact Information </strong></h3><p>Website: <a href="https://arts.ucalgary.ca/anthropology-archaeology" rel="noopener noreferrer nofollow"><strong><u>arts.ucalgary.ca/anthropology-archaeology</u></strong></a>.</p><h3><strong>For Program Advice </strong></h3><p>Students should consult an undergraduate program advisor in the Arts Students’ Centre for information and advice on their overall program requirements. Advising contact information can be found online: <a href="https://arts.ucalgary.ca/current-students/undergraduate/academic-advising" rel="noopener noreferrer nofollow"><strong><u>arts.ucalgary.ca/advising</u></strong></a>.</p><h3><strong>Introduction</strong></h3><p>The Department of Anthropology and Archaeology offers instruction in African Studies, Archaeology, Biological Anthropology, Social and Cultural Anthropology, and Global Development Studies.</p><p>The Department of Anthropology and Archaeology takes a comparative, cross-cultural, and cross-species perspective to understand human beings. Anthropologists and archaeologists consider how humans evolved, how they shape—and are shaped by—their culture, and seek to understand the records they have left behind. Students are encouraged to take one of the field schools to gain hands-on experience.</p><p>Students wishing to emphasize the social sciences and humanities in their Anthropology or Archaeology program should register for the BA degree. Those wishing to emphasize the natural and biological sciences should register for the BSc degree. It is recommended that first-year students in any of these programs register in&nbsp;Anthropology 201,&nbsp;203, and&nbsp;Archaeology 201.</p><p>The BA in Anthropology focuses on social and cultural anthropology and adopts a cross-cultural perspective. Courses seek to foster an understanding and appreciation of the wide variety of cultures in the world and provide critical insights into how people actually live and how they negotiate the challenges created by globalization.</p>
                  </Accordion.Content>
                </Accordion.Panel>
              </Accordion>
            </div>

          </div>
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
    <Button variant={is_selected ? "tonal" : "text"} className="justify-start text-left px-0 py-2">
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