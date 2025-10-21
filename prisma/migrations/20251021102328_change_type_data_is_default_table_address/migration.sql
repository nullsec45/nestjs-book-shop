/*
  Warnings:

  - The `is_default` column on the `addresses` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "is_default",
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;
