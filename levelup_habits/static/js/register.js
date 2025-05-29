document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = this.username.value.trim();
    const password = this.password.value.trim();
    const passwordConfirm = this.passwordConfirm.value.trim();
    const message = document.getElementById('message');
    message.textContent = '';

    if (!username || !password || !passwordConfirm) {
        message.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    if (password !== passwordConfirm) {
        message.textContent = 'As senhas não coincidem.';
        return;
    }

    try {
        // Chamada para criar o usuário no backend
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password}),
        });

        if (response.ok) {
            message.style.color = 'green';
            message.textContent = 'Cadastro realizado com sucesso! Você será redirecionado para login.';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const data = await response.json();
            message.textContent = data.detail || 'Erro ao cadastrar usuário.';
        }
    } catch (error) {
        message.textContent = 'Erro na conexão com o servidor.';
    }
});
