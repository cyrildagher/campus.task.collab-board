// dashboard navigation and UI functionality

// switch main navigation views
function switchMainView(viewName) {
  // Hide all main views
  const allMainViews = ['startView', 'projectsView', 'planningView'];
  allMainViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // Hide all sub-views when switching main views
  const allSubViews = ['tasksView', 'overviewView', 'milestonesView', 'completedView', 'teamsView'];
  allSubViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // Hide/show secondary nav based on view
  const secondaryNav = document.querySelector('.secondary-nav');
  if (viewName === 'start') {
    if (secondaryNav) {
      secondaryNav.style.display = 'none';
    }
  } else {
    if (secondaryNav) {
      secondaryNav.style.display = 'block';
    }
  }
  
  // Remove active class from all main nav links
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Remove active class from all sub nav links
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Show selected main view
  const viewElement = document.getElementById(viewName + 'View');
  if (viewElement) {
    viewElement.style.display = 'block';
  }
  
  // Add active class to clicked nav link
  const activeLink = document.querySelector(`[data-main-view="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Load view-specific content
  if (viewName === 'planning') {
    loadPlanningView();
  } else if (viewName === 'projects') {
    // Show tasks view by default when switching to projects
    // Set active sub-nav link
    const tasksSubLink = document.querySelector('[data-view="tasks"]');
    if (tasksSubLink) {
      tasksSubLink.classList.add('active');
    }
    // Show projects view (which contains the kanban board)
    const projectsView = document.getElementById('projectsView');
    if (projectsView) {
      projectsView.style.display = 'block';
    }
    // Re-setup add task buttons when switching to projects view
    setTimeout(() => {
      if (typeof setupAddTaskButtons === 'function') {
        setupAddTaskButtons();
      }
      if (typeof renderTasks === 'function') {
        renderTasks();
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
  
  // Update status-based counts
  const total = tasks.length;
  const completed = tasks.filter(t => {
    const status = t.status || (t.completed ? 'Completed' : 'Pending');
    return status === 'Completed';
  }).length;
  const inProgress = tasks.filter(t => {
    const status = t.status || (t.completed ? 'Completed' : 'Pending');
    return status === 'In Progress';
  }).length;
  const pending = tasks.filter(t => {
    const status = t.status || (t.completed ? 'Completed' : 'Pending');
    return status === 'Pending';
  }).length;
  
  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;
  
  // category breakdown
  const categories = ['Academics', 'Recreational', 'Sports', 'Events'];
  const breakdown = document.getElementById('categoryBreakdown');
  breakdown.innerHTML = '';
  
  categories.forEach(cat => {
    const count = tasks.filter(t => {
      const status = t.status || (t.completed ? 'Completed' : 'Pending');
      return t.category === cat && status !== 'Completed';
    }).length;
    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.innerHTML = `
      <span class="breakdown-category">${cat}</span>
      <span class="breakdown-count">${count} tasks</span>
    `;
    breakdown.appendChild(item);
  });
  
  // Load assigned tasks by team member
  await loadAssignedTasksByMember();
};

// Load assigned tasks grouped by team member
async function loadAssignedTasksByMember() {
  try {
    const tasks = await tasksAPI.getAll();
    const users = await usersAPI.getAll();
    
    // Filter tasks that have assignees
    const assignedTasks = tasks.filter(t => t.assignee_id);
    
    // Group by assignee
    const tasksByMember = {};
    assignedTasks.forEach(task => {
      const assigneeId = task.assignee_id;
      if (!tasksByMember[assigneeId]) {
        const user = users.find(u => u.id === assigneeId);
        tasksByMember[assigneeId] = {
          user: user || { name: 'Unknown', email: 'N/A' },
          tasks: []
        };
      }
      tasksByMember[assigneeId].tasks.push(task);
    });
    
    // Create or update the assigned tasks section
    let assignedSection = document.getElementById('assignedTasksSection');
    if (!assignedSection) {
      assignedSection = document.createElement('div');
      assignedSection.id = 'assignedTasksSection';
      assignedSection.className = 'category-breakdown';
      assignedSection.style.marginTop = '24px';
      const overviewView = document.getElementById('overviewView');
      if (overviewView) {
        overviewView.querySelector('.completed-container').appendChild(assignedSection);
      }
    }
    
    if (Object.keys(tasksByMember).length === 0) {
      assignedSection.innerHTML = `
        <h3>Assigned Tasks by Team Member</h3>
        <p style="color: #6b7280; padding: 20px;">No tasks have been assigned to team members yet.</p>
      `;
      return;
    }
    
    assignedSection.innerHTML = `
      <h3>Assigned Tasks by Team Member</h3>
      <div class="assigned-tasks-list">
        ${Object.values(tasksByMember).map(memberData => {
          const statusCounts = {
            Pending: memberData.tasks.filter(t => {
              const status = t.status || (t.completed ? 'Completed' : 'Pending');
              return status === 'Pending';
            }).length,
            'In Progress': memberData.tasks.filter(t => {
              const status = t.status || (t.completed ? 'Completed' : 'Pending');
              return status === 'In Progress';
            }).length,
            Completed: memberData.tasks.filter(t => {
              const status = t.status || (t.completed ? 'Completed' : 'Pending');
              return status === 'Completed';
            }).length
          };
          
          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                  <div style="font-weight: 500; font-size: 16px;">${memberData.user.name}</div>
                  <div style="font-size: 12px; color: #6b7280;">${memberData.user.email}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 14px; font-weight: 500;">${memberData.tasks.length} task${memberData.tasks.length !== 1 ? 's' : ''}</div>
                  <div style="font-size: 11px; color: #6b7280;">
                    ${statusCounts.Pending} Pending • ${statusCounts['In Progress']} In Progress • ${statusCounts.Completed} Completed
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${memberData.tasks.slice(0, 5).map(task => {
                  const status = task.status || (task.completed ? 'Completed' : 'Pending');
                  const statusColor = status === 'Completed' ? '#10b981' : status === 'In Progress' ? '#3b82f6' : '#6b7280';
                  return `
                    <div style="padding: 6px 10px; background: #f3f4f6; border-radius: 4px; font-size: 12px; border-left: 3px solid ${statusColor};">
                      ${task.title}
                    </div>
                  `;
                }).join('')}
                ${memberData.tasks.length > 5 ? `<span style="font-size: 11px; color: #6b7280; padding: 6px 10px;">+${memberData.tasks.length - 5} more</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load assigned tasks:', error);
  }
}

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
      e.stopPropagation();
      const view = link.getAttribute('data-main-view');
      if (view) {
        switchMainView(view);
      }
    });
  });
  
  // setup sub-navigation (Overview, Tasks, Teams, etc.)
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const view = link.getAttribute('data-view');
      if (view && typeof switchView === 'function') {
        switchView(view);
      }
    });
  });
  
  // setup logo click to go to start view
  const logoLink = document.getElementById('logoLink');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchMainView('start');
    });
  }
  
  // setup user dropdown
  setupUserDropdown();
  
  // setup search
  setupSearch();
  
  // setup add button
  setupAddButton();
  
  // default to start view, but show secondary nav for projects
  const secondaryNav = document.querySelector('.secondary-nav');
  if (secondaryNav) {
    secondaryNav.style.display = 'none';
  }
  switchMainView('start');
});

