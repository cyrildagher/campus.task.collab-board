# Campus Task Collaboration Board

A task management web app I built for managing tasks around campus. This was my project for the web technologies class - basically a simple board where you can organize tasks by category.

**Made by:** Cyril Michael Dagher  
**Student ID:** 10012300026

**Live Demo:** [https://cyrildagher.github.io/campus.task.collab-board/](https://cyrildagher.github.io/campus.task.collab-board/)

---

## What This Project Is About

So this is basically a task management system where students and staff can create and organize tasks. I tried to keep the design simple and clean - nothing too fancy, just something that works well. You can create tasks, put them in different categories, mark them as done, and delete them if needed.

---

## Features

### Login/Registration
- You can register and login (Students only - requires Student ID)
- Student ID validation (8-12 digits required)
- Passwords are hashed with bcryptjs (learned this in class!)
- You need to be logged in to use the app

### Task Stuff
- **Create Tasks**: Add tasks with title, description, category, tags, time estimates, status, assignee, and team
- **Task Status**: Three statuses available - Pending, In Progress, Completed
- **Task Assignment**: Assign tasks to team members
- **Board View**: Tasks are organized in 4 categories:
  - Academics
  - Recreational
  - Sports
  - Events
- **Complete Tasks**: Just check the box or change status dropdown
- **Delete Tasks**: There's a delete button with a confirmation popup
- **Completed Section**: All your done tasks go here

### Teams & Collaboration
- **Create Teams**: Create project teams with name and description
- **Join Teams**: Join existing teams
- **Team Members**: View all team members with their roles (Admin/Member)
- **Team Dashboard**: See all teams you're part of
- **Assigned Tasks**: View tasks assigned to each team member in the Overview section

### Dashboard
- **Overview**: Shows stats about your tasks and assigned tasks grouped by team member
- **Projects**: This is the main board where you manage tasks
- **Teams**: View and manage your teams
- **Completed**: See all your completed tasks
- **Milestones**: Track milestones (still working on this)
- **Planning**: Planning section (also still working on it)
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
- **`js/api.js`** - Handles all API calls
- **`js/auth.js`** - Login/registration logic
- **`js/tasks.js`** - Task creation and management
- **`js/dashboard.js`** - Dashboard navigation and UI stuff

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
   
   c. Run the setup script to create tables and indexes:
      ```bash
      psql -U your_username -d campus_task_db -f setup_local_db.sql
      ```
      Or open `backend/setup_local_db.sql` in pgAdmin and run it.
   
   **Note:** Using a local database will be MUCH faster than connecting to the remote Render database. The connection will automatically detect local vs remote and disable SSL for local connections.
   
   **For Production/Remote:**
   - The default connection string points to Render's database
   - Set `DATABASE_URL` environment variable to your remote database URL
   - SSL will be automatically enabled for remote connections

5. Start the server (for local development):
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
- `POST /api/teams` - Create a team
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details with members
- `POST /api/teams/:id/join` - Join a team
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
2. Fill in name, email, and password
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
   - Time estimate (optional)
   - Tags (comma separated, optional)
4. Click "Add Task"

### Manage Tasks
- **Complete**: Just check the checkbox
- **View Completed**: Go to the Completed section
- **Delete**: Click the three dots (⋯) and confirm

### Navigation
- **Start**: Welcome page
- **Projects**: Main task board
- **Overview**: Task stats
- **Completed**: Done tasks
- **Milestones**: Milestone stuff (work in progress)
- **Planning**: Planning section (also work in progress)

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
- Built authentication
- Created API endpoints
- Connected to PostgreSQL
- Added password hashing

### Phase 3: Frontend
- Made login/registration pages
- Built the dashboard
- Created the task board
- Added modals and navigation

### Phase 4: Testing & Fixes
- Connected everything together
- Tested features
- Fixed bugs (there were a lot)
- Made some UI improvements

---

## Things I Want to Add Later

- [ ] Proper JWT tokens (right now it's basic)
- [ ] Assign tasks to specific users
- [ ] Due dates for tasks
- [ ] Task priorities
- [ ] File uploads
- [ ] Comments on tasks
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
