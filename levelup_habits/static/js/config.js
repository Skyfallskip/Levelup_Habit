// Função para pegar o token CSRF do cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('useredit');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = form.username.value.trim();
      const email = form.email.value.trim();
      const submitButton = form.querySelector('button[type="submit"]');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Digite um email válido.');
        return;
      }
      submitButton.disabled = true;
      try {
        const response = await fetch('/accounts/edit/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken,
          },
          body: new URLSearchParams({ username, email }),
        });
        if (response.ok) {
          alert('Informações atualizadas com sucesso!');
          window.location.reload();
        } else {
          alert('Erro ao atualizar as informações.');
        }
      } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Erro de conexão. Tente novamente mais tarde.');
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  const deleteButton = document.getElementById('deleteAccountBtn');
  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        try {
          const response = await fetch('/accounts/delete/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-CSRFToken': csrftoken,
            },
            body: '',
          });
          if (response.ok) {
            alert('Conta excluída com sucesso.');
            window.location.href = '/login/';
          } else {
            alert('Erro ao excluir a conta.');
          }
        } catch (error) {
          console.error('Erro de conexão:', error);
          alert('Erro de conexão. Tente novamente mais tarde.');
        }
      }
    });
  }
});
