/*
  Warnings:

  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(200)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.
  - Made the column `updated_at` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "books" ALTER COLUMN "isbn" SET DATA TYPE TEXT,
ALTER COLUMN "pages" DROP NOT NULL;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "updated_at" SET NOT NULL;
