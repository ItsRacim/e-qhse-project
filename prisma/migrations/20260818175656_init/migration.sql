-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "certifications" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "location" TEXT,
    "severity" TEXT,
    "immediateActions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    CONSTRAINT "Report_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "reportId" TEXT,
    CONSTRAINT "CorrectiveAction_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CorrectiveAction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermitWorkers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermitWorkers_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermitWorkers_B_fkey" FOREIGN KEY ("B") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_pinCode_key" ON "Employee"("pinCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_qrCodeData_key" ON "Employee"("qrCodeData");

-- CreateIndex
CREATE UNIQUE INDEX "Report_approvedHash_key" ON "Report"("approvedHash");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "CorrectiveAction_status_idx" ON "CorrectiveAction"("status");

-- CreateIndex
CREATE INDEX "CorrectiveAction_assignedTo_idx" ON "CorrectiveAction"("assignedTo");

-- CreateIndex
CREATE UNIQUE INDEX "_PermitWorkers_AB_unique" ON "_PermitWorkers"("A", "B");

-- CreateIndex
CREATE INDEX "_PermitWorkers_B_index" ON "_PermitWorkers"("B");
