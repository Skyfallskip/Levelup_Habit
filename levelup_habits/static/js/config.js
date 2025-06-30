document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('useredit');

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
      const response = await fetch('/api/accounts/edit_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao atualizar as informações.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Erro de conexão. Tente novamente mais tarde.');
    } finally {
      submitButton.disabled = false;
    }
});
    const deleteButton = document.getElementById('deleteAccountBtn');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            const token = localStorage.getItem('access_token');
        if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
            try {
            const response = await fetch('/api/accounts/delete/', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
    
            if (response.ok) {
                alert('Conta excluída com sucesso.');
                window.location.href = 'login.html'; // Redireciona para a página de login
            } else {
                let errorMsg = 'Erro ao excluir a conta.';
                const text = await response.text();
                if (text) {
                    try {
                        const errorData = JSON.parse(text);
                        errorMsg = errorData.error || errorData.detail || errorMsg;
                    } catch (e) {
                        // resposta não é JSON, mantém mensagem padrão
                    }
                }
                alert(errorMsg);
            }
            } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro de conexão. Tente novamente mais tarde.');
            }
        }
        });
    }
    }
    );
