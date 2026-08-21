import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.correctiveAction.deleteMany();
  await prisma.report.deleteMany();
  await prisma.employee.deleteMany();

  const ahmad = await prisma.employee.upsert({
    where: { pinCode: "1001" },
    update: {
      name: "Ahmad Rahman",
      position: "Safety Officer",
      department: "HSE",
      qrCodeData: "EQHSE-EMP-0001",
      certifications: "NEBOSH IGC,First Aid & CPR",
      role: "SUPERVISOR",
      status: "ACTIVE",
    },
    create: {
      name: "Ahmad Rahman",
      position: "Safety Officer",
      department: "HSE",
      pinCode: "1001",
      qrCodeData: "EQHSE-EMP-0001",
      certifications: "NEBOSH IGC,First Aid & CPR",
      role: "SUPERVISOR",
      status: "ACTIVE",
    },
  });

  const maria = await prisma.employee.upsert({
    where: { pinCode: "1002" },
    update: {
      name: "Maria Santos",
      position: "Production Supervisor",
      department: "Production",
      qrCodeData: "EQHSE-EMP-0002",
      certifications: "ISO 45001 Lead Auditor,Confined Space Entry",
      role: "INSPECTOR",
      status: "ACTIVE",
    },
    create: {
      name: "Maria Santos",
      position: "Production Supervisor",
      department: "Production",
      pinCode: "1002",
      qrCodeData: "EQHSE-EMP-0002",
      certifications: "ISO 45001 Lead Auditor,Confined Space Entry",
      role: "INSPECTOR",
      status: "ACTIVE",
    },
  });

  const david = await prisma.employee.upsert({
    where: { pinCode: "1003" },
    update: {
      name: "David Chen",
      position: "Maintenance Technician",
      department: "Maintenance",
      qrCodeData: "EQHSE-EMP-0003",
      certifications: "Working at Height,LOTO",
      role: "WORKER",
      status: "ON_LEAVE",
    },
    create: {
      name: "David Chen",
      position: "Maintenance Technician",
      department: "Maintenance",
      pinCode: "1003",
      qrCodeData: "EQHSE-EMP-0003",
      certifications: "Working at Height,LOTO",
      role: "WORKER",
      status: "ON_LEAVE",
    },
  });

  await prisma.report.createMany({
    data: [
      {
        title: "Daily HSE Walkthrough - Morning Shift",
        type: "DAILY",
        content:
          "Conducted daily walkthrough of the production floor. Housekeeping is in good condition, all emergency exits clear, PPE compliance at 98%.",
        status: "APPROVED",
        approvedHash: "0x7f4a9c2b1e8d3f6a",
        createdById: ahmad.id,
      },
      {
        title: "Daily Safety Inspection - Warehouse Zone",
        type: "DAILY",
        content:
          "Inspected forklift charging station and racking. Found one minor oil leak near bay 4; corrective action raised.",
        status: "SUBMITTED",
        createdById: maria.id,
      },
    ],
  });

  await prisma.report.create({
    data: {
      title: "Hot Work Permit - Welding Bay 4",
      type: "PERMIT",
      content:
        "Welding of racking supports in warehouse Bay 4. Fire watch required for the full duration of the works.",
      location: "Warehouse Zone - Bay 4",
      status: "APPROVED",
      approvedHash: "0x4c9e1d8a2f6b3c7d",
      createdById: ahmad.id,
      approvedById: maria.id,
      authorizedWorkers: {
        connect: [{ id: ahmad.id }, { id: david.id }],
      },
    },
  });

  const incident = await prisma.report.create({
    data: {
      title: "Minor Oil Spill - Warehouse Bay 4",
      type: "INCIDENT",
      content:
        "Discovered oil leak from forklift at charging station. Approximately 1L of hydraulic oil on the floor near bay 4.",
      location: "Warehouse Zone - Bay 4",
      severity: "MEDIUM",
      immediateActions:
        "Cordoned off the area, applied absorbent pads, raised work request for repair.",
      status: "APPROVED",
      approvedHash: "0x2e6b9d1c4f8a3e7b",
      createdById: david.id,
      approvedById: ahmad.id,
    },
  });

  await prisma.correctiveAction.create({
    data: {
      title: "Fix oil leak at forklift charging station",
      description:
        "Contain and repair the oil leak near bay 4, then re-inspect the floor for slip hazards.",
      status: "OPEN",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedToId: david.id,
      reportId: incident.id,
    },
  });

  console.log(
    "Seeded 3 employees, 2 daily reports, 1 work permit, 1 incident and 1 corrective action."
  );
}

main()
  .catch((e) => {
    console.dir(e, { depth: null });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });