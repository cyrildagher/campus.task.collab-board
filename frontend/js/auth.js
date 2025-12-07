// login and registration stuff
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const cancelRegister = document.getElementById('cancelRegister');
  const registerBox = document.getElementById('registerBox');
  const message = document.getElementById('message');
  const regMessage = document.getElementById('regMessage');

  if (!loginForm || !registerForm || !showRegister || !cancelRegister || !registerBox) {
    console.error('Missing form elements');
    return;
  }

  showRegister.addEventListener('click', () => {
    registerBox.style.display = 'block';
    message.textContent = '';
  });

  cancelRegister.addEventListener('click', () => {
    registerBox.style.display = 'none';
    regMessage.textContent = '';
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const studentId = document.getElementById('studentId').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !password || !studentId) {
      regMessage.textContent = 'Please fill in all fields including Student ID.';
      regMessage.style.color = '#ef4444';
      return;
    }

    // check if student id is 8-12 digits (learned regex for this)
    if (!/^\d{8,12}$/.test(studentId)) {
      regMessage.textContent = 'Student ID must be 8-12 digits.';
      regMessage.style.color = '#ef4444';
      return;
    }

    try {
      await authAPI.register(name, email, password, studentId);
      regMessage.textContent = 'Account created. You can now login.';
      regMessage.style.color = '#10b981';
      registerForm.reset();
      setTimeout(() => {
        registerBox.style.display = 'none';
        regMessage.textContent = '';
      }, 2000);
    } catch (error) {
      regMessage.textContent = error.message || 'Registration failed.';
      regMessage.style.color = '#ef4444';
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      message.textContent = 'Please enter email and password.';
      message.style.color = '#ef4444';
      return;
    }

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.location.href = 'dashboard.html';
    } catch (error) {
      message.textContent = error.message || 'Invalid email or password.';
      message.style.color = '#ef4444';
    }
  });
});
