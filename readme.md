# Chat Application

A modern, full-stack real-time chat app with a premium, theme-aware UI, image and file messaging, and strong account controls.

## Highlights

- Real-time 1:1 messaging with presence
- Image and file attachments (up to 5MB)
- Profile settings with bio, avatar, and theme
- Block/unblock users and remove chats
- Account deletion safeguards and session security
- Blue Mist (Light) and Black + Green (Dark) themes

## Tech Stack

Frontend
- React + TypeScript
- Tailwind CSS + DaisyUI
- Zustand
- Socket.IO client

Backend
- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- Socket.IO server
- JWT auth
- ImageKit (uploads)
- Resend (email)
- Arcjet (rate limiting, optional)

## Getting Started

1) Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

2) Configure environment

Create `.env` in the project root:
```env
PORT=3000
NODE_ENV=development

MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET="<your_jwt_secret>"

RESEND_API_KEY="<your_resend_api_key>"
EMAIL_FROM_NAME="Your Name"
EMAIL_FROM="your-email@example.com"

CLIENT_URL="http://localhost:5173"

IMAGEKIT_PUBLIC_KEY="<your_imagekit_public_key>"
IMAGEKIT_PRIVATE_KEY="<your_imagekit_private_key>"
IMAGEKIT_ENDPOINT_URL="https://ik.imagekit.io/<your_imagekit_id>"

ARCJET_KEY="<your_arcjet_key>"
ARCJET_ENV=development
```

3) Run the app

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Open:
```
http://localhost:5173
```

## Scripts

Backend
- `npm run dev` - Start API server

Frontend
- `npm run dev` - Start Vite dev server

## Notes

- Default theme is Black + Green. Users can switch in Settings.
- Messages accept text, images, or files (up to 5MB each).
- Blocking is enforced server-side on every send.

## Contributing

1) Fork the repo
2) Create a feature branch
3) Open a pull request
