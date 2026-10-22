# Faculty Ranking & Evaluation System
### A. P. Shah Institute of Technology, Thane
**Academic Year 2026-27**

---

## 🏛️ System Overview

The **Faculty Ranking & Evaluation System** is a full-stack academic governance platform developed for **A. P. Shah Institute of Technology (APSIT), Thane** (Approved by AICTE, New Delhi & Govt. of Maharashtra · Affiliated to University of Mumbai).

Designed in accordance with the college e-learning (Moodle) portal aesthetic (`#12a06b` green header, `#d62828` action buttons, card surfaces, and accessible typography), this system provides transparent, multi-parameter academic feedback with strict role-based access control and 100% student anonymity.

---

## 💻 Tech Stack

- **Frontend**: HTML5, responsive CSS3 with Light/Dark mode support, vanilla JavaScript (split into `index.html`, `style.css`, and `script.js`). Zero external UI frameworks or build dependencies.
- **Backend (Production)**: Node.js + Express REST API with MongoDB (Mongoose) / local JSON persistence fallback, `bcryptjs` password hashing, and `jsonwebtoken` (JWT) authentication sessions.
- **Branding**: Official APSIT logo (`logo.png`) embedded in header, login welcome panel, and official letters.

---

## 🚀 How to Run

### Method 1: Full-Stack Production Mode (Node.js + Express Server)

1. Ensure [Node.js](https://nodejs.org/) is installed on your machine.
2. Open a terminal in this directory:
   ```bash
   cd "faculty ranking system"
   ```
3. Install production dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   *Note: Ratings and evaluations submitted in this mode are stored on the server and shared seamlessly across devices and browsers.*

---

### Method 2: Standalone Browser / Live Server Mode (No Node.js Required)

If running in an environment without Node.js installed, the frontend includes a resilient client engine that runs directly from disk:
- Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari (`file:///` protocol).
- Or run with VS Code / Cursor **Live Server** extension.
- The built-in storage engine automatically seeds initial demo data into `localStorage`.

---

## 🔐 Credentials for Testing

*(In compliance with the project specification, demo credentials are NOT displayed on the web page itself.)*

| Role | Username / Identifier | Password | Dashboard Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin (HOD)** | `hod` | `hod123` | Department-wide rankings, medals, per-parameter averages, issue letters, manage faculty mappings |
| **Admin (Co-HOD)** | `cohod` | `cohod123` | Full administrative review and letter oversight |
| **Faculty Member** | Choose any name from dropdown (e.g. `Dr. Meera Nair`, `Prof. Anita Desai`, `Dr. Sunil Patil`) | `faculty123` | **Strictly confidential**: sees only their own overall rating, parameter breakdown, classes taught, anonymous student comments, and attached Warning / Appreciation letter |
| **Student** | Any Roll / PRN (e.g. `123456`) | `123456` | Rate assigned faculty anonymously across the 5 parameters (1-5 stars) + optional comment |

---

## 📋 Evaluation Parameters & Thresholds

Students evaluate each teacher on a 1 to 5 star rating across **5 core parameters**:
1. **Teaching Quality**: Clarity, structure and delivery of lectures.
2. **Student Feedback**: Responsiveness, empathy and openness to student questions.
3. **Subject Knowledge**: Technical depth, accuracy and practical relevance.
4. **Availability**: Accessibility for doubt-solving, mentoring and laboratory support.
5. **Punctuality & Discipline**: Punctuality, syllabus adherence and professional conduct.

### Performance Status & Automated Letters:
- **Average Below 2.50**: ⚠️ **Formal Warning Letter** from the HOD attached to the faculty profile. Mandates pedagogical improvement within **one month**, with a review scheduled thereafter. Styled with a red double border (`#b91c1c`).
- **Average 2.50 to 4.50**: **Satisfactory** performance.
- **Average Above 4.50**: 🏅 **Letter of Appreciation** from the HOD praising teaching excellence and dedication. Styled with a gold double border (`#c9971c`).
- **Print / PDF**: Every generated letter includes college branding, date, academic year, faculty name, signature block, and a **"Print / Save as PDF"** button formatted for clean printing.

---

## 🏫 Academic Structure

- **Year Tabs**: Second Year, Third Year, Fourth Year.
- **Operational Scope**: Only **Second Year (Semesters 3 & 4)** is currently operational for AY 2026-27. Third and Fourth Year and semesters 1, 2, 5, 6, 7, 8 are visible with informative locked notices.
- **Streams**: AIML, IT, COMPS.
- **Classes**: Division A, Division B, Division C.
- Selecting Stream, Semester, and Class division displays only the faculty assigned to that specific class.

---

## 🛡️ Privacy & Anonymity Architecture

- **Zero Student Metadata**: Ratings stored in the database or server contain only stream, semester, class, faculty name, subject, numeric scores, comment, and timestamp. No student ID, roll number, IP address, or session identifier is linked to ratings.
- **Duplicate Prevention**: The browser tracks submitted subjects to ensure a student cannot submit multiple ratings for the same subject/teacher in a session.
- **Faculty Data Isolation**: Faculty accounts are strictly restricted from seeing peer ratings, rankings, or comparative metrics.

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials, returns JWT token and profile |
| `/api/auth/me` | `GET` | Authenticated | Decodes and validates JWT token session |
| `/api/stats/summary` | `GET` | Public | Returns live totals of appeared students, ratings, and faculty count |
| `/api/faculty/names` | `GET` | Public | Returns list of distinct faculty names for login dropdown |
| `/api/faculty/assignments` | `GET` | Public | Returns stream/semester/class faculty mappings |
| `/api/faculty` | `POST` | Admin | Assigns a new faculty member and subject |
| `/api/faculty/:id` | `PUT` | Admin | Edits faculty name and subject (past ratings follow updates) |
| `/api/faculty/:id` | `DELETE` | Admin | Removes faculty assignment from rankings and student forms |
| `/api/ratings` | `GET` | Admin / Faculty | Retrieves ratings (Admins get filtered department data; Faculty gets ONLY their own) |
| `/api/ratings` | `POST` | Student | Submits 100% anonymous 5-star rating + records student attendance |

---

## 📍 College Address & Contact
**A. P. Shah Institute of Technology**  
Survey No. 12, 13, Opp. Hypercity Mall, Kasarvadavali, Ghodbunder Road,  
Thane (W) 400615, Maharashtra  
📞 Mob: 7738305400 · ✉️ principal@apsit.org.in · 🌐 [www.apsit.edu.in](https://www.apsit.edu.in)
