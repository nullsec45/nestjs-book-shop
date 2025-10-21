/*
  Warnings:

  - You are about to drop the column `bookId` on the `carts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."carts" DROP CONSTRAINT "carts_bookId_fkey";

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "bookId";
