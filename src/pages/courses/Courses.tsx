import { useState } from "react"
import { List, TextInput } from "flowbite-react"

import { useCourses } from "src/hooks/useCourses"

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

        <div className="overflow-y-auto rounded-3xl bg-surface-container-lowest">
          <List unstyled>
            {courses.map((course: any) => (
              <List.Item key={course.id} className="text-on-surface p-4 cursor-pointer relative after:content-[''] after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 after:bg-none after:transition-colors hover:after:bg-on-surface/8">
                <div>{course.subject_code} {course.course_number}</div>
                <div>
                  <h2>{course.long_name}</h2>
                  <h2>{course.description}</h2>
                </div>
              </List.Item>
            ))}
          </List>
        </div>
      </main>
    </>
  )
}
