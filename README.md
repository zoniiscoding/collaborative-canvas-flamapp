# Collaborative Canvas – Real-Time Drawing App

Collaborative Canvas is a real-time multi-user drawing application where multiple users can draw simultaneously on the same canvas with live synchronization.

It supports multiple rooms, global undo/redo, real-time cursors, and works across desktop and mobile.

---

## Features

- Real-time collaborative drawing (Socket.IO)
- Multiple rooms (`/room1`, `/room2`, etc)
- Drawing tools: brush, eraser, rectangle, text
- Global undo/redo across all users
- Live user presence with colored cursors
- Mobile touch support
- Save/load locally
- Modern responsive UI

---

## Tech Stack

- Frontend: HTML, CSS, Vanilla JS  
- Backend: Node.js, Express, Socket.IO  
- Deployment: Render  

---

## Setup Instructions

1. Clone repository

git clone https://github.com/zoniiscoding/collaborative-canvas-flamapp
cd collaborative-canvas  

2. Install dependencies

npm install  

3. Start server

npm start  

4. Open in browser

http://localhost:3000  

---

## How to Test with Multiple Users

Open the app in two tabs or devices  
Use different rooms:  
/room1  
/room2  

Draw on one device → appears on others in same room  
Try undo/redo across devices  

---

## Known Limitations

- No persistent storage (canvas resets on server restart)  
- No authentication  
- No CRDT-based conflict resolution (uses last-write-wins)  
- Not optimized for 1000+ users  

---

## Time Spent

3–4 days

---

## Live Demo

https://collaborative-canvas-flamapp.onrender.com
