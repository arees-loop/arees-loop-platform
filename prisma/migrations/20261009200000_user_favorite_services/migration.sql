CREATE TABLE "UserFavoriteService" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "serviceId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "UserFavoriteService_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserFavoriteService_userId_serviceId_key" ON "UserFavoriteService"("userId","serviceId");
CREATE INDEX "UserFavoriteService_serviceId_idx" ON "UserFavoriteService"("serviceId");
ALTER TABLE "UserFavoriteService" ADD CONSTRAINT "UserFavoriteService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserFavoriteService" ADD CONSTRAINT "UserFavoriteService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
