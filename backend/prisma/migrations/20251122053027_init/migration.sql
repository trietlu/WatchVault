-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Watch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER NOT NULL,
    "serialNumberHash" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Watch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatchEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "watchId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchEvent_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "watchId" INTEGER,
    "eventId" INTEGER,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileRecord_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FileRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "WatchEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_serialNumberHash_key" ON "Watch"("serialNumberHash");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_publicId_key" ON "Watch"("publicId");
