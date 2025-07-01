-- CreateTable
CREATE TABLE "system_azure_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "deployment_name" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "api_version" TEXT NOT NULL DEFAULT '2024-04-01-preview',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_tokens" INTEGER,
    "temperature" DOUBLE PRECISION DEFAULT 0.7,
    "rate_limit_rpm" INTEGER,
    "rate_limit_tpd" INTEGER,
    "last_health_check" TIMESTAMP(3),
    "health_status" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_azure_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_azure_configs_name_key" ON "system_azure_configs"("name");
