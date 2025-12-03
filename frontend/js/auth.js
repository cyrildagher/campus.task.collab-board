// very small, readable auth mock for the frontend
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const cancelRegister = document.getElementById('cancelRegister');
const registerBox = document.getElementById('registerBox');
const message = document.getElementById('message');
const regMessage = document.getElementById('regMessage');

showRegister.addEventListener('click', () => {
  registerBox.style.display = 'block';
  message.textContent = '';
});

cancelRegister.addEventListener('click', () => {
  registerBox.style.display = 'none';
  regMessage.textContent = '';
});

// simple "users" stored in localStorage for frontend-only demo
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    regMessage.textContent = 'An account with that email already exists.';
    return;
  }

  users.push({ name, email, password }); // plain password only for mock/demo
  saveUsers(users);

  regMessage.textContent = 'Account created. You can now login.';
  registerForm.reset();
  setTimeout(() => {
    registerBox.style.display = 'none';
    regMessage.textContent = '';
  }, 900);
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    message.textContent = 'Invalid email or password.';
    return;
  }

  // fake token so the dashboard can check login
  localStorage.setItem('token', 'fake-jwt-token');
  localStorage.setItem('user', JSON.stringify({ name: user.name, email: user.email }));

  // go to dashboard
  window.location.href = 'dashboard.html';
});
