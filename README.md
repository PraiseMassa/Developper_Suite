# dev_space 🚀

**dev_space** is a modern, streamlined workspace built specifically for software engineers. It combines high-level project management, an interactive Kanban task board, and a developer journal to document technical solutions, bug fixes, and architectural learnings.

---

## 📸 Overview & Features

### Current Features

- **Interactive Kanban Board:** Drag-and-drop tasks across workflow columns (`IDEAS`, `TODO`, `IN_PROGRESS`, `DONE`) with real-time status updates.
- **Project Tracking:** Group tasks and journal entries under specific projects with visual indicators on task cards.
- **Developer Journal:** Log technical takeaways, bug solutions, root causes, and project/task-linked insights with mood indicators and tag filtering.
- **Unified Workspace Header:** Clean, contextual layout with dedicated creation workflows for tasks, projects, and journal entries.
- **Task Management (CRUD):** Full capability to view details, update priority/status/project linkage, and delete tasks.

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide React (Icons)
- **Backend:** Node.js, Express.js
- **Database / ORM:** Prisma / Mongoose (MongoDB)
- **Build Tool:** Vite

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/your-username/dev-space.git](https://github.com/your-username/dev-space.git)
   cd dev-space

   Install dependencies:
   ```

Bash
npm install
Set up environment variables:
Create a .env file in the root directory and configure your database connection:

Code snippet
DATABASE_URL="your_database_connection_string"
PORT=5000
Run database migrations (if using Prisma):

Bash
npx prisma db push
Start the development server:

Bash
npm run dev
🔮 Roadmap & Upcoming Features
dev_space is designed to grow into a full-fledged collaborative environment for engineering teams. Planned additions include:

Developer Authentication & Profiles:

Dedicated login/signup system.

Custom developer profiles featuring a bio, profile picture, avatar, and job title/role.

Multi-Developer Collaboration:

Assign multiple developers to a single task or project.

Render team member avatars directly on Kanban task cards.

Advanced Progress Tracking:

Visual progress bars for active projects based on task completion percentages.

Sprint analytics and task velocity metrics.

📄 License
This project is licensed under the MIT License.

---

### Terminal Commands to Push to GitHub

Run these commands in your project root terminal to push your project:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all files to staging
git add .

# 3. Commit your changes
git commit -m "feat: complete initial dev_space app with project linking and developer journal"

# 4. Rename default branch to main
git branch -M main

# 5. Add your remote GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```
