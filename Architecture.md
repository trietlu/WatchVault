# WatchVault Architecture

## Overview

WatchVault is a full-stack web application for creating digital passports for luxury watches with blockchain-verified provenance. The system consists of a Next.js frontend, Node.js/Express backend, SQLite database, and Ethereum smart contract integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js 14)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   API Client │      │
│  │  (App Router)│  │   (React)    │  │   (Axios)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                   (Node.js + Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │  Middleware  │      │
│  │              │  │              │  │  (Auth/Upload)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                                 │
│           ▼                ▼                                 │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Prisma     │  │   Contract   │                        │
│  │   (ORM)      │  │   Client     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌──────────────┐      ┌──────────────────┐
│   SQLite     │      │  Ethereum Node   │
│   Database   │      │  (Hardhat/RPC)   │
└──────────────┘      └──────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Capital One design system)
- **State Management**: Zustand (with persistent storage)
- **HTTP Client**: Axios
- **Authentication**: JWT tokens managed by Zustand store
- **Image Optimization**: Next.js Image component
- **QR Codes**: react-qr-code

### Directory Structure
```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── dashboard/         # Dashboard page
│   ├── watches/           # Watch management pages
│   │   ├── new/          # Create watch
│   │   ├── [id]/         # Watch detail
│   │   └── [id]/add-event/ # Add event
│   ├── p/[publicId]/     # Public passport view
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable React components
│   ├── Header.tsx        # Navigation header
│   └── LoadingSpinner.tsx # Loading indicator
├── stores/                # Zustand state stores
│   ├── useAuthStore.ts   # Authentication state
│   └── useWatchStore.ts  # Watch data state
├── lib/                   # Utilities
│   └── api.ts            # Axios instance with auth interceptor
└── globals.css           # Global styles
```

### Key Design Patterns

#### 1. State Management with Zustand

**Authentication Store** (`useAuthStore.ts`):
```typescript
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}
```

**Features:**
- Centralized authentication state
- Persistent storage (survives page refresh)
- Automatic localStorage synchronization
- Type-safe with TypeScript
- Clean component code (no redundant useState/useEffect)

**Watch Store** (`useWatchStore.ts`):
```typescript
interface WatchState {
    watches: Watch[];
    selectedWatch: Watch | null;
    loading: boolean;
    setWatches: (watches: Watch[]) => void;
    addWatch: (watch: Watch) => void;
    updateWatch: (id: number, watch: Partial<Watch>) => void;
    deleteWatch: (id: number) => void;
}
```

**Benefits:**
- Single source of truth for watch data
- Optimistic updates for better UX
- Reduced API calls with caching
- Easier to test and maintain

#### 2. Authentication Flow
- JWT tokens managed by Zustand auth store
- Axios interceptor automatically adds `Authorization` header
- Protected routes check for token presence
- Google OAuth and Facebook OAuth integration

#### 3. API Communication
```typescript
// Centralized API client (lib/api.ts)
const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: { 'Content-Type': 'application/json' }
});

// Automatic token injection
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```

#### 4. Component Architecture
- **Server Components**: Used for static content (default in App Router)
- **Client Components**: Used for interactive features (`'use client'` directive)
- **Shared Components**: Header, LoadingSpinner for consistency

#### 5. Image Optimization

**Next.js Image Component:**
- Automatic image optimization (WebP/AVIF)
- Lazy loading by default
- Responsive images
- Blur placeholder support
- Priority loading for above-fold images

**Configuration** (`next.config.mjs`):
```javascript
images: {
    remotePatterns: [
        {
            protocol: 'http',
            hostname: 'localhost',
            port: '3001',
            pathname: '/uploads/**',
        },
    ],
}
```

**Usage:**
```tsx
<Image
    src="/logo.png"
    alt="WatchVault"
    width={200}
    height={80}
    className="h-20 w-auto"
    priority  // For above-fold images
/>
```

#### 6. Design System
- **Colors**: Capital One inspired (blue #004879, red #EF4444)
- **Components**: Premium cards with shadows, hover effects
- **Typography**: Inter font family
- **Spacing**: Consistent padding/margin scale

### Frontend Routing (Next.js App Router)

#### File-Based Routing
Next.js 14 uses the App Router with file-based routing. Each folder in `app/` represents a route segment.

**Route Mapping:**
```
app/page.tsx                    → /
app/dashboard/page.tsx          → /dashboard
app/watches/new/page.tsx        → /watches/new
app/watches/[id]/page.tsx       → /watches/:id (dynamic)
app/watches/[id]/add-event/page.tsx → /watches/:id/add-event
app/p/[publicId]/page.tsx       → /p/:publicId (dynamic)
app/(auth)/login/page.tsx       → /login
app/(auth)/register/page.tsx    → /register
```

#### Route Groups
Parentheses `(auth)` create route groups without affecting the URL:
- `app/(auth)/login/page.tsx` → `/login` (not `/auth/login`)
- Used to organize related routes and share layouts

#### Dynamic Routes
Dynamic segments use square brackets `[param]`:

```typescript
// app/watches/[id]/page.tsx
export default function WatchDetailPage({ params }: { params: { id: string } }) {
    const watchId = params.id; // Access dynamic parameter
    // Fetch watch data using watchId
}
```

#### Layouts
- `layout.tsx` wraps all child pages
- Nested layouts inherit from parent layouts
- Root layout (`app/layout.tsx`) wraps entire app

```typescript
// app/layout.tsx - Applied to all pages
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
```

#### Client vs Server Components
- **Default**: Server Components (rendered on server)
- **Client Components**: Add `'use client'` directive for interactivity

```typescript
'use client'; // Makes this a Client Component

import { useState } from 'react';

export default function InteractivePage() {
    const [count, setCount] = useState(0);
    // Can use hooks, event handlers, browser APIs
}
```

#### Navigation
```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Declarative navigation
<Link href="/dashboard">Dashboard</Link>

// Programmatic navigation
const router = useRouter();
router.push('/watches/123');
```

#### Route Protection
Currently implemented client-side:
```typescript
useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
    }
}, []);
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (compiled with tsx)
- **ORM**: Prisma
- **Database**: SQLite (dev.db)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Blockchain**: ethers.js v6
- **Password Hashing**: bcryptjs

### Directory Structure
```
backend/src/
├── controllers/           # Request handlers
│   ├── auth.controller.ts    # Authentication logic
│   └── watch.controller.ts   # Watch CRUD + blockchain
├── middleware/            # Express middleware
│   ├── auth.middleware.ts    # JWT verification
│   └── upload.middleware.ts  # Multer configuration
├── routes/                # Route definitions
│   ├── auth.routes.ts        # /auth endpoints
│   ├── watch.routes.ts       # /watches endpoints
│   ├── public.routes.ts      # /passports endpoints
│   └── file.routes.ts        # /files endpoints
├── config/                # Configuration
│   └── contract.ts           # Smart contract ABI & address
├── prisma/                # Database
│   ├── schema.prisma         # Data model
│   ├── migrations/           # Schema migrations
│   └── dev.db               # SQLite database file
├── uploads/               # File storage
│   └── watches/              # Watch images
├── app.ts                 # Express app setup
└── index.ts              # Server entry point
```

### Data Model

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String?
  googleId     String?  @unique
  facebookId   String?  @unique
  watches      Watch[]
}

model Watch {
  id               Int          @id @default(autoincrement())
  brand            String
  model            String
  serialNumberHash String       @unique  // SHA-256 hash
  publicId         String       @unique  // UUID for public access
  qrCodeUrl        String?
  ownerId          Int
  owner            User         @relation(fields: [ownerId], references: [id])
  events           WatchEvent[]
  files            FileRecord[]
}

model WatchEvent {
  id          Int      @id @default(autoincrement())
  watchId     Int
  eventType   String   // MINT, SERVICE, TRANSFER, AUTH, NOTE
  payloadJson String   // JSON string of event data
  payloadHash String   // SHA-256 hash for blockchain
  txHash      String?  // Ethereum transaction hash
  blockNumber Int?     // Block number when anchored
  timestamp   DateTime @default(now())
  watch       Watch    @relation(fields: [watchId], references: [id])
  files       FileRecord[]
}

model FileRecord {
  id      Int         @id @default(autoincrement())
  url     String      // /uploads/watches/filename.jpg
  type    String      // 'image'
  watchId Int?
  eventId Int?
  watch   Watch?      @relation(fields: [watchId], references: [id])
  event   WatchEvent? @relation(fields: [eventId], references: [id])
}
```

### Key Design Patterns

#### 1. Authentication & Authorization
```typescript
// JWT-based authentication
export const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};
```

#### 2. Serial Number Privacy
- Serial numbers are **never stored in plaintext**
- SHA-256 hash stored in database
- Prevents serial number exposure even if database is compromised

#### 3. Blockchain Integration
```typescript
// Event anchoring workflow
1. Create event in database (status: pending)
2. Call smart contract: recordEvent(watchHash, eventType, payloadHash)
3. Wait for transaction confirmation
4. Update database with txHash and blockNumber
5. Event status: anchored ✅
```

#### 4. File Upload Strategy
- **Storage**: Local filesystem (`uploads/watches/`)
- **Naming**: Timestamp + random number (collision-proof)
- **Validation**: File type (jpeg/png/webp) and size (8MB max)
- **Access**: Served via Express static middleware

#### 5. Error Handling
- Try-catch blocks in all controllers
- Specific error messages for client
- Generic "Internal server error" for unexpected errors
- Console logging for debugging

### Backend Routing (Express)

#### Route Organization
Routes are organized by resource in separate files:

```typescript
// app.ts - Main app setup
import authRoutes from './routes/auth.routes.js';
import watchRoutes from './routes/watch.routes.js';
import publicRoutes from './routes/public.routes.js';

app.use('/auth', authRoutes);        // /auth/*
app.use('/watches', watchRoutes);    // /watches/*
app.use('/passports', publicRoutes); // /passports/*
app.use('/uploads', express.static('uploads')); // Static files
```

#### Route Definition Pattern
```typescript
// routes/watch.routes.ts
import { Router } from 'express';
import { createWatch, getWatches } from '../controllers/watch.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Apply middleware, then controller
router.post('/', authenticateToken, upload.single('image'), createWatch);
router.get('/', authenticateToken, getWatches);
router.get('/:id', authenticateToken, getWatchDetail);

export default router;
```

#### Middleware Chain
Requests flow through middleware in order:

```
Request → CORS → JSON Parser → Route Middleware → Controller → Response
```

**Example flow for `POST /watches`:**
```
1. CORS middleware (app.use(cors()))
2. JSON body parser (app.use(express.json()))
3. Route matched: POST /watches
4. authenticateToken middleware (verify JWT)
5. upload.single('image') middleware (handle file upload)
6. createWatch controller (business logic)
7. Response sent to client
```

#### Authentication Middleware
```typescript
// middleware/auth.middleware.ts
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user; // Attach user to request
        next(); // Continue to next middleware/controller
    });
};
```

#### File Upload Middleware
```typescript
// middleware/upload.middleware.ts
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/watches/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.random();
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
```

#### Controller Pattern
```typescript
// controllers/watch.controller.ts
export const createWatch = async (req: Request, res: Response) => {
    try {
        const { brand, model, serialNumber } = req.body;
        const userId = req.user?.userId; // From auth middleware
        const file = req.file; // From multer middleware
        
        // Validation
        if (!brand || !model || !serialNumber) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        
        // Business logic
        const watch = await prisma.watch.create({
            data: { brand, model, ownerId: userId }
        });
        
        // Success response
        res.status(201).json({ watch });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

#### Route Parameters
```typescript
// Dynamic route: /watches/:id
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Extract parameter
    const watch = await prisma.watch.findUnique({
        where: { id: Number(id) }
    });
    res.json(watch);
});

// Multiple parameters: /watches/:id/images/:fileId
router.delete('/:id/images/:fileId', authenticateToken, async (req, res) => {
    const { id, fileId } = req.params;
    // Delete logic
});
```

#### Query Parameters
```typescript
// GET /watches?page=1&limit=10
router.get('/', authenticateToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    // Pagination logic
});
```

#### Complete Request Flow Example

**Client Request:**
```typescript
// Frontend
const response = await api.post('/watches', {
    brand: 'Rolex',
    model: 'Submariner',
    serialNumber: '123456'
});
```

**Backend Processing:**
```
1. Request hits Express server
2. CORS middleware allows request
3. JSON parser converts body to object
4. Route matched: POST /watches
5. authenticateToken middleware:
   - Extracts JWT from Authorization header
   - Verifies token
   - Attaches user to req.user
6. upload.single('image') middleware:
   - Checks for image file
   - Saves to uploads/watches/ if present
   - Attaches file to req.file
7. createWatch controller:
   - Validates input
   - Hashes serial number
   - Creates watch in database
   - Creates MINT event
   - Returns watch object
8. Response sent: { watch: {...} }
```

## Blockchain Integration

### Smart Contract
```solidity
// WatchRegistry.sol
contract WatchRegistry {
    event EventRecorded(
        bytes32 indexed watchHash,
        uint8 eventType,
        bytes32 payloadHash
    );
    
    function recordEvent(
        bytes32 watchHash,
        uint8 eventType,
        bytes32 payloadHash
    ) external {
        emit EventRecorded(watchHash, eventType, payloadHash);
    }
}
```

### Event Type Mapping
```typescript
const eventTypeMap = {
    'MINT': 0,      // Initial registration
    'SERVICE': 1,   // Maintenance/repair
    'TRANSFER': 2,  // Ownership change
    'AUTH': 3,      // Authentication check
    'NOTE': 4       // General note
};
```

### Blockchain Configuration
- **Development**: Local Hardhat node (http://127.0.0.1:8545)
- **Contract Address**: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- **Signer**: Hardhat default account #0
- **Production**: Configurable via environment variables

## API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Email/password login
- `POST /auth/google` - Google OAuth login
- `POST /auth/facebook` - Facebook OAuth login

### Watches
- `POST /watches` - Create watch (with optional image)
- `GET /watches` - List user's watches
- `GET /watches/:id` - Get watch details
- `POST /watches/:id/events` - Add event (triggers blockchain)
- `POST /watches/:id/images` - Upload watch image
- `DELETE /watches/:id/images/:fileId` - Delete watch image

### Public Access
- `GET /passports/:publicId` - View public passport (no auth)

### Files
- `GET /uploads/watches/:filename` - Serve uploaded images

## Security Considerations

### Authentication
- ✅ JWT tokens with expiration (1 day)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Token validation on protected routes
- ⚠️ Tokens stored in localStorage (vulnerable to XSS)

### Data Privacy
- ✅ Serial numbers hashed (SHA-256)
- ✅ User-specific data isolation
- ✅ Public passports use UUID (not sequential IDs)

### File Upload
- ✅ File type validation (whitelist)
- ✅ File size limits (8MB)
- ✅ Unique filenames (prevents overwrites)
- ⚠️ No virus scanning
- ⚠️ No CDN/cloud storage (local only)

### Blockchain
- ✅ Immutable event records
- ✅ Cryptographic proof (hashes)
- ⚠️ Private key hardcoded (dev only)
- ⚠️ No gas price management

## Performance Considerations

### Frontend
- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Next.js Image component (not currently used)
- **Caching**: Browser caching for static assets
- **Bundle Size**: ~500KB (reasonable for SPA)

### Backend
- **Database**: SQLite (single file, fast for <100K records)
- **Connection Pooling**: Prisma default pooling
- **File Serving**: Express static (efficient for small files)
- **Blockchain**: Async operations (non-blocking)

### Scalability Limits
- SQLite: Good for <100K watches, <1M events
- File Storage: Local disk (limited by server capacity)
- Blockchain: Gas costs scale linearly with events

## Deployment Architecture

### Development
```
Frontend: http://localhost:3000 (Next.js dev server)
Backend:  http://localhost:3001 (tsx + nodemon)
Database: ./backend/prisma/dev.db (SQLite file)
Blockchain: http://127.0.0.1:8545 (Hardhat node)
```

### Production (Recommended)
```
Frontend: Vercel / Netlify (static export or SSR)
Backend:  Railway / Render / AWS EC2
Database: PostgreSQL (Supabase / Railway)
Files:    AWS S3 / Cloudinary
Blockchain: Infura / Alchemy (Sepolia or Mainnet)
```

## Future Improvements

### Frontend
- [x] ~~Implement proper state management (Zustand/Redux)~~ ✅ **COMPLETED** - Zustand implemented
- [x] ~~Add image optimization with Next.js Image~~ ✅ **COMPLETED** - Next.js Image configured
- [ ] Migrate dashboard to use `useWatchStore`
- [ ] Add loading states and error handling to stores
- [ ] Implement optimistic updates for watch operations
- [ ] Implement infinite scroll for watch lists
- [ ] Add offline support (PWA)
- [ ] Improve mobile responsiveness
- [ ] Add image blur placeholders
- [ ] Implement Zustand DevTools for debugging

### Backend
- [ ] Migrate to PostgreSQL for production
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add request validation (Zod/Joi)
- [ ] Implement proper logging (Winston/Pino)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement background jobs (Bull/BullMQ)
- [ ] Add database connection pooling
- [ ] Implement caching layer (Redis)

### Security
- [ ] Move tokens to httpOnly cookies
- [ ] Implement refresh tokens
- [ ] Add CSRF protection
- [ ] Implement rate limiting per user/IP
- [ ] Add input sanitization (DOMPurify)
- [ ] Implement file virus scanning (ClamAV)
- [ ] Add security headers (Helmet.js)
- [ ] Implement 2FA/MFA support

### Blockchain
- [ ] Add gas price estimation
- [ ] Implement transaction retry logic
- [ ] Add event indexing service (The Graph)
- [ ] Support multiple networks (Polygon, Arbitrum)
- [ ] Implement wallet connection (MetaMask, WalletConnect)
- [ ] Add transaction monitoring and notifications
- [ ] Implement batch event anchoring for cost optimization
- [ ] Add event indexing service
- [ ] Support multiple networks
- [ ] Implement wallet connection (MetaMask)

### DevOps
- [ ] Add Docker containers
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing
- [ ] Implement monitoring (Sentry)
- [ ] Add health check endpoints

## Development Workflow

### Starting the Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: Blockchain (optional)
cd contracts
npx hardhat node

# Terminal 4: Deploy contract (optional)
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name description
npx prisma generate
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build
npm run start

# Backend
cd backend
npm run build
node dist/index.js
```

## Key Files Reference

### Configuration
- `frontend/.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables (gitignored)
- `backend/prisma/schema.prisma` - Database schema
- `contracts/hardhat.config.js` - Blockchain configuration

### Entry Points
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/app/page.tsx` - Home page
- `backend/src/index.ts` - Server entry
- `backend/src/app.ts` - Express app setup

### Core Logic
- `frontend/src/lib/api.ts` - API client
- `backend/src/controllers/watch.controller.ts` - Watch business logic
- `backend/src/config/contract.ts` - Blockchain integration
- `contracts/contracts/WatchRegistry.sol` - Smart contract

---

**Last Updated**: December 2024  
**Version**: 1.0.0
