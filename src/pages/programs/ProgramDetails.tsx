import { CatalogProgram } from './types'
import { Accordion } from 'flowbite-react'

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
      <div className="py-4">
        {
          programRequirements.rules.map((rule: any, index: number) => (
            <>
              <div className="text-lg font-semibold">{rule.name}</div>
              {rule.credits && <div className="text-sm text-on-surface-low">Earn at least {rule.credits} credits: </div>}
              <Accordion>
                {
                  rule.value.values.map((value: any, index_outer: number) => value.values.map((rule: any, index: number) => (
                    <Accordion.Panel key={`${index_outer}-${index}`}>
                      <Accordion.Title>{rule.name}</Accordion.Title>
                      <Accordion.Content>
                        {rule.structure && rule.structure.condition}
                        {rule.structure && rule.structure.rules.map((srule: any, index: number) => (
                          <div key={index}>
                            <div>{srule.value.subject_code} {srule.value.course_number}</div>
                            <div>{srule.value.long_name}</div>
                          </div>
                        ))}
                      </Accordion.Content>
                    </Accordion.Panel>
                  )))
                }
              </Accordion>
            </>
          ))
        }
      </div>
    </>
  )
}

export default ProgramDetails