// redirect to login if not logged in
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// the 4 categories for tasks
const categories = ['Academics', 'Recreational', 'Sports', 'Events'];

// get tasks from api, falls back to localStorage if api fails
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
    // if api fails use localStorage as backup
    const tasks = localStorage.getItem('tasks');
    if (!tasks) {
      return [];
    }
    return JSON.parse(tasks);
  }
}

// save tasks (just to localStorage for now)
async function saveTasks(tasks) {
  // saving to localStorage as backup
  // todo: actually sync with backend properly
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// returns css class for tag colors
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

// creates the html for a task card
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

  // when checkbox is clicked, update status
  const checkbox = card.querySelector('.task-checkbox');
  checkbox.addEventListener('change', async () => {
    try {
      const newStatus = checkbox.checked ? 'Completed' : 'Pending';
      await tasksAPI.update(task.id, { status: newStatus });
      renderTasks();
      renderCompletedTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      // use localStorage if update fails
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

  // when status dropdown changes
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

  // three dots menu for deleting
  const menu = card.querySelector('.task-menu');
  menu.addEventListener('click', () => {
    showDeleteModal(task.id);
  });

  return card;
}

// show all tasks on the kanban board
async function renderTasks() {
  const tasks = await getTasks();
  
  categories.forEach(category => {
    const column = Array.from(document.querySelectorAll('.column')).find(
      col => col.querySelector('.column-header span').textContent === category
    );
    
    if (!column) return;
    
    const taskList = column.querySelector('.task-list');
    taskList.innerHTML = '';
    
    // only show pending and in progress, completed goes to completed section
    const categoryTasks = tasks.filter(t => {
      const status = t.status || (t.completed ? 'Completed' : 'Pending');
      return t.category === category && status !== 'Completed';
    });
    categoryTasks.forEach(task => {
      taskList.appendChild(createTaskCard(task));
    });
  });
}

// show completed tasks in the completed section
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

// handle add task buttons - using event delegation so it works everywhere
// only set up once, works for all views
let addTaskButtonsSetup = false;

function setupAddTaskButtons() {
  if (addTaskButtonsSetup) return; // only set up once
  
  // event delegation so buttons work even if added dynamically
  document.addEventListener('click', function(e) {
    // check if what was clicked is an add button
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

// make available globally for dashboard.js
window.setupAddTaskButtons = setupAddTaskButtons;

// open the add task modal
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

// make available globally
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

// make available globally
window.closeTaskModal = closeTaskModal;

// open modal to add new task
function addNewTask(category) {
  console.log('addNewTask called with category:', category);
  showTaskModal(category);
}

// make available globally
window.addNewTask = addNewTask;

// show delete confirmation popup
let taskToDelete = null;

function showDeleteModal(taskId) {
  taskToDelete = taskId;
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.style.display = 'flex';
  }
}

// close delete popup
function closeDeleteModal() {
  taskToDelete = null;
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.style.display = 'none';
  }
}

// make available globally
window.showDeleteModal = showDeleteModal;
window.closeDeleteModal = closeDeleteModal;

// switch between different views in projects section
function switchView(viewName) {
  // make sure we're in projects view first
  if (typeof switchMainView === 'function') {
    const projectsMainView = document.getElementById('projectsView');
    if (projectsMainView && projectsMainView.style.display === 'none') {
      // go to projects view
      switchMainView('projects');
    }
  }
  
  // hide all sub views
  const projectSubViews = ['overviewView', 'milestonesView', 'completedView', 'teamsView'];
  projectSubViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // show/hide the kanban board
  const projectsView = document.getElementById('projectsView');
  if (projectsView) {
    if (viewName === 'tasks') {
      // show kanban board for tasks
      projectsView.style.display = 'block';
    } else {
      // hide kanban for other views
      projectsView.style.display = 'none';
    }
  }
  
  // remove active styling from all nav links
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // show the selected view (tasks uses projectsView so skip it)
  if (viewName !== 'tasks') {
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
      viewElement.style.display = 'block';
    }
  }
  
  // highlight the clicked nav link
  const activeLink = document.querySelector(`[data-view="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // load content for the view
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
    // refresh tasks when going back to tasks view
    renderTasks();
  }
}

// make available globally for dashboard.js
window.switchView = switchView;

// run when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  setupAddTaskButtons();
  
  // handle view switching
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      if (view) {
        switchView(view);
      }
    });
  });
  
  // setup task modal
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  const closeBtn = document.querySelector('.close-modal');
  const cancelBtn = document.querySelector('.btn-cancel');
  
  // close modal with X or cancel button
  closeBtn.addEventListener('click', closeTaskModal);
  cancelBtn.addEventListener('click', closeTaskModal);
  
  // close modal if clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeTaskModal();
    }
    // same for delete modal
    const deleteModal = document.getElementById('deleteModal');
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
  
  // setup delete confirmation
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
          // use localStorage if delete fails
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
  
  // load users and teams for the dropdowns in task form
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

  // load dropdown data when modal opens
  const originalShowTaskModal = window.showTaskModal;
  window.showTaskModal = function(category) {
    originalShowTaskModal(category);
    loadTaskFormData();
  };
  
  // when form is submitted
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
    
    // split tags by comma
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

