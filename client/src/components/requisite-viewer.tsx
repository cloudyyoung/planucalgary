import { Requisite, RequisiteRule } from "@planucalgary/shared/prisma/client"

export const RequisiteViewer = ({ requisite }: { requisite?: Requisite & { rules?: RequisiteRule[] } }) => {
  if (!requisite) {
    return <div></div>
  }

  return (
    <div>
      <div className="flex flex-col gap-2 w-full">
        {requisite.rules?.map(rule => (
          <div key={rule.id} className="rounded-lg shadow-md p-2 bg-gray-50">
            <p>{rule.name}</p>
            <p>{rule.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
