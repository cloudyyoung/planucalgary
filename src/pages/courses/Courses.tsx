import { useState } from "react"
import { List, TextInput } from "flowbite-react"

import { useCourses } from "src/hooks/useCourses"
import { Button } from "src/components"
import { PlusIcon } from "@heroicons/react/24/solid"
import { FilterChip } from "src/components/button/FilterChip"

export const Courses = () => {
  const [keywords, setKeywords] = useState('')

  const { courses, total } = useCourses({
    keywords,
  })

  return (
    <>
      <header>
        <h1 className="px-app title">Courses</h1>
      </header>

      <main className='px-app py-4 flex flex-col flex-nowrap flex-1 h-full gap-3 overflow-x-auto'>
        <TextInput sizing="lg" placeholder="Search courses by keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

        {/*
        <div className="flex flex-row gap-1">
          <FilterChip>Undergraduate</FilterChip>
          <FilterChip>Graduate</FilterChip>
          <FilterChip>Archived</FilterChip>
        </div> */}

        <div className="overflow-y-auto rounded-3xl bg-surface">
          <List unstyled>
            {courses.map((course: any) => (
              <List.Item key={course.id} className="text-on-surface p-4 cursor-pointer relative after:content-[''] after:pointer-events-none after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 after:bg-none after:transition-colors hover:after:bg-on-surface/8">
                <div className="flex flex-row gap-4">
                  <div><Button variant="tonal" priority="secondary">
                    <PlusIcon className="w-5 h-5" />
                  </Button></div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-row items-center gap-2">
                      <div className="font-bold font-mono text-sm text-secondary flex flex-row gap-0.5 border border-outline-variant rounded-md px-1.5 pt-0.5 w-fit">
                        <span>{course.subject_code}</span>
                        <span>{course.course_number}</span>
                      </div>
                      <div className="font-bold pt-0.5">{course.long_name}</div>
                    </div>
                    <div className="text-sm text-on-surface-variant">{course.description}</div>
                  </div>
                </div>

              </List.Item>
            ))}
          </List>
        </div>
      </main>
    </>
  )
}
