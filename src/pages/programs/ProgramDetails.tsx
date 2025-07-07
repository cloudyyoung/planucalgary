import { CatalogProgram } from './types'
import { Accordion, AccordionContent } from "@/components/ui/accordion"

interface ProgramDetailsProps {
  programData: CatalogProgram
}

const ProgramDetails = ({
  programData
}: ProgramDetailsProps) => {
  const programRequirements = programData.requisites.find((requisite) => requisite.name === 'Program Requirements')
  console.log(programRequirements.rules)

  return (
    <>
      <div className="py-4 flex flex-col gap-6">
        {
          programRequirements.rules.map((rule: any, index: number) => (
            <div key={index}>
              <div className="text-lg font-semibold">{rule.name}</div>
              <p>{rule.credits && <div className="text-sm text-on-surface-low">Earn at least {rule.credits} credits: </div>}</p>
              <p>{rule.value.condition}</p>
              <Accordion type="multiple">
                {
                  rule.value.values.map((value: any, index_outer: number) => value.values.map((rule: any, index: number) => (
                    <AccordionContent key={`${index_outer}-${index}`}>
                      <div>{rule.name}</div>
                      <div>
                        <p>ID: {rule.id}</p>
                        <p>TYPE: {rule.type}</p>
                        {rule.structure && rule.structure.rules.map((srule: any, index: number) => (
                          <div key={index}>
                            <div>{srule.value.subject_code} {srule.value.course_number}</div>
                            <div>{srule.value.long_name}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  )))
                }
              </Accordion>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default ProgramDetails