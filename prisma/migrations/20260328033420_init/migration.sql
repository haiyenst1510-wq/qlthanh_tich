-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "TaskResult" AS ENUM ('GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "PartyRating" AS ENUM ('GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "CompetitionTitleType" AS ENUM ('CHIEN_SI_THI_DUA', 'GV_GIOI', 'GV_CN_GIOI');

-- CreateEnum
CREATE TYPE "TitleLevel" AS ENUM ('SCHOOL', 'DISTRICT', 'CITY');

-- CreateEnum
CREATE TYPE "AchievementMethod" AS ENUM ('METHOD_1', 'METHOD_2');

-- CreateEnum
CREATE TYPE "SKKNLevel" AS ENUM ('SCHOOL', 'DISTRICT', 'CITY');

-- CreateEnum
CREATE TYPE "SKKNStatus" AS ENUM ('UNUSED', 'USED');

-- CreateEnum
CREATE TYPE "AwardType" AS ENUM ('CERTIFICATE', 'COMMENDATION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "department" TEXT NOT NULL,
    "teachingSince" INTEGER NOT NULL,
    "isPartyMember" BOOLEAN NOT NULL DEFAULT false,
    "partyJoinDate" TIMESTAMP(3),

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yearly_records" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "taskResult" "TaskResult" NOT NULL,
    "partyRating" "PartyRating",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yearly_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_titles" (
    "id" TEXT NOT NULL,
    "yearlyRecordId" TEXT NOT NULL,
    "type" "CompetitionTitleType" NOT NULL,
    "level" "TitleLevel",
    "achievementMethod" "AchievementMethod",

    CONSTRAINT "competition_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skkns" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" "SKKNLevel" NOT NULL,
    "rating" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "status" "SKKNStatus" NOT NULL DEFAULT 'UNUSED',
    "usedFor" TEXT,
    "usedYear" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skkns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "awards" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "type" "AwardType" NOT NULL,
    "issuingLevel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "award_skkns" (
    "id" TEXT NOT NULL,
    "awardId" TEXT NOT NULL,
    "skknId" TEXT NOT NULL,

    CONSTRAINT "award_skkns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eligibility_rules" (
    "id" TEXT NOT NULL,
    "targetTitle" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eligibility_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE INDEX "teacher_profiles_userId_idx" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE INDEX "yearly_records_teacherId_idx" ON "yearly_records"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "yearly_records_teacherId_academicYear_key" ON "yearly_records"("teacherId", "academicYear");

-- CreateIndex
CREATE INDEX "competition_titles_yearlyRecordId_idx" ON "competition_titles"("yearlyRecordId");

-- CreateIndex
CREATE INDEX "skkns_teacherId_idx" ON "skkns"("teacherId");

-- CreateIndex
CREATE INDEX "skkns_status_idx" ON "skkns"("status");

-- CreateIndex
CREATE INDEX "skkns_teacherId_status_idx" ON "skkns"("teacherId", "status");

-- CreateIndex
CREATE INDEX "awards_teacherId_idx" ON "awards"("teacherId");

-- CreateIndex
CREATE INDEX "awards_year_idx" ON "awards"("year");

-- CreateIndex
CREATE INDEX "award_skkns_awardId_idx" ON "award_skkns"("awardId");

-- CreateIndex
CREATE INDEX "award_skkns_skknId_idx" ON "award_skkns"("skknId");

-- CreateIndex
CREATE UNIQUE INDEX "award_skkns_awardId_skknId_key" ON "award_skkns"("awardId", "skknId");

-- CreateIndex
CREATE INDEX "eligibility_rules_targetTitle_idx" ON "eligibility_rules"("targetTitle");

-- CreateIndex
CREATE INDEX "eligibility_rules_isActive_idx" ON "eligibility_rules"("isActive");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yearly_records" ADD CONSTRAINT "yearly_records_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_titles" ADD CONSTRAINT "competition_titles_yearlyRecordId_fkey" FOREIGN KEY ("yearlyRecordId") REFERENCES "yearly_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skkns" ADD CONSTRAINT "skkns_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "award_skkns" ADD CONSTRAINT "award_skkns_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "awards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "award_skkns" ADD CONSTRAINT "award_skkns_skknId_fkey" FOREIGN KEY ("skknId") REFERENCES "skkns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
