import { useState } from "react"
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/solid"

import { Course, useCourses } from "@/hooks/useCourses"
import { Button, ButtonProps } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRightIcon } from "lucide-react"

export const Courses = () => {
  const [keywords, setKeywords] = useState('')
  const [pagination, setPagination] = useState({ offset: 0, limit: 100 })

  const { data, isLoading } = useCourses({
    keywords,
    offset: pagination.offset,
    limit: pagination.limit,
  })

  const prevPage = () => setPagination((prev) => ({ ...prev, offset: prev.offset - prev.limit }))
  const nextPage = () => setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))

  return (
    <>
      <main className='px-4 py-2 space-y-2'>
        <div className="sticky top-0 py-4 bg-background">
          <Input className="w-full h-11" placeholder="Search courses by keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

          <div className="flex flex-row gap-1 mt-2">
            <FilterChip>Undergraduate</FilterChip>
            <FilterChip>Graduate</FilterChip>
            <FilterChip>100+</FilterChip>
            <FilterChip>200+</FilterChip>
            <FilterChip>300+</FilterChip>
            <FilterChip>400+</FilterChip>
            <FilterChip>500+</FilterChip>
            <FilterChip>600+</FilterChip>
            <FilterChip>700+</FilterChip>
          </div>
        </div>

        <div className="flex flex-col w-full divide-y">
          {isLoading && (
            <>
              {Array.from({ length: 10 }).map((_, index) => <CourseRowButton key={index} />)}
              <div className="pointer-events-none -mt-48 w-full h-48 z-30 bg-gradient-to-t from-white to-transparent border-none"></div>
            </>
          )}
          {data?.items.map((course: any) => (
            <HoverCard>
              <HoverCardTrigger>
                <CourseRowButton course={course} />
              </HoverCardTrigger>
              <HoverCardContent className="l-0 w-[80vw] md:w-[30rem]" align="start" alignOffset={80}>
                <div className="space-y-1">
                  <Badge variant="default" className="font-bold font-mono rounded-md gap-1">
                    <span>{course.subject_code}</span>
                    <span>{course.course_number}</span>
                  </Badge>
                  <h4 className="text-sm font-semibold">{course.long_name}</h4>
                  <div className="text-muted-foreground text-xs">
                    {course.description}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

        <div className="flex justify-center items-center sticky bottom-0">
          <div className="flex flex-row gap-2 py-4">
            <Button variant="outline" size="icon" disabled={data?.offset === 0} onClick={prevPage}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" disabled={!data?.has_more} onClick={nextPage}>
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}

const FilterChip = ({ children, ...props }: ButtonProps) => {
  return (
    <Button className="rounded-full text-xs h-6" variant="secondary" {...props}>{children}</Button>
  )
}

const CourseRowButton = ({ course }: { course?: Course }) => {
  return (
    <Button variant="link" className="flex flex-row px-0 h-12 justify-start items-center w-full">
      {
        course
          ? <Button variant="secondary" className="h-6 flex flex-row mr-4"><PlusIcon className="w-5 h-5" /> </Button>
          : <Skeleton className="w-12 h-6 mr-4" />
      }

      {
        course
          ? <>
            <Badge variant="outline" className="font-bold font-mono rounded-md gap-1">
              <span>{course.subject_code}</span>
              <span>{course.course_number}</span>
            </Badge>
            <p className="font-bold pt-0.5 truncate">{course.long_name}</p>
          </>
          : <Skeleton className="w-full h-6" />
      }
    </Button>
  )
}