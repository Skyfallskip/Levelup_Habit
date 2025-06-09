console.log('Register script loaded');
function showAlert(message, isSuccess = false, type = '') {
  const alertBox = document.getElementById('customAlert');
  const alertMsg = document.getElementById('alertMessage');

  alertMsg.textContent = message;
  alertBox.classList.add('show');

  alertBox.classList.remove('success', 'connection-error');

  if (isSuccess) {
    alertBox.classList.add('success');
  } else if (type === 'connection-error') {
    alertBox.classList.add('connection-error');
  }

  setTimeout(() => {
    alertBox.classList.remove('show', 'success', 'connection-error');
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;
    const submitButton = form.querySelector('button[type="submit"]');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (password !== confirmPassword) {
      showAlert('As senhas não coincidem!');
      return;
    }

    if (password.length < 8) {
      showAlert('A senha precisa ter no mínimo 8 caracteres.');
      return;
    }

    if (!emailRegex.test(email)) {
      showAlert('Digite um email válido.');
      return;
    }

    submitButton.disabled = true;

    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        showAlert(errorData.detail || 'Erro ao registrar, verifique os dados.');
        submitButton.disabled = false;
        return;
      }

      showAlert('Cadastro realizado com sucesso! Agora faça login.', true);
      setTimeout(() => window.location.href = loginUrl, 1000);

    } catch (error) {
      showAlert('Erro na conexão. Tente novamente mais tarde.', false, 'connection-error');
      console.error('Erro de conexão:', error);
    } finally {
      submitButton.disabled = false;
    }
  });

  document.querySelectorAll('.toggle-password').forEach((icon) => {
    icon.addEventListener('click', () => {
      const inputId = icon.getAttribute('data-target');
      togglePasswordVisibility(inputId, icon);
    });
  });
});

function togglePasswordVisibility(inputId, iconElement) {
  const input = document.getElementById(inputId);
  const isVisible = input.type === 'text';

  input.type = isVisible ? 'password' : 'text';
  iconElement.src = isVisible 
      ? "/static/images/hide.png" 
      : "/static/images/view.png";
  iconElement.alt = isVisible ? "Mostrar senha" : "Ocultar senha";
}
