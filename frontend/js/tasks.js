// check if user is logged in
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// categories for the board
const categories = ['Academics', 'Recreational', 'Sports', 'Events'];

// get tasks from API (with localStorage fallback)
async function getTasks() {
  try {
    const tasks = await tasksAPI.getAll();
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

  card.innerHTML = `
    <div class="task-header">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <h4>${task.title}</h4>
      <span class="task-menu">⋯</span>
    </div>
    <p class="task-desc">${task.description}</p>
    <div class="task-tags">
      ${tagsHtml}
    </div>
    <div class="task-footer">
      <div class="task-comments">
        <span>${task.comments}</span>
      </div>
      <div class="task-time">Est. ${task.time}</div>
    </div>
  `;

  // handle checkbox click
  const checkbox = card.querySelector('.task-checkbox');
  checkbox.addEventListener('change', async () => {
    try {
      await tasksAPI.update(task.id, { completed: checkbox.checked });
      renderTasks();
      renderCompletedTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      // fallback to localStorage
      const tasks = await getTasks();
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = checkbox.checked;
        saveTasks(tasks);
        renderTasks();
        renderCompletedTasks();
      }
    }
  });

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
    
    const categoryTasks = tasks.filter(t => t.category === category && !t.completed);
    categoryTasks.forEach(task => {
      taskList.appendChild(createTaskCard(task));
    });
  });
}

// render completed tasks
async function renderCompletedTasks() {
  const tasks = await getTasks();
  const completedTasks = tasks.filter(t => t.completed);
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
  // only switch if we're in projects view
  const projectsView = document.getElementById('projectsView');
  if (projectsView && projectsView.style.display === 'none') {
    return; // don't switch if not in projects view
  }
  
  // hide all project sub-views
  const projectViews = ['tasksView', 'overviewView', 'milestonesView', 'completedView'];
  projectViews.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
  
  // remove active class from all nav links
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // show selected view
  const viewElement = document.getElementById(viewName + 'View');
  if (viewElement) {
    viewElement.style.display = 'block';
  }
  
  // add active class to clicked nav link
  const activeLink = document.querySelector(`[data-view="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // render content based on view
  if (viewName === 'completed') {
    renderCompletedTasks();
  } else if (viewName === 'overview') {
    if (typeof loadOverviewStats === 'function') {
      loadOverviewStats();
    }
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
  
  // handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const time = document.getElementById('taskTime').value.trim() || '1h 00m';
    const tagsInput = document.getElementById('taskTags').value.trim();
    const category = document.getElementById('taskCategory').value;
    
    if (!title) {
      alert('Please enter a task title');
      return;
    }
    
    // parse tags from comma-separated string
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const newTask = {
      title: title,
      description: description,
      category: category,
      tags: tags,
      time: time
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

