/*
  Warnings:

  - The primary key for the `media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `voucher_discounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `voucher_discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "media" DROP CONSTRAINT "media_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "voucher_discounts" DROP CONSTRAINT "voucher_discounts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "voucher_discounts_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "user_vouchers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "voucher_id" UUID NOT NULL,
    "total" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "user_vouchers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher_discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
