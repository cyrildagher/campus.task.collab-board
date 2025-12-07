// check if user is logged in
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// categories for the board
const categories = ['Academics', 'Recreational', 'Sports', 'Events'];

// get tasks from API (with localStorage fallback)
async function getTasks() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      console.error('No user ID found in localStorage');
      return [];
    }
    const tasks = await tasksAPI.getAll(user.id);
    return tasks;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    // fallback to localStorage if API fails
    const tasks = localStorage.getItem('tasks');
    if (!tasks) {
      return [];
    }
    return JSON.parse(tasks);
  }
}

// save tasks to API (with localStorage fallback)
async function saveTasks(tasks) {
  // for now, just save to localStorage as backup
  // in a real app, you'd sync with the backend
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// get tag class based on tag name
function getTagClass(tag) {
  const tagMap = {
    'High Priority': 'tag-yellow',
    'Due Soon': 'tag-green',
    'Planning': 'tag-green',
    'Social': 'tag-purple-light',
    'Entertainment': 'tag-purple',
    'Urgent': 'tag-yellow',
    'Regular': 'tag-green',
    'Major Event': 'tag-teal',
    'Important': 'tag-yellow'
  };
  return tagMap[tag] || 'tag-green';
}

// create a task card element
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.taskId = task.id;

  const tagsHtml = task.tags.map(tag => 
    `<span class="tag ${getTagClass(tag)}">${tag}</span>`
  ).join('');

  const status = task.status || (task.completed ? 'Completed' : 'Pending');
  const isCompleted = status === 'Completed';
  
  card.innerHTML = `
    <div class="task-header">
      <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''}>
      <h4>${task.title}</h4>
      <span class="task-menu">⋯</span>
    </div>
    <p class="task-desc">${task.description}</p>
    <div class="task-tags">
      ${tagsHtml}
    </div>
    <div class="task-footer" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <select class="task-status-select" style="padding: 2px 6px; border-radius: 4px; font-size: 11px; border: 1px solid #d1d5db; background: ${status === 'Completed' ? '#10b981' : status === 'In Progress' ? '#3b82f6' : '#6b7280'}; color: white;">
        <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>Completed</option>
      </select>
      ${task.assignee_name ? `<div class="task-assignee" style="font-size: 11px; color: #6b7280;">Assigned: ${task.assignee_name}</div>` : ''}
      <div class="task-comments">
        <span>Comments: ${task.comments || 0}</span>
      </div>
      <div class="task-time">Time: ${task.time}</div>
    </div>
  `;

  // handle checkbox click
  const checkbox = card.querySelector('.task-checkbox');
  checkbox.addEventListener('change', async () => {
    try {
      const newStatus = checkbox.checked ? 'Completed' : 'Pending';
      await tasksAPI.update(task.id, { status: newStatus });
      renderTasks();
      renderCompletedTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      // fallback to localStorage
      const tasks = await getTasks();
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].status = checkbox.checked ? 'Completed' : 'Pending';
        saveTasks(tasks);
        renderTasks();
        renderCompletedTasks();
      }
    }
  });

  // handle status change
  const statusSelect = card.querySelector('.task-status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', async (e) => {
      try {
        const newStatus = e.target.value;
        await tasksAPI.update(task.id, { status: newStatus });
        renderTasks();
        renderCompletedTasks();
      } catch (error) {
        console.error('Failed to update task status:', error);
        alert('Failed to update task status. Please try again.');
      }
    });
  }

  // handle menu click (delete task)
  const menu = card.querySelector('.task-menu');
  menu.addEventListener('click', () => {
    showDeleteModal(task.id);
  });

  return card;
}

// render all tasks on the board
async function renderTasks() {
  const tasks = await getTasks();
  
  categories.forEach(category => {
    const column = Array.from(document.querySelectorAll('.column')).find(
      col => col.querySelector('.column-header span').textContent === category
    );
    
    if (!column) return;
    
    const taskList = column.querySelector('.task-list');
    taskList.innerHTML = '';
    
    // Filter tasks by category and status (show Pending and In Progress, not Completed)
    const categoryTasks = tasks.filter(t => {
      const status = t.status || (t.completed ? 'Completed' : 'Pending');
      return t.category === category && status !== 'Completed';
    });
    categoryTasks.forEach(task => {
      taskList.appendChild(createTaskCard(task));
    });
  });
}

// render completed tasks
async function renderCompletedTasks() {
  const tasks = await getTasks();
  const completedTasks = tasks.filter(t => t.status === 'Completed' || t.completed);
  const completedList = document.getElementById('completedTasksList');
  
  completedList.innerHTML = '';
  
  if (completedTasks.length === 0) {
    completedList.innerHTML = '<p style="color: #6b7280; padding: 20px;">No completed tasks yet.</p>';
    return;
  }
  
  completedTasks.forEach(task => {
    completedList.appendChild(createTaskCard(task));
  });
}

// handle add task button clicks using event delegation
// Set up once on document, works for all views
let addTaskButtonsSetup = false;

function setupAddTaskButtons() {
  if (addTaskButtonsSetup) return; // only set up once
  
  // use event delegation on document so it works everywhere
  document.addEventListener('click', function(e) {
    // check if clicked element is an add button
    if (e.target.classList.contains('add-btn') || e.target.classList.contains('add-card-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const column = e.target.closest('.column');
      if (!column) {
        console.log('No column found for add button');
        return;
      }
      
      const categorySpan = column.querySelector('.column-header span');
      if (categorySpan) {
        const category = categorySpan.textContent;
        console.log('Opening modal for category:', category);
        addNewTask(category);
      } else {
        console.log('No category span found');
      }
    }
  });
  
  addTaskButtonsSetup = true;
}

// expose globally for dashboard.js
window.setupAddTaskButtons = setupAddTaskButtons;

// show modal for adding new task
function showTaskModal(category) {
  console.log('showTaskModal called with category:', category);
  const modal = document.getElementById('taskModal');
  if (!modal) {
    console.error('Modal element not found!');
    return;
  }
  
  const form = document.getElementById('taskForm');
  const categoryInput = document.getElementById('taskCategory');
  
  if (categoryInput) {
    categoryInput.value = category;
  }
  if (form) {
    form.reset();
  }
  modal.style.display = 'flex';
  console.log('Modal should be visible now');
}

// expose globally
window.showTaskModal = showTaskModal;

// close modal
function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.style.display = 'none';
  }
  const form = document.getElementById('taskForm');
  if (form) {
    form.reset();
  }
}

// expose globally
window.closeTaskModal = closeTaskModal;

// add a new task
function addNewTask(category) {
  console.log('addNewTask called with category:', category);
  showTaskModal(category);
}

// expose globally
window.addNewTask = addNewTask;

// show delete confirmation modal
let taskToDelete = null;

function showDeleteModal(taskId) {
  taskToDelete = taskId;
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.style.display = 'flex';
  }
}

// close delete modal
function closeDeleteModal() {
  taskToDelete = null;
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.style.display = 'none';
  }
}

// expose globally
window.showDeleteModal = showDeleteModal;
window.closeDeleteModal = closeDeleteModal;

// switch between views (for Projects sub-navigation)
function switchView(viewName) {
  // First, ensure we're in the projects main view
  if (typeof switchMainView === 'function') {
    const projectsMainView = document.getElementById('projectsView');
    if (projectsMainView && projectsMainView.style.display === 'none') {
      // Switch to projects main view first
      switchMainView('projects');
    }
  }
  
  // Hide all project sub-views
  const projectSubViews = ['overviewView', 'milestonesView', 'completedView', 'teamsView'];
  projectSubViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // Show/hide the projectsView kanban board based on view
  const projectsView = document.getElementById('projectsView');
  if (projectsView) {
    if (viewName === 'tasks') {
      // Show the kanban board for tasks view
      projectsView.style.display = 'block';
    } else {
      // Hide the kanban board for other sub-views
      projectsView.style.display = 'none';
    }
  }
  
  // Remove active class from all sub-nav links
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Show selected sub-view (if not tasks, which uses projectsView)
  if (viewName !== 'tasks') {
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
      viewElement.style.display = 'block';
    }
  }
  
  // Add active class to clicked nav link
  const activeLink = document.querySelector(`[data-view="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Render content based on view
  if (viewName === 'completed') {
    renderCompletedTasks();
  } else if (viewName === 'overview') {
    if (typeof loadOverviewStats === 'function') {
      loadOverviewStats();
    }
  } else if (viewName === 'teams') {
    if (typeof renderTeams === 'function') {
      renderTeams();
    }
  } else if (viewName === 'tasks') {
    // Re-render tasks when switching back to tasks view
    renderTasks();
  }
}

// expose globally for dashboard.js
window.switchView = switchView;

// initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  setupAddTaskButtons();
  
  // setup view switching
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      if (view) {
        switchView(view);
      }
    });
  });
  
  // setup modal
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  const closeBtn = document.querySelector('.close-modal');
  const cancelBtn = document.querySelector('.btn-cancel');
  
  // close modal when clicking X or cancel
  closeBtn.addEventListener('click', closeTaskModal);
  cancelBtn.addEventListener('click', closeTaskModal);
  
  // close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeTaskModal();
    }
    // also handle delete modal
    const deleteModal = document.getElementById('deleteModal');
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
  
  // setup delete modal
  const deleteModal = document.getElementById('deleteModal');
  const cancelDeleteBtn = document.querySelector('.btn-cancel-delete');
  const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (taskToDelete) {
        try {
          await tasksAPI.delete(taskToDelete);
          renderTasks();
          renderCompletedTasks();
          closeDeleteModal();
        } catch (error) {
          console.error('Failed to delete task:', error);
          alert('Failed to delete task. Please try again.');
          // fallback to localStorage
          const tasks = await getTasks();
          const filtered = tasks.filter(t => t.id !== taskToDelete);
          saveTasks(filtered);
          renderTasks();
          renderCompletedTasks();
          closeDeleteModal();
        }
      }
    });
  }
  
  // Load users and teams for dropdowns
  async function loadTaskFormData() {
    try {
      const users = await usersAPI.getAll();
      const assigneeSelect = document.getElementById('taskAssignee');
      if (assigneeSelect) {
        assigneeSelect.innerHTML = '<option value="">Unassigned</option>';
        users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = `${user.name} (${user.student_id || user.email})`;
          assigneeSelect.appendChild(option);
        });
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        const userTeams = await teamsAPI.getUserTeams(user.id);
        const teamSelect = document.getElementById('taskTeam');
        if (teamSelect) {
          teamSelect.innerHTML = '<option value="">No Team</option>';
          userTeams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  }

  // Load form data when modal opens
  const originalShowTaskModal = window.showTaskModal;
  window.showTaskModal = function(category) {
    originalShowTaskModal(category);
    loadTaskFormData();
  };

  // handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const time = document.getElementById('taskTime').value.trim() || '1h 00m';
    const tagsInput = document.getElementById('taskTags').value.trim();
    const category = document.getElementById('taskCategory').value;
    const status = document.getElementById('taskStatus').value || 'Pending';
    const assigneeId = document.getElementById('taskAssignee').value || null;
    const teamId = document.getElementById('taskTeam').value || null;
    
    if (!title) {
      alert('Please enter a task title');
      return;
    }
    
    // parse tags from comma-separated string
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('You must be logged in to create tasks');
      return;
    }
    
    const newTask = {
      title: title,
      description: description,
      category: category,
      tags: tags,
      time: time,
      status: status,
      assignee_id: assigneeId ? parseInt(assigneeId) : null,
      team_id: teamId ? parseInt(teamId) : null,
      user_id: user.id
    };
    
    try {
      await tasksAPI.create(newTask);
      renderTasks();
      closeTaskModal();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  });
});

