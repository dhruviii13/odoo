# SkillMate: Skill Swap Platform

A modern web app for swapping skills, built with Next.js (App Router), MongoDB (Mongoose), and Firebase Cloud Messaging (FCM).

## Problem Statement
A mini application that enables users to list their skills and request others in return. Users can search, filter, and request skill swaps, with real-time notifications and admin moderation.

## Team Members
- Prakhar Pradhan - prakharpradhan0@gmail.com
- Arshpreet Singh - asingh6_be22@thapar.edu
- Dhruvi Singh - dhruvisingh13nov2003@gmail.com
- Divyansh Singh - f20220950@goa.bits-pilani.ac.in

## Features
- User registration, login, and profile management
- List skills offered and wanted
- Search/filter users by skill, name, or email
- Request skill swaps (with message and skill selection)
- Swap request list with Accept/Reject/Delete
- Feedback and rating system
- Admin dashboard: ban/unban users, moderate skills, broadcast messages, export reports
- Profile photo upload (Cloudinary)
- Real-time notifications (FCM)
- Glassmorphism, neon, and dark theme UI
- Fully responsive and accessible

## Tech Stack
- Next.js (App Router)
- MongoDB + Mongoose
- NextAuth.js (JWT, credentials)
- Firebase Cloud Messaging (FCM)
- Cloudinary (file uploads)
- SWR, react-hook-form, Zod

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_SERVER_KEY=your_firebase_server_key
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Usage
- Register or log in to create your profile and list your skills.
- Search for users and request skill swaps.
- Manage swap requests and feedback from your profile.
- Admins can moderate users, skills, and platform-wide notices.

## License
MIT
