CREATE TABLE "InterestNotificationRead" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "serviceId" TEXT NOT NULL,
 "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "InterestNotificationRead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InterestNotificationRead_userId_serviceId_key" ON "InterestNotificationRead"("userId","serviceId");
CREATE INDEX "InterestNotificationRead_serviceId_idx" ON "InterestNotificationRead"("serviceId");
ALTER TABLE "InterestNotificationRead" ADD CONSTRAINT "InterestNotificationRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterestNotificationRead" ADD CONSTRAINT "InterestNotificationRead_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
