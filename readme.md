# 🚀 payamac — Real-Time Chat Application

A modern, full-stack **real-time chat application** built with **React**, **TypeScript**, **Node.js**, **Express**, and **Socket.IO**.  
Supports **private messaging**, **online/offline presence**, **typing indicators**, **message persistence**, **image uploads**, and **email notifications**.

Hosted online and production-ready, designed for a smooth, responsive user experience.

---

## ✨ Features

- 🔐 **JWT Authentication** (Login/Register)
- 💬 **1-to-1 real-time messaging**
- 🟢 Online/offline presence status
- ✍️ Typing indicators
- 📄 Persistent chat history
- 🖼️ Image uploads via **ImageKit**
- ✉️ Email notifications via **Resend**
- ⚡ Responsive, animated UI with **Tailwind CSS**
- 🔄 Auto-reconnection and smooth chat animations
- 🔒 Secure WebSocket & REST API communication

---

## 🛠️ Tech Stack

### **Frontend**
- React (TypeScript)
- Tailwind CSS
- Socket.IO Client

### **Backend**
- Node.js (TypeScript)
- Express.js
- Socket.IO Server
- MongoDB
- JWT Authentication
- ImageKit (image uploads)
- Resend (email notifications)
- Arcjet (optional integrations)

---


---

## 🛠️ Environment Variables

Create a `.env` file in the root and configure:

```env
 # Server
-PORT=3000
-NODE_ENV=development

# Database
-MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority

# Authentication
-JWT_SECRET="<your_jwt_secret>"

# Email (Resend)
-RESEND_API_KEY="<your_resend_api_key>"
-EMAIL_FROM_NAME="Your Name"
-EMAIL_FROM="your-email@example.com"

# Client URL
-CLIENT_URL="http://localhost:5173"

# ImageKit
-IMAGEKIT_PUBLIC_KEY="<your_imagekit_public_key>"
-IMAGEKIT_PRIVATE_KEY="<your_imagekit_private_key>"
-IMAGEKIT_ENDPOINT_URL="https://ik.imagekit.io/<your_imagekit_id>"

# Arcjet
-ARCJET_KEY="<your_arcjet_key>"
-ARCJET_ENV=development

#git clone https://github.com/Shabir-Ahmad-Sediqi/chat-application

#backend
-cd backend
-npm install
-npm run dev

#backend
-cd frontend
-npm install
-npm run dev

# And you are all setup, enjoy it

# If you want to contribute, fork the project create a branch call it with your new feature, when you
# are done developing it, make a pull request.  