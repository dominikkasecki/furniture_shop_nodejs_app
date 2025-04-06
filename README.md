# 🪑 EJS Furniture Store – Node.js App with MongoDB and Express

This project is a full web application built using **Node.js**, **Express**, **MongoDB**, and **EJS** as a templating engine. It simulates an online furniture store where users can browse products, register, log in, add items to their cart, and place orders.

🔗 **Live demo (Polish website):** [https://furniture-shop-bm1z.onrender.com](https://furniture-shop-bm1z.onrender.com)  
🕒 *Note: The app may take a few seconds to load due to Render’s cold start behavior.*

## ⚙️ Main Features

- 🔐 User registration and login
- 🛒 Shopping cart with order placement
- 📦 Admin panel for managing furniture items
- 🧾 Invoice generation (PDF)
- 📧 Email support (e.g. password reset)
- 🎨 Frontend built with EJS, Bootstrap, and various JS libraries

## 📁 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Views**: EJS, Bootstrap, jQuery
- **Payments**: Stripe (partially implemented)
- **Other libraries**: AOS, Owl Carousel, Venobox

## ⚠️ Project Status

This was one of my **first complete CRUD-based Node.js projects**, created as part of learning fullstack development. As such, **minor bugs or logic gaps may be present** (e.g., in cart flow or authentication). Some external features—such as Stripe payments or email reset—require full API key and SMTP setup, and may not work in the deployed version.

The website is in **Polish**, as it was initially developed for a local audience and testing environment.

Despite being an early project, it remains a solid demonstration of my skills in building backend architecture, connecting databases, managing user sessions, and creating interactive fullstack applications. It reflects my hands-on, self-driven learning approach and foundations in backend web development.

## 🚀 Running Locally

```bash
git clone https://github.com/YourUsername/ejs_app.git
cd ejs_app
npm install
npm start
