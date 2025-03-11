import { useState } from "react"
import { TextInput } from "flowbite-react"

import { useCourses } from "src/hooks/useCourses"

export const Courses = () => {
  const [keywords, setKeywords] = useState('')

  const { courses, total } = useCourses({
    keywords,
  })

  return (
    <>
      <header>
        <h1 className="px-app py-2 title">Courses</h1>
      </header>

      <main className='px-app py-4'>
        <TextInput sizing="lg" placeholder="Search courses" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

        {courses.map((course) => (
          <div key={course.id} className="border-b border-gray-200 py-2">
            <div>{course.subject_code} {course.course_number}</div>
            <h2>{course.long_name}</h2>
          </div>
        ))}
      </main>
    </>
  )
}
