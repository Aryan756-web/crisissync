# 🚨 CrisisSync — Real-Time Emergency Response System

CrisisSync is a full-stack web application built to simulate how real-world emergency systems work — where speed, visibility, and communication matter the most.

The idea is simple:
When a user is in distress, they should be able to trigger an emergency instantly, share their live location, and notify the system — while an admin can monitor, respond, and resolve the situation in real-time.

---

## 🌍 Why I Built This

Most beginner projects focus on CRUD operations.
I wanted to build something that feels **closer to a real-world system**.

This project focuses on:

* real-time updates
* live location tracking
* event-driven communication
* system-level thinking (user ↔ admin interaction)

---

## ⚡ What This App Does

### 👤 User Side

* Trigger an emergency alert with one click
* Automatically sends live geolocation
* Receives confirmation once the issue is resolved

### 👨‍💼 Admin Side

* View all incoming emergencies in real-time
* Track locations on an interactive map
* Resolve emergencies with one click
* Send automated updates to users

---

## 🧠 Key Highlights

* 🔴 **Real-Time System** — Powered by Socket.IO
* 📍 **Live Map Tracking** — Using Leaflet.js
* 🔐 **Authentication & Roles** — JWT-based (Admin/User)
* 📧 **Email Automation** — Instant alerts & resolution updates
* ⚡ **Event-Driven Backend** — Not just request-response
* 📱 **Responsive UI** — Works across devices

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Leaflet.js

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Socket.IO
* Nodemailer

---

## 🧩 How It Works (Flow)

1. User triggers an emergency
2. Location is captured via browser geolocation
3. Data is sent to backend and stored in MongoDB
4. Socket event notifies all connected admins instantly
5. Admin sees alert on dashboard + map
6. Admin resolves emergency
7. User receives confirmation via email

---

## 📂 Project Structure

```id="mdh9ya"
crisissync/
 ├── backend/   # Express server, APIs, DB logic
 ├── frontend/  # React UI, maps, dashboard
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```id="9f1y7m"
git clone https://github.com/your-username/crisissync.git
cd crisissync
```

---

### 2. Backend Setup

```id="jokd9t"
cd backend
npm install
```

Create `.env` file:

```id="eah2pb"
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
ADMIN_EMAIL=your_email
```

Run backend:

```id="9k1d7l"
node server.js
```

---

### 3. Frontend Setup

```id="7sk9gm"
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## 📸 Screenshots

* register page
* login page
* main UI page
* live emergency 

---

## 🚀 Future Improvements

* 🚑 Ambulance dispatch system
* 📊 Analytics dashboard for admins
* 📍 Route tracking & ETA estimation
* 📲 SMS alerts (Twilio integration)

---

## 👨‍💻 Author

Aaryan

---

## 💬 Final Thoughts

This project helped me understand how real-time systems work beyond basic CRUD apps.
It pushed me to think in terms of **events, users, and system flow**, rather than just APIs.

There’s still room to improve — but that’s the point.

---
