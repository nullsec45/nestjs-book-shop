/*
  Warnings:

  - You are about to drop the `media_links` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `parent_id` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."media_links" DROP CONSTRAINT "media_links_media_id_fkey";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "parent_id" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."media_links";

-- DropEnum
DROP TYPE "public"."MediaRelation";

-- DropEnum
DROP TYPE "public"."ParentType";
