-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "planucalgary";

-- CreateEnum
CREATE TYPE "catalog"."CourseComponent" AS ENUM ('LAB', 'LECTURE', 'SECTION', 'SEMINAR', 'SUPERVISED_STUDY', 'TUTORIAL');

-- CreateEnum
CREATE TYPE "catalog"."Career" AS ENUM ('UNDERGRADUATE_PROGRAM', 'GRADUATE_PROGRAM', 'MEDICINE_PROGRAM');

-- CreateEnum
CREATE TYPE "catalog"."RequisiteType" AS ENUM ('PREREQ', 'COREQ', 'ANTIREQ');

-- CreateEnum
CREATE TYPE "catalog"."GradeMode" AS ENUM ('CDF', 'CNC', 'CRF', 'ELG', 'GRD', 'MTG');

-- CreateEnum
CREATE TYPE "catalog"."TermName" AS ENUM ('WINTER', 'SPRING', 'SUMMER', 'FALL');

-- CreateTable
CREATE TABLE "catalog"."courses" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "course_number" TEXT NOT NULL,
    "subject_code" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL,
    "units" INTEGER,
    "aka" TEXT,
    "prereq" TEXT,
    "prereq_json" JSONB,
    "coreq" TEXT,
    "coreq_json" JSONB,
    "antireq" TEXT,
    "antireq_json" JSONB,
    "is_active" BOOLEAN NOT NULL,
    "is_multi_term" BOOLEAN NOT NULL,
    "is_nogpa" BOOLEAN NOT NULL,
    "is_repeatable" BOOLEAN NOT NULL,
    "components" "catalog"."CourseComponent"[],
    "course_group_id" TEXT NOT NULL,
    "coursedog_id" TEXT NOT NULL,
    "course_created_at" TIMESTAMP(3) NOT NULL,
    "course_effective_start_date" TIMESTAMP(3) NOT NULL,
    "course_last_updated_at" TIMESTAMP(3) NOT NULL,
    "career" "catalog"."Career" NOT NULL,
    "grade_mode" "catalog"."GradeMode" NOT NULL,
    "search_vector" tsvector,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."courses_topics" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "description" TEXT,
    "is_repeatable" BOOLEAN NOT NULL,
    "units" INTEGER,
    "link" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "courses_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."requisites_jsons" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requisite_type" "catalog"."RequisiteType" NOT NULL,
    "text" TEXT NOT NULL,
    "departments" TEXT[],
    "faculties" TEXT[],
    "json_choices" JSONB[],
    "json" JSONB,

    CONSTRAINT "requisites_jsons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."faculties" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."departments" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."subjects" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."programs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pid" TEXT NOT NULL,
    "coursedog_id" TEXT NOT NULL,
    "program_group_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "degree_designation_code" TEXT,
    "degree_designation_name" TEXT,
    "career" "catalog"."Career" NOT NULL,
    "admission_info" TEXT,
    "general_info" TEXT,
    "transcript_level" INTEGER,
    "transcript_description" TEXT,
    "requisites" JSONB,
    "is_active" BOOLEAN NOT NULL,
    "start_term" JSONB,
    "program_created_at" TIMESTAMP(3) NOT NULL,
    "program_last_updated_at" TIMESTAMP(3) NOT NULL,
    "program_effective_start_date" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "search_vector" tsvector,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planucalgary"."accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."_CourseToDepartment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToDepartment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_CourseToFaculty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToFaculty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_FacultyToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FacultyToProgram_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_DepartmentToFaculty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartmentToFaculty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_DepartmentToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartmentToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "catalog"."_DepartmentToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartmentToProgram_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_cid_key" ON "catalog"."courses"("cid");

-- CreateIndex
CREATE INDEX "course_search_vector_gin" ON "catalog"."courses" USING GIN ("search_vector");

-- CreateIndex
CREATE UNIQUE INDEX "course_topic_number_course_unique" ON "catalog"."courses_topics"("number", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "requisite_components_unique" ON "catalog"."requisites_jsons"("requisite_type", "text", "departments", "faculties");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_key" ON "catalog"."faculties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_code_key" ON "catalog"."faculties"("code");

-- CreateIndex
CREATE INDEX "faculty_code_unique" ON "catalog"."faculties"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "catalog"."departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "catalog"."departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "catalog"."subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_title_key" ON "catalog"."subjects"("title");

-- CreateIndex
CREATE UNIQUE INDEX "subject_code_title_unique" ON "catalog"."subjects"("code", "title");

-- CreateIndex
CREATE UNIQUE INDEX "subject_title_unique" ON "catalog"."subjects"("title");

-- CreateIndex
CREATE UNIQUE INDEX "subject_code_unique" ON "catalog"."subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "programs_pid_key" ON "catalog"."programs"("pid");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "catalog"."programs"("code");

-- CreateIndex
CREATE INDEX "program_search_vector_gin" ON "catalog"."programs" USING GIN ("search_vector");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "planucalgary"."accounts"("email");

-- CreateIndex
CREATE INDEX "_CourseToDepartment_B_index" ON "catalog"."_CourseToDepartment"("B");

-- CreateIndex
CREATE INDEX "_CourseToFaculty_B_index" ON "catalog"."_CourseToFaculty"("B");

-- CreateIndex
CREATE INDEX "_FacultyToProgram_B_index" ON "catalog"."_FacultyToProgram"("B");

-- CreateIndex
CREATE INDEX "_DepartmentToFaculty_B_index" ON "catalog"."_DepartmentToFaculty"("B");

-- CreateIndex
CREATE INDEX "_DepartmentToSubject_B_index" ON "catalog"."_DepartmentToSubject"("B");

-- CreateIndex
CREATE INDEX "_DepartmentToProgram_B_index" ON "catalog"."_DepartmentToProgram"("B");

-- AddForeignKey
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_subject_code_fkey" FOREIGN KEY ("subject_code") REFERENCES "catalog"."subjects"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."courses_topics" ADD CONSTRAINT "courses_topics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToDepartment" ADD CONSTRAINT "_CourseToDepartment_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToDepartment" ADD CONSTRAINT "_CourseToDepartment_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToFaculty" ADD CONSTRAINT "_CourseToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_CourseToFaculty" ADD CONSTRAINT "_CourseToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToProgram" ADD CONSTRAINT "_FacultyToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_FacultyToProgram" ADD CONSTRAINT "_FacultyToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToFaculty" ADD CONSTRAINT "_DepartmentToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToFaculty" ADD CONSTRAINT "_DepartmentToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToSubject" ADD CONSTRAINT "_DepartmentToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToSubject" ADD CONSTRAINT "_DepartmentToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToProgram" ADD CONSTRAINT "_DepartmentToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_DepartmentToProgram" ADD CONSTRAINT "_DepartmentToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateFunction 
-- IMPORTANT: This generates a new default value for the column. This operation is not maintained in the prisma schema file because it is unsupported.
CREATE OR REPLACE FUNCTION catalog.update_course_text_search() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.code, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.subject_code, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.course_number, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.long_name, '')), 'B') || 
        setweight(to_tsvector('english', coalesce(NEW.aka, '')), 'B') || 
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'C') || 
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') || 
        setweight(to_tsvector('english', coalesce(NEW.prereq, '')), 'D') || 
        setweight(to_tsvector('english', coalesce(NEW.antireq, '')), 'D') || 
        setweight(to_tsvector('english', coalesce(NEW.coreq, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_text_search_trigger
BEFORE INSERT OR UPDATE ON "catalog"."courses"
FOR EACH ROW EXECUTE FUNCTION catalog.update_course_text_search();


-- CreateFunction 
-- IMPORTANT: This generates a new default value for the column. This operation is not maintained in the prisma schema file because it is unsupported.
CREATE OR REPLACE FUNCTION catalog.update_program_text_search() RETURNS trigger AS $$
BEGIN   
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.code, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.long_name, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.display_name, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.degree_designation_code, '')), 'B') || 
        setweight(to_tsvector('english', coalesce(NEW.degree_designation_name, '')), 'B') || 
        setweight(to_tsvector('english', coalesce(NEW.general_info, '')), 'C') || 
        setweight(to_tsvector('english', coalesce(NEW.pid, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_text_search_trigger
BEFORE INSERT OR UPDATE ON "catalog"."programs"
FOR EACH ROW EXECUTE FUNCTION catalog.update_program_text_search();
