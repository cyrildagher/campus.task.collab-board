# Campus Task Collaboration Board

A task management web app I built for managing tasks around campus. This was my project for the web technologies class - basically a collaboration board where students can organize tasks, work in teams, and track progress together.

**Made by:** Cyril Michael Dagher  
**Student ID:** 10012300026

---

## Project Overview

This is a full-stack web application for campus task collaboration. Students can register (with Student ID validation), create or join teams, assign tasks to team members, and track task progress through three statuses (Pending, In Progress, Completed). The app features a clean, modern UI with team management, task assignment, and comprehensive dashboard views.

**Key Functionality:**
- Student-only registration with Student ID validation
- Team creation and joining via unique team codes
- Task creation, assignment, and status management
- Team member management and collaboration
- Dashboard with statistics and assigned tasks view
- Real-time task status updates

---

## Deployment Links

### Frontend
- **GitHub Pages:** [https://cyrildagher.github.io/campus.task.collab-board/](https://cyrildagher.github.io/campus.task.collab-board/)
- **GitHub Repository:** [Link to your frontend repository]

### Backend
- **Render:** [https://campus-task-collab-board-gqd5.onrender.com](https://campus-task-collab-board-gqd5.onrender.com)
- **API Base URL:** [https://campus-task-collab-board-gqd5.onrender.com/api](https://campus-task-collab-board-gqd5.onrender.com/api)
- **GitHub Repository:** [Link to your backend repository]

### Database
- **PostgreSQL:** Hosted on Render (included with backend deployment)

---

## Login Details

For testing purposes, you can use these test credentials:

**Test Account:**
- **Email:** arnold@webtech.com
- **Password:** arnold@123

**Example:** Username: arnold@webtech.com | Password: arnold@123

**Note:** You can also register a new account through the registration form. Registration requires:
- Name
- Email
- Student ID (8-12 digits)
- Password

---

## What This Project Is About

So this is basically a collaboration board for students to manage tasks together. I tried to keep the design simple and clean - nothing too fancy, just something that works well. You can create teams, assign tasks to team members, track progress with different statuses, and collaborate on projects. It's built specifically for students (requires Student ID to register) and supports team-based task management.

---

## Feature Checklist

### User Registration & Authentication
- ✅ Secure user registration and login
- ✅ Students only restriction (Student ID validation required)
- ✅ Allow users to create or join a project team

### Task Management
- ✅ Create project tasks
- ✅ Assign project tasks to team members
- ✅ Update project tasks
- ✅ Delete project tasks
- ✅ Display tasks by status (Pending, In Progress, Completed)

### Team Dashboard
- ✅ Show all team members
- ✅ Show assigned tasks for each team member
- ✅ Include summary charts or indicators (total tasks, completed count)

### Admin Panel / Deployment
- ✅ Host backend on Render (Node.js + PostgreSQL)
- ✅ Host frontend on GitHub Pages
- ✅ Integrate with backend API

---

## Features

### Login/Registration
- You can register and login (Students only!)
- Student ID validation - must be 8-12 digits (enforced on both frontend and backend)
- Passwords are hashed with bcryptjs (learned this in class!)
- You need to be logged in to use the app
- Registration form validates student ID format before submission

### Task Stuff
- **Create Tasks**: Add tasks with title, description, category, tags, time estimates, status, assignee, and team
- **Task Status**: Three statuses available - Pending, In Progress, Completed (with color-coded dropdown)
- **Task Assignment**: Assign tasks to any team member when creating or editing
- **Status Management**: Change task status directly from the task card with a dropdown
- **Board View**: Tasks are organized in 4 categories:
  - Academics
  - Recreational
  - Sports
  - Events
- **Complete Tasks**: Just check the box or change status dropdown to "Completed"
- **Delete Tasks**: There's a delete button with a confirmation popup
- **Completed Section**: All your done tasks go here

### Teams & Collaboration
- **Create Teams**: Create project teams with name and description (you automatically become admin)
- **Join Teams**: Join existing teams using a 6-character team code
- **Team Codes**: Each team gets a unique code (like "ABC123") that you can share with others
- **Team Members**: View all team members with their details (name, email, student ID, role)
- **Team Dashboard**: See all teams you're part of with member counts and previews
- **Team Details**: Click "View" on any team to see full member list and team code
- **Copy Team Code**: Easy copy button to share your team code
- **Assigned Tasks**: View tasks assigned to each team member in the Overview section (grouped by member)
- **Task-Team Linking**: Link tasks to specific teams when creating them

### Dashboard
- **Overview**: Shows stats about your tasks (total, completed, pending) and assigned tasks grouped by team member with status breakdowns
- **Projects**: This is the main board where you manage tasks (kanban-style by category)
- **Teams**: View all your teams, create new ones, or join existing teams with a code
- **Completed**: See all your completed tasks
- **Milestones**: Track milestones (still working on this)
- **Planning**: Planning section with tips and upcoming tasks (also still working on it)
- **Profile**: Dropdown menu to logout

### UI
- Simple design, nothing too complicated
- Works on different screen sizes (tried my best with responsive design)
- Modal popups for creating/deleting tasks
- Navigation between different views

---

## Tech Stack

### Frontend
- **HTML5** - Basic structure
- **CSS3** - Styling (took me a while to get it right)
- **JavaScript** - All the logic and DOM stuff
- **Fetch API** - To talk to the backend
- **LocalStorage** - For caching some data
- **Hosted on:** GitHub Pages (free hosting!)

### Backend
- **Node.js** - JavaScript on the server
- **Express.js** - Makes building the API easier
- **PostgreSQL** - Database for storing users and tasks
- **bcryptjs** - For hashing passwords
- **dotenv** - For environment variables
- **Hosted on:** Render (also free tier!)

### Database
- **PostgreSQL** - Same database
- **Hosted on:** Render (they have a free PostgreSQL option)

### Tools I Used
- **Nodemon** - Auto-restarts the server when I make changes (super helpful)
- **Git** - Version control
- **Thunder Client** - For testing API endpoints (Postman works too)

---

## Project Structure

```
campus.task.collab-board/
```

Here's how I organized everything:

### Root Level
- **`index.html`** - Just redirects to the frontend

### Frontend
All the client-side code is in `frontend/` folder.

- **`index.html`** - Login and registration page
- **`dashboard.html`** - Main dashboard after you login

**CSS:**
- **`css/styles.css`** - Dashboard styling
- **`css/login.css`** - Login page styling

**JavaScript:**
- **`js/api.js`** - Handles all API calls (auth, tasks, teams, users)
- **`js/auth.js`** - Login/registration logic
- **`js/tasks.js`** - Task creation, management, and status handling
- **`js/teams.js`** - Team creation, joining, and member management
- **`js/dashboard.js`** - Dashboard navigation, stats, and assigned tasks display

### Backend
Server code is in `backend/` folder.

- **`server.js`** - Main Express server
- **`package.json`** - Dependencies

**Config:**
- **`config/db.js`** - Database connection
- **`.gitignore`** - Git ignore file

### Other Files
- **`Documentation.txt`** - More detailed docs (if you want to read more)
- **`README.md`** - This file

---

## How to Set It Up (For Local Development)

### What You Need
- Node.js (I used v14, but newer should work)
- npm
- PostgreSQL (local or you can use Render's free database)
- A browser

### Backend Setup

1. Go to the backend folder:
   ```bash
   cd backend
   ```

2. Install everything:
   ```bash
   npm install
   ```

3. Set up your database:
   
   **For Local Development (Recommended for faster performance):**
   
   a. Create a local PostgreSQL database:
      ```sql
      CREATE DATABASE campus_task_db;
      ```
   
   b. Create a `.env` file in the `backend` folder:
      ```
      DATABASE_URL=postgresql://your_username:your_password@localhost:5432/campus_task_db
      PORT=3000
      ```
      Replace `your_username` and `your_password` with your PostgreSQL credentials.
   
   c. Create the database tables. You'll need to create:
      - `users` table with `student_id` field
      - `tasks` table with `status` enum (Pending, In Progress, Completed), `assignee_id`, and `team_id`
      - `teams` table with `team_code` field (6-character unique codes)
      - `team_members` table for team memberships
      - All necessary indexes for performance
      
      The database schema includes:
      - User registration with Student ID validation
      - Task status management (enum type)
      - Team creation with automatic code generation
      - Task assignment to team members
      - Team membership tracking
      
      See the backend code comments or `REQUIREMENTS_CHECKLIST.md` for detailed schema information.
   
   **Note:** Using a local database will be MUCH faster than connecting to the remote Render database. The connection will automatically detect local vs remote and disable SSL for local connections.
   
   **For Production/Remote:**
   - The default connection string points to Render's database
   - Set `DATABASE_URL` environment variable to your remote database URL
   - SSL will be automatically enabled for remote connections

4. Start the server (for local development):
   ```bash
   npm run dev
   ```
   
   It should run on `http://localhost:3000`

### Frontend Setup

1. For development, I use Live Server extension in VS Code. You can also use any local server.
2. Make sure the backend is running first!
3. Open `index.html` (root) or `frontend/index.html` in your browser

Note: The live version uses GitHub Pages for frontend and Render for backend/database, so you don't need to set this up if you just want to use the app.

---

## API Endpoints

The backend API is at:
```
http://localhost:3000/api
```

(Or use the Render URL if you're using the deployed version)

### Authentication
- `POST /api/auth/register` - Register new user (requires student_id)
- `POST /api/auth/login` - Login

### Tasks
- `GET /api/tasks` - Get all tasks (with assignee names)
- `POST /api/tasks` - Create a task (supports status, assignee_id, team_id)
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Teams
- `POST /api/teams` - Create a team (generates unique 6-character code)
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details with members
- `POST /api/teams/:id/join` - Join a team by ID
- `POST /api/teams/join-by-code` - Join a team using team code
- `GET /api/users/:id/teams` - Get all teams for a user
- `GET /api/teams/:id/members` - Get team members

### Users
- `GET /api/users` - Get all users (for task assignment)

### Health Check
- `GET /api/health` - Check if server is running

For more details, check `Documentation.txt`.

---

## How to Use It

### Register
1. Open the app
2. Fill in name, email, Student ID (8-12 digits), and password
3. Click Register
4. Then you can login

### Login
1. Enter your email and password
2. Click Login
3. You'll go to the dashboard

### Create a Task
1. Go to "Projects" in the nav
2. Click the "+" button or "+ Add a Task" in any column
3. Fill in the form:
   - Title (required)
   - Description (optional)
   - Status (Pending, In Progress, or Completed - defaults to Pending)
   - Assign To (optional - select a team member)
   - Team (optional - link to a team you're part of)
   - Time estimate (optional)
   - Tags (comma separated, optional)
4. Click "Add Task"

### Manage Tasks
- **Change Status**: Use the status dropdown on any task card (Pending → In Progress → Completed)
- **Complete**: Just check the checkbox (automatically sets to Completed)
- **View Completed**: Go to the Completed section
- **Delete**: Click the three dots (⋯) and confirm
- **Assign Tasks**: Select an assignee when creating or editing tasks

### Create or Join a Team
1. Go to "Teams" in the sub-navigation
2. **To Create**: Click "+ Create Team", enter name and description, then create
3. **To Join**: Click "Join Team", enter the 6-character team code, then join
4. View team details to see all members and copy the team code to share

### Navigation
- **Start**: Welcome page with feature overview
- **Projects**: Main task board (kanban by category)
- **Overview**: Task stats and assigned tasks by team member
- **Teams**: View and manage your teams
- **Completed**: Done tasks
- **Milestones**: Milestone stuff (work in progress)
- **Planning**: Planning section with tips (also work in progress)

---

## Security Stuff

I tried to implement some basic security:
- **Password Hashing**: Using bcryptjs with 10 salt rounds
- **Input Validation**: Server checks all inputs
- **SQL Injection Prevention**: Using parameterized queries
- **CORS**: Configured for API access
- **Authentication**: Basic auth system (JWT is on my todo list)

---

## Testing

I tested:
- Registration and login
- Creating, updating, deleting tasks
- Task completion
- UI interactions
- API endpoints (using Thunder Client)
- Some error cases

There might be bugs I haven't found yet though!

---

## Design

I went for a simple, minimal look:
- Clean interface
- Purple-ish color scheme (#6366f1)
- Card design for tasks
- Some hover effects and transitions
- Tried to make it responsive

---

## How I Built This

### Phase 1: Planning
- Figured out what I needed
- Designed the database
- Planned the API
- Sketched out the UI

### Phase 2: Backend
- Set up Express
- Built authentication with student ID validation
- Created API endpoints (auth, tasks, teams, users)
- Connected to PostgreSQL
- Added password hashing
- Implemented team system with code-based joining
- Added task assignment functionality
- Created status enum for tasks

### Phase 3: Frontend
- Made login/registration pages (with Student ID field)
- Built the dashboard with multiple views
- Created the task board (kanban-style)
- Added modals and navigation
- Implemented team management UI
- Added task assignment dropdowns
- Created status management with dropdowns
- Built assigned tasks display grouped by member

### Phase 4: Collaboration Features
- Added team creation and joining system
- Implemented team code functionality
- Built task assignment to team members
- Created status management (Pending, In Progress, Completed)
- Added team members display
- Built assigned tasks view grouped by member

### Phase 5: Testing & Fixes
- Connected everything together
- Tested all features (teams, assignments, status)
- Fixed bugs (there were a lot)
- Made UI improvements (removed emojis, improved navigation)
- Optimized database connections for local development

---

## Things I Want to Add Later

- [ ] Proper JWT tokens (right now it's basic)
- [x] Assign tasks to specific users 
- [x] Team collaboration features 
- [x] Task status management 
- [X] Due dates for tasks
- [X] Task priorities
- [ ] File uploads
- [ ] Comments on tasks (the field exists but UI not built yet)
- [ ] Search and filter
- [ ] Drag and drop to reorder
- [ ] Dark mode
- [ ] Maybe a mobile app
- [ ] Real-time updates with WebSockets

---

## License

This is my final exam for my web technologies class.

---

## About Me

**Cyril Michael Dagher**  
Student ID: 10012300026

---

## More Documentation

If you want more technical details, check out `Documentation.txt`. It has:
- System architecture
- Database schema
- Full API docs
- Implementation details
- Problems I ran into and how I solved them
- Testing stuff

---

**Note:** This is a school project, so it's not perfect. But I learned a lot building it!
