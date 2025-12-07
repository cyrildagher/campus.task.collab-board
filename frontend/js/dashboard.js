// dashboard stuff - navigation and ui

// switch between main views (start, projects, planning)
function switchMainView(viewName) {
  // hide everything first
  const allMainViews = ['startView', 'projectsView', 'planningView'];
  allMainViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // also hide sub views
  const allSubViews = ['tasksView', 'overviewView', 'milestonesView', 'completedView', 'teamsView'];
  allSubViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // show/hide the secondary nav bar
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
  
  // remove active styling from nav
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // remove active from sub nav too
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // show the view we want
  const viewElement = document.getElementById(viewName + 'View');
  if (viewElement) {
    viewElement.style.display = 'block';
  }
  
  // highlight the clicked link
  const activeLink = document.querySelector(`[data-main-view="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // load content for the view
  if (viewName === 'planning') {
    loadPlanningView();
  } else if (viewName === 'projects') {
    // default to tasks view when going to projects
    // highlight tasks link
    const tasksSubLink = document.querySelector('[data-view="tasks"]');
    if (tasksSubLink) {
      tasksSubLink.classList.add('active');
    }
    // show projects view (has the kanban board)
    const projectsView = document.getElementById('projectsView');
    if (projectsView) {
      projectsView.style.display = 'block';
    }
    // re-setup buttons when switching to projects (sometimes they break)
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

// load overview stats (used by tasks.js)
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
  
  // count tasks by status
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
  
  // show tasks by category
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
  
  // show tasks assigned to each team member
  await loadAssignedTasksByMember();
};

// show tasks grouped by who theyre assigned to
async function loadAssignedTasksByMember() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      console.error('No user ID found');
      return;
    }
    const tasks = await tasksAPI.getAll(user.id);
    const users = await usersAPI.getAll();
    
    // only show tasks that are assigned to someone
    const assignedTasks = tasks.filter(t => t.assignee_id);
    
    // group them by who theyre assigned to
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
    
    // create the section to show assigned tasks
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

// load the planning page
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
  
  // show first 5 tasks (dont want to show too many)
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

// user menu dropdown
function setupUserDropdown() {
  const userMenu = document.getElementById('userMenu');
  const dropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email || '';
  }
  
  // show/hide dropdown
  userMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.style.display === 'none') {
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  });
  
  // close if clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  // handle logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
}

// search (basic implementation, could be better)
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

// add button (opens task modal)
function setupAddButton() {
  const addBtn = document.querySelector('.icon-btn[title="Add"]');
  addBtn.addEventListener('click', () => {
    // go to projects and open modal
    switchMainView('projects');
    setTimeout(() => {
      // open add task modal (needs to be exposed from tasks.js)
      const firstAddBtn = document.querySelector('.add-btn');
      if (firstAddBtn) {
        firstAddBtn.click();
      }
    }, 100);
  });
}

// setup everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  // handle main nav clicks
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
  
  // handle sub nav clicks
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
  
  // logo goes back to start page
  const logoLink = document.getElementById('logoLink');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchMainView('start');
    });
  }
  
  // setup user menu
  setupUserDropdown();
  
  // setup search button
  setupSearch();
  
  // setup add button
  setupAddButton();
  
  // start on start page, hide secondary nav
  const secondaryNav = document.querySelector('.secondary-nav');
  if (secondaryNav) {
    secondaryNav.style.display = 'none';
  }
  switchMainView('start');
});

