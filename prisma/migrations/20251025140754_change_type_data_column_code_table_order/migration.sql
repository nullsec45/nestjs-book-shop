/*
  Warnings:

  - You are about to alter the column `code` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.

*/
-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "code" SET DATA TYPE VARCHAR(200);
