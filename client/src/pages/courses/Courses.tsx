import { useState } from "react"
import { ArrowLeftIcon, PlusIcon, ArrowRightIcon, RepeatIcon, CircleSlash2Icon, SquareStackIcon, Archive } from "lucide-react"

import { Course, useCourses } from "@/hooks/useCourses"
import { Button, ButtonProps } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, BadgeProps } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const Courses = () => {
  const [keywords, setKeywords] = useState('')
  const [pagination, setPagination] = useState({ offset: 0, limit: 100 })
  const [showCourseDetails, setShowCourseDetails] = useState(false)
  const [courseDetails, setCourseDetails] = useState<Course | null>(null)

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
                <CourseRowButton
                  course={course}
                  onClick={() => {
                    setCourseDetails(course)
                    setShowCourseDetails(true)
                  }}
                />
              </HoverCardTrigger>
              <HoverCardContent className="l-0 w-[80vw] md:w-[30rem]" align="start" alignOffset={80}>
                <div className="space-y-1">
                  <CourseCodeBadge course={course} variant="default" />
                  <h4 className="text-sm font-semibold">{course.long_name}</h4>
                  <div className="text-muted-foreground text-xs">{course.description}</div>
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

      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        {
          courseDetails && (
            <DialogContent className="max-w-4xl">
              <DialogHeader className="mt-6 space-y-4">
                <DialogTitle>
                  <CourseCodeBadge course={courseDetails} variant="default" />
                  <h1 className="mt-2">{courseDetails.long_name}</h1>
                </DialogTitle>
                <DialogDescription>
                  {courseDetails.description}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-row gap-2 my-1">
                {!courseDetails.is_active && <Badge variant="secondary"><Archive className="w-3 h-3" /> Archived</Badge>}
                {courseDetails.is_repeatable && <Badge variant="secondary"><RepeatIcon className="w-3 h-3" /> Repeatable</Badge>}
                {courseDetails.is_no_gpa && <Badge variant="secondary"><CircleSlash2Icon className="w-3 h-3" /> No GPA</Badge>}
                {courseDetails.is_multi_term && <Badge variant="secondary"><SquareStackIcon className="w-3 h-3" /> Multiple terms</Badge>}
              </div>
              <div>
                <p>{courseDetails.prereq}</p>
                <p>{courseDetails.antireq}</p>
                <p>{courseDetails.coreq}</p>
              </div>
            </DialogContent>
          )
        }
      </Dialog>
    </>
  )
}

const FilterChip = ({ children, ...props }: ButtonProps) => {
  return (
    <Button className="rounded-full text-xs h-6" variant="secondary" {...props}>{children}</Button>
  )
}

const CourseRowButton = ({ course, onClick }: { course?: Course, onClick?: ButtonProps["onClick"] }) => {
  return (
    <Button variant="link" className="flex flex-row px-0 h-12 justify-start items-center w-full" onClick={onClick}>
      {
        course
          ? <Button variant="secondary" className="h-6 flex flex-row mr-4"><PlusIcon className="w-5 h-5" /> </Button>
          : <Skeleton className="w-12 h-6 mr-4" />
      }
      {
        course
          ? <>
            <CourseCodeBadge course={course} variant="outline" />
            <p className="font-bold pt-0.5 truncate">{course.long_name}</p>
          </>
          : <Skeleton className="w-full h-6" />
      }
    </Button>
  )
}

const CourseCodeBadge = ({ course, variant }: { course: Course, variant: BadgeProps["variant"] }) => {
  return (
    <Badge variant={variant} className="font-bold font-mono rounded-full gap-0.5">
      <span>{course.subject_code}</span>
      <span>{course.course_number}</span>
    </Badge>
  )
}