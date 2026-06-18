# 💼 Claimly - Expense Claim Management System

<!-- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge\&logo=html5\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge\&logo=bootstrap\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![JSON Server](https://img.shields.io/badge/JSON--Server-000000?style=for-the-badge) -->

## 📖 Overview

**Claimly** is a web-based Expense Claim Management System designed to simplify the reimbursement process within organizations. Employees can submit expense claims, monitor their status, and manage their requests, while administrators can review, approve, or reject claims with remarks.

The system provides a centralized platform for tracking expenses and streamlining approval workflows.

---

## 📑 Table of Contents

* [Overview](#-overview)
* [Features](#-features)
* [Workflow](#-workflow)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Screenshots](#-screenshots)
* [Installation](#-installation)
* [Future Enhancements](#-future-enhancements)
* [Conclusion](#-conclusion)

---

# ✨ Features

## 👤 User Module

| Feature              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| Registration & Login | Secure authentication for employees                        |
| Submit Claims        | Add expense title, category, amount, date, and description |
| View Claims          | View all submitted expense requests                        |
| Update Claims        | Modify pending requests                                    |
| Delete Claims        | Soft delete and restore functionality                      |
| Search & Filter      | Search claims and filter by date                           |
| Status Tracking      | Monitor approval status                                    |
| View Remarks         | View admin comments and approval details                   |

---

## 🛡️ Admin Module

| Feature             | Description                               |
| ------------------- | ----------------------------------------- |
| Admin Login         | Secure administrator access               |
| View Claims         | Access all submitted expense requests     |
| Approve Claims      | Approve expense claims                    |
| Reject Claims       | Reject claims with remarks                |
| Remarks Management  | Mandatory remarks for decisions           |
| Claim History       | Track all approval actions                |
| Dashboard Analytics | View total, pending, and completed claims |

---



# 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* Bootstrap 5
* JavaScript (ES6)

### Backend (Mock)

* JSON Server

### Storage

* Local Storage

### Tools

* Bootstrap Icons
* SweetAlert2
* jQuery

---

# 📂 Project Structure

```plaintext
Claimly/
│
├── main/
│   ├── index.html
│   ├── style.css
│   └── login.js
│
├── user/
│   ├── user.html
│   ├── user.css
│   └── user.js
│
├── admin/
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
│
├── assets/
│   ├── images
│   ├── icons
│   └── svg files
│
├── db.json
│
└── README.md
```

---

# 📸 Screenshots

## Landing Page

![Landing Page](assests/screenshot/landing%20page.png)

---

## User Dashboard

![User Dashboard](assests/screenshot/User%20Dashboard.png)

---

## Add Expense

![Add Expense](assests/screenshot/Add%20Expense.png)

---

## View Expense

![View Expense](assests/screenshot/View%20Expense.png)

---

## Admin Dashboard

![Admin Dashboard](assests/screenshot/Admin%20Dashboard.png)

---

## Approval Modal

![Approval Modal](assests/screenshot/Approval%20Modal.png)

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Sanjaysammathew/Expense-Management.git
```

## 2️⃣ Navigate to Project

```bash
cd expense-management
```

## 3️⃣ Install JSON Server

```bash
npm install -g json-server
```

## 4️⃣ Start JSON Server

```bash
json-server --watch db.json --port 3000
```

## 5️⃣ Run Project

Open:

```plaintext
Main/index.html
```

using Live Server or any local web server.

---

# 🎯 Key Functionalities

### Employee

* Register Account
* Login
* Submit Expense Claims
* Update Pending Claims
* Delete & Restore Claims
* Search Expenses
* Track Status
* View Remarks

### Administrator

* Login
* Review Expense Requests
* Approve Claims
* Reject Claims
* Add Remarks
* View Employee Claims
* Monitor Dashboard Statistics

<!-- ---

# 🔮 Future Enhancements

* 📧 Email Notifications
* 📄 PDF Report Generation
* 📊 Excel Export
* 🗄️ MySQL / MongoDB Integration
* 🔐 JWT Authentication
* 👥 Role-Based Access Control
* 📈 Analytics Dashboard
* ☁️ Cloud Deployment

--- -->

# 🏆 Conclusion

Claimly provides a simple yet effective solution for managing employee expense reimbursements. By offering dedicated dashboards for employees and administrators, the system ensures transparency, accountability, and efficient claim processing.

The project demonstrates practical implementation of CRUD operations, approval workflows, role-based interfaces, data filtering, status tracking, and responsive UI development using modern web technologies.

---

### Developed  using HTML, CSS, Bootstrap, JavaScript, and JSON Server
