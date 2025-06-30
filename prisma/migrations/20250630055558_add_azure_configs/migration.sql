-- CreateTable
CREATE TABLE "azure_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "api_version" TEXT NOT NULL,
    "deployment_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "rate_limit_rpm" INTEGER NOT NULL DEFAULT 60,
    "rate_limit_tpd" INTEGER NOT NULL DEFAULT 100000,
    "health_status" TEXT NOT NULL DEFAULT 'unknown',
    "last_health_check" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "azure_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "azure_configs_name_key" ON "azure_configs"("name");
