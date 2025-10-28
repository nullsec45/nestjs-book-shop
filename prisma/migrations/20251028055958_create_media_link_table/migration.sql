/*
  Warnings:

  - You are about to drop the column `parent_id` on the `media` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ParentType" AS ENUM ('BOOK', 'AUTHOR', 'USER');

-- CreateEnum
CREATE TYPE "MediaRelation" AS ENUM ('COVER', 'GALLERY', 'THUMBNAIL', 'ATTACHMENT', 'PROFILE');

-- AlterTable
ALTER TABLE "media" DROP COLUMN "parent_id";

-- CreateTable
CREATE TABLE "media_links" (
    "id" VARCHAR(36) NOT NULL,
    "media_id" VARCHAR(36) NOT NULL,
    "parent_id" UUID NOT NULL,
    "parent_type" "ParentType" NOT NULL,
    "relation" "MediaRelation" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_links_parent_id_parent_type_relation_idx" ON "media_links"("parent_id", "parent_type", "relation");

-- CreateIndex
CREATE UNIQUE INDEX "media_links_parent_id_parent_type_relation_key" ON "media_links"("parent_id", "parent_type", "relation");

-- AddForeignKey
ALTER TABLE "media_links" ADD CONSTRAINT "media_links_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
