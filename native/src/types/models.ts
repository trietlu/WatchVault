export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface FileRecord {
  id: number;
  url: string;
  type: string;
  createdAt?: string;
}

export interface WatchEvent {
  id: number;
  eventType: string;
  payloadJson: string;
  payloadHash: string;
  txHash?: string | null;
  blockNumber?: number | null;
  timestamp: string;
  files?: FileRecord[];
}

export interface Watch {
  id: number;
  brand: string;
  model: string;
  serialNumberHash: string;
  publicId: string;
  qrCodeUrl?: string | null;
  createdAt?: string;
  events?: WatchEvent[];
  files?: FileRecord[];
}

export interface PublicPassportEvent {
  eventType: string;
  payloadHash: string;
  txHash?: string | null;
  blockNumber?: number | null;
  timestamp: string;
}

export interface PublicPassport {
  brand: string;
  model: string;
  serialNumberHash: string;
  publicId: string;
  qrCodeUrl?: string | null;
  events: PublicPassportEvent[];
}
