# WatchVault

A blockchain-secured digital passport system for luxury watches. WatchVault allows watch owners to create immutable records of their timepieces, track service history, and maintain provenance through blockchain technology.

## Features

- 🔐 **Blockchain-Secured Records** - Immutable watch provenance on Ethereum
- 👤 **Social Login** - Google and Facebook OAuth integration
- 📸 **Image Upload** - Optional watch images (max 8MB)
- 📱 **QR Code Access** - Public digital passports via QR codes
- 📜 **Event Timeline** - Track service, authentication, and transfer events
- 🎨 **Modern UI** - Capital One-inspired design system

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React OAuth** - Google/Facebook authentication

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - ORM with SQLite database
- **Multer** - File upload handling
- **JWT** - Authentication tokens

### Smart Contracts
- **Hardhat** - Ethereum development environment
- **Solidity** - Smart contract language
- **Ethers.js** - Blockchain interaction

## Prerequisites

- **Node.js** 18+ and npm
- **Git**
- Google Cloud Console account (for Google OAuth)
- Facebook Developer account (for Facebook OAuth)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/trietlu/WatchVault.git
cd WatchVault
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your configuration

# Initialize database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Database Setup

The application uses SQLite with Prisma ORM. The database schema is already defined in `backend/prisma/schema.prisma`.

#### Database Schema Overview

The schema includes four main models:
- **User** - User accounts with email/password and OAuth support
- **Watch** - Watch records with brand, model, and serial number hash
- **WatchEvent** - Timeline events (MINT, SERVICE, TRANSFER, AUTH)
- **FileRecord** - Uploaded watch images

#### Initialize the Database

```bash
cd backend

# Generate Prisma Client (creates TypeScript types)
npx prisma generate

# Create the database and run migrations
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

#### Understanding Prisma Commands

- **`npx prisma generate`** - Generates TypeScript client from schema
- **`npx prisma migrate dev`** - Creates migration and applies to database
- **`npx prisma studio`** - Opens GUI to view/edit database (http://localhost:5555)
- **`npx prisma db push`** - Pushes schema changes without creating migration (for prototyping)

#### Database File Location

The SQLite database is created at:
```
backend/prisma/dev.db
```

This file is excluded from Git via `.gitignore`.

#### Resetting the Database

If you need to start fresh:

```bash
cd backend

# Delete the database file
rm prisma/dev.db

# Recreate and migrate
npx prisma migrate dev --name init
```

#### Viewing the Schema

The complete schema is in `backend/prisma/schema.prisma`:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String?
  googleId     String?  @unique
  facebookId   String?  @unique
  createdAt    DateTime @default(now())
  watches      Watch[]
}

model Watch {
  id               Int          @id @default(autoincrement())
  ownerId          Int
  owner            User         @relation(fields: [ownerId], references: [id])
  serialNumberHash String       @unique
  brand            String
  model            String
  publicId         String       @unique @default(uuid())
  qrCodeUrl        String?
  createdAt        DateTime     @default(now())
  events           WatchEvent[]
  files            FileRecord[]
}

model WatchEvent {
  id          Int          @id @default(autoincrement())
  watchId     Int
  watch       Watch        @relation(fields: [watchId], references: [id])
  eventType   String
  payloadJson String
  payloadHash String
  txHash      String?
  blockNumber Int?
  timestamp   DateTime     @default(now())
  files       FileRecord[]
}

model FileRecord {
  id        Int         @id @default(autoincrement())
  watchId   Int?
  watch     Watch?      @relation(fields: [watchId], references: [id])
  eventId   Int?
  event     WatchEvent? @relation(fields: [eventId], references: [id])
  url       String
  type      String
  createdAt DateTime    @default(now())
}
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your OAuth credentials:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
# NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Smart Contracts Setup (Optional)

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000`
6. Copy Client ID to `frontend/.env.local`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `http://localhost:3000`
5. Copy App ID to `frontend/.env.local`

## Running the Application

### Development Mode

Start all services in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Blockchain (optional)
cd contracts
npx hardhat node
```

Access the application at `http://localhost:3000`

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Project Structure

```
WatchVault/
├── backend/              # Node.js/Express API
│   ├── prisma/          # Database schema and migrations
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth, upload, etc.
│   │   └── config/      # Configuration files
│   └── uploads/         # User-uploaded images
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities and API client
│   └── public/         # Static assets
└── contracts/          # Ethereum smart contracts
    ├── contracts/      # Solidity files
    └── scripts/        # Deployment scripts
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Email/password login
- `POST /auth/google` - Google OAuth login
- `POST /auth/facebook` - Facebook OAuth login

### Watches
- `POST /watches` - Create new watch (with optional image)
- `GET /watches` - Get user's watches
- `GET /watches/:id` - Get watch details
- `POST /watches/:id/images` - Upload watch image
- `DELETE /watches/:id/images/:fileId` - Delete watch image
- `POST /watches/:id/events` - Add event to watch

### Public
- `GET /passports/:publicId` - Get public watch passport

## Testing

Currently, the application uses manual testing. To test:

1. **Registration/Login**
   - Create account at `/register`
   - Login with email/password or OAuth

2. **Watch Creation**
   - Navigate to "Add Watch"
   - Fill in brand, model, serial number
   - Optionally upload an image
   - Submit to create watch

3. **Image Management**
   - View watch detail page
   - Upload image if none exists
   - Delete existing image

4. **Event Timeline**
   - Add events to watch
   - View event history
   - Check blockchain anchoring status

## Environment Variables

### Backend (.env)
```
PORT=3001
JWT_SECRET=your_jwt_secret
DATABASE_URL="file:./dev.db"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Ensure database is initialized: `npx prisma generate`
- Verify `.env` file exists with correct values

### Frontend won't start
- Check if port 3000 is available
- Ensure `.env.local` exists (OAuth keys are optional for basic functionality)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`

### Image upload fails
- Verify `backend/uploads/watches` directory exists
- Check file size is under 8MB
- Ensure file type is JPEG, PNG, or WebP

### OAuth login not working
- Verify OAuth credentials in `.env.local`
- Check redirect URIs in Google/Facebook console
- Ensure backend is running on port 3001

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


