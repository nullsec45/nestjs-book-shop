-- CreateTable
CREATE TABLE "voucher_discounts" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "discount" INTEGER NOT NULL,
    "upper_limit" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "voucher_discounts_pkey" PRIMARY KEY ("id")
);
