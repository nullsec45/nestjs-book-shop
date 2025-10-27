-- CreateTable
CREATE TABLE "media" (
    "id" VARCHAR(36) NOT NULL,
    "parent_id" UUID NOT NULL,
    "collection_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(20) NOT NULL,
    "size" INTEGER NOT NULL,
    "disk" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);
