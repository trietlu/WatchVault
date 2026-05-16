export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface FileRecord {
  id: number;
  url: string;
  type: string;
  storageProvider?: string;
  storageKey?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  checksumSha256?: string | null;
  visibility?: string;
  createdAt?: string;
}

export interface WatchEvent {
  id: number;
  eventUid?: string;
  eventType: string;
  payloadJson: string;
  payloadHash: string;
  documentHash?: string | null;
  uriHash?: string | null;
  schemaVersion?: number;
  anchorStatus?: string;
  anchorError?: string | null;
  chainId?: number | null;
  contractAddress?: string | null;
  txHash?: string | null;
  blockNumber?: number | null;
  logIndex?: number | null;
  anchoredAt?: string | null;
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
  eventUid?: string;
  eventType: string;
  payloadHash: string;
  documentHash?: string | null;
  uriHash?: string | null;
  schemaVersion?: number;
  anchorStatus?: string;
  chainId?: number | null;
  contractAddress?: string | null;
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
