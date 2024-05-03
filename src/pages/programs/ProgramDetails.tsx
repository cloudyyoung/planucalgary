import { CatalogProgram } from './types'
import { Accordion } from 'flowbite-react'

interface ProgramDetailsProps {
  programData: CatalogProgram
}

const ProgramDetails = ({
  programData
}: ProgramDetailsProps) => {
  return (
    <>
      {
        programData.requisites.map((requisite, index) => (
          <div key={index} className="py-4">
            <div className="font-bold font-serif mb-2">{requisite.name}</div>
            <Accordion>
              {
                requisite.rules.map((rule: any, index: number) => (
                  <Accordion.Panel key={index}>
                    <Accordion.Title>{rule.name}</Accordion.Title>
                    <Accordion.Content>
                      <div dangerouslySetInnerHTML={{ __html: rule.description }} />
                      {rule.condition}
                      {rule.value.values.map((value: any, index: number) => (
                        <>
                          {/* <div key={index}>{value.logic}</div> */}
                          {
                            value.values.map((value: any, index: number) => (
                            <div key={index}>{value.name}</div>
                          ))
                          }
                        </>
                      ))}
                      <div dangerouslySetInnerHTML={{ __html: rule.notes }} />
                    </Accordion.Content>
                  </Accordion.Panel>
                ))
              }
            </Accordion>
          </div>
        ))
      }
    </>
  )
}

export default ProgramDetails