-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "invalidated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "bridge_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "device_info" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bridge_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bridge_tokens_token_key" ON "bridge_tokens"("token");

-- CreateIndex
CREATE INDEX "bridge_tokens_expires_at_idx" ON "bridge_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "bridge_tokens" ADD CONSTRAINT "bridge_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
