// dashboard navigation and UI functionality

// switch main navigation views
function switchMainView(viewName) {
  // hide all main views
  document.getElementById('startView').style.display = 'none';
  document.getElementById('projectsView').style.display = 'none';
  document.getElementById('planningView').style.display = 'none';
  
  // hide secondary nav for start view
  const secondaryNav = document.querySelector('.secondary-nav');
  if (viewName === 'start') {
    secondaryNav.style.display = 'none';
  } else {
    secondaryNav.style.display = 'block';
  }
  
  // remove active class from all nav links
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // show selected view
  const viewElement = document.getElementById(viewName + 'View');
  if (viewElement) {
    viewElement.style.display = 'block';
  }
  
  // add active class to clicked nav link
  const activeLink = document.querySelector(`[data-main-view="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // load view-specific content
  if (viewName === 'planning') {
    loadPlanningView();
  } else if (viewName === 'projects') {
    // show tasks view by default when switching to projects
    switchView('tasks');
    // re-setup add task buttons when switching to projects view
    setTimeout(() => {
      if (typeof setupAddTaskButtons === 'function') {
        setupAddTaskButtons();
      }
    }, 100);
  }
}

// load overview statistics (exposed globally for tasks.js)
window.loadOverviewStats = async function() {
  // get tasks from API or localStorage
  let tasks = [];
  try {
    if (typeof getTasks === 'function') {
      tasks = await getTasks();
    } else {
      tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    }
  } catch (error) {
    tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  }
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  
  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;
  
  // category breakdown
  const categories = ['Academics', 'Recreational', 'Sports', 'Events'];
  const breakdown = document.getElementById('categoryBreakdown');
  breakdown.innerHTML = '';
  
  categories.forEach(cat => {
    const count = tasks.filter(t => t.category === cat && !t.completed).length;
    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.innerHTML = `
      <span class="breakdown-category">${cat}</span>
      <span class="breakdown-count">${count} tasks</span>
    `;
    breakdown.appendChild(item);
  });
};

// load planning view
async function loadPlanningView() {
  // get tasks from API or localStorage
  let tasks = [];
  try {
    if (typeof getTasks === 'function') {
      tasks = await getTasks();
    } else {
      tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    }
  } catch (error) {
    tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  }
  const pending = tasks.filter(t => !t.completed);
  const upcoming = document.getElementById('upcomingTasks');
  
  upcoming.innerHTML = '';
  
  if (pending.length === 0) {
    upcoming.innerHTML = '<p style="color: #6b7280; padding: 20px;">No pending tasks. Great job!</p>';
    return;
  }
  
  // show first 5 pending tasks
  pending.slice(0, 5).forEach(task => {
    const item = document.createElement('div');
    item.className = 'upcoming-item';
    item.innerHTML = `
      <div class="upcoming-info">
        <h4>${task.title}</h4>
        <p>${task.category} • Est. ${task.time}</p>
      </div>
    `;
    upcoming.appendChild(item);
  });
}

// user dropdown functionality
function setupUserDropdown() {
  const userMenu = document.getElementById('userMenu');
  const dropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // load user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email || '';
  }
  
  // toggle dropdown
  userMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.style.display === 'none') {
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  });
  
  // close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  // logout functionality
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
}

// search functionality
function setupSearch() {
  const searchBtn = document.querySelector('.icon-btn[title="Search"]');
  searchBtn.addEventListener('click', () => {
    const query = prompt('Search for tasks:');
    if (query) {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const results = tasks.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length > 0) {
        alert(`Found ${results.length} task(s):\n${results.map(t => `- ${t.title}`).join('\n')}`);
      } else {
        alert('No tasks found matching your search.');
      }
    }
  });
}

// add button functionality
function setupAddButton() {
  const addBtn = document.querySelector('.icon-btn[title="Add"]');
  addBtn.addEventListener('click', () => {
    // switch to projects view and show modal
    switchMainView('projects');
    setTimeout(() => {
      // trigger add task modal (this would need to be exposed from tasks.js)
      const firstAddBtn = document.querySelector('.add-btn');
      if (firstAddBtn) {
        firstAddBtn.click();
      }
    }, 100);
  });
}

// initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  // setup main navigation
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-main-view');
      if (view) {
        switchMainView(view);
      }
    });
  });
  
  // setup user dropdown
  setupUserDropdown();
  
  // setup search
  setupSearch();
  
  // setup add button
  setupAddButton();
  
  // default to start view, but show secondary nav for projects
  const secondaryNav = document.querySelector('.secondary-nav');
  secondaryNav.style.display = 'none';
  switchMainView('start');
});

