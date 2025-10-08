-- CreateTable
CREATE TABLE "categories" (
    "id"   UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(220) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NULL,
    "updated_at" TIMESTAMPTZ NULL DEFAULT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
