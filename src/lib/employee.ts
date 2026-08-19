export type SafeEmployee = {
  id: string;
  name: string;
  position: string;
  department: string;
  role: string;
  qrCodeData: string;
  certifications: string[];
  status: string;
};

export function parseCertifications(value: string): string[] {
  return value
    .split(",")
    .map((cert) => cert.trim())
    .filter(Boolean);
}

export function toSafeEmployee(employee: {
  id: string;
  name: string;
  position: string;
  department: string;
  role: string;
  qrCodeData: string;
  certifications: string;
  status: string;
}): SafeEmployee {
  return {
    id: employee.id,
    name: employee.name,
    position: employee.position,
    department: employee.department,
    role: employee.role,
    qrCodeData: employee.qrCodeData,
    certifications: parseCertifications(employee.certifications),
    status: employee.status,
  };
}