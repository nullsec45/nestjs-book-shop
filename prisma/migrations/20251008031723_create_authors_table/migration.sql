-- CreateTable
CREATE TABLE "authors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(220) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "bio"  TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NULL DEFAULT NULL,
    "deleted_at" TIMESTAMPTZ NULL DEFAULT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");
