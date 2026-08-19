import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 180, margin: 1 });
}

export function verifyUrl(baseUrl: string, approvedHash: string): string {
  return `${baseUrl.replace(/\/$/, "")}/verify/${approvedHash}`;
}