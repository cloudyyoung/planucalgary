import { useState } from "react"
import { PlusIcon } from "@heroicons/react/24/solid"

import { useCourses } from "@/hooks/useCourses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export const Courses = () => {
  const [keywords, setKeywords] = useState('')

  const { courses, total } = useCourses({
    keywords,
  })

  return (
    <>
      <main className='px-4 py-4 space-y-2'>
        <Input className="w-full" placeholder="Search courses by keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

        {/*
        <div className="flex flex-row gap-1">
          <FilterChip>Undergraduate</FilterChip>
          <FilterChip>Graduate</FilterChip>
          <FilterChip>Archived</FilterChip>
        </div> */}

        <div className="">
          <div className="flex flex-col w-full divide-y">
            {courses.map((course: any) => (
              <HoverCard>
                <HoverCardTrigger>
                  <Button variant="link" key={course.id} value={course.id} className="px-0 h-12">
                    <Button variant="secondary" className="h-6 flex flex-row mr-4">
                      <PlusIcon className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-row items-center w-full gap-2">
                      <Badge variant="outline" className="font-bold font-mono rounded-md px-1.5 pt-0.5 w-fit">
                        <span>{course.subject_code}</span>
                        <span>{course.course_number}</span>
                      </Badge>

                      <div className="font-bold pt-0.5">{course.long_name}</div>
                    </div>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="text-sm">{course.description}</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
