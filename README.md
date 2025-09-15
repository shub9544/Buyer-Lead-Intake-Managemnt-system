Buyer Lead Intake Management System
The Buyer Lead Intake Management System helps businesses capture, organize, and manage buyer leads with ease. It features intake forms, a searchable database, and dashboards for insights, ensuring timely follow-ups and efficient lead tracking through a simple, modern solution.
<img width="941" height="406" alt="image" src="https://github.com/user-attachments/assets/4e3d3ff2-6bdf-4cf3-886e-c8780e59f97a" />



The Buyer Lead Intake Management System** is designed to help businesses and agents capture, organize, and manage buyer leads efficiently. It simplifies the process of collecting client information, tracking lead status, and generating insights for better follow-ups. Built with **Next.js, Supabase, and React Native**, it works seamlessly across web and mobile platforms.

---

 Features
-Lead intake form to quickly capture buyer details  
-Search and filter options for easy lead management  
-Dashboard with insights and conversion tracking  
-CSV import/export for bulk lead handling  
-Secure authentication for admins and agents  
-Cross-platform support (Web + Mobile)  

---

Tech Stack
- Frontend (Web): Next.js + Tailwind CSS  
- Backend & Database:** Supabase (Postgres + Auth + Storage)  
- Mobile App: React Native with Expo  
- State Management: Zustand / React Query  
- Other Tools: Prisma ORM, Yup (Validation), PapaParse (CSV Parser)  

---

Project Structure
The project is organized as follows:
- web/ → Next.js frontend  
- mobile/ → React Native (Expo) mobile app  
- prisma/ → Database schema and migrations  
- .env.example → Environment variables template  
- README.md → Project documentation  

---

Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/buyer-lead-intake-system.git
   cd buyer-lead-intake-system
Install Dependencies

For web:

bash
Copy code
cd web
pnpm install   # or npm install / yarn install
For mobile:

bash
Copy code
cd ../mobile
npm install
Setup Environment Variables
Create .env files using .env.example as a template. Add your Supabase credentials:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

DATABASE_URL=your_supabase_database_url

Database Setup

bash
Copy code
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
Run the App

Start Next.js web app:

bash
Copy code
cd web
pnpm dev
Start React Native app:

bash
Copy code
cd ../mobile
npx expo start
🧪 Roadmap
Add email & SMS notifications

Multi-agent role support

Analytics & reporting dashboard

Integration with external CRM tools
