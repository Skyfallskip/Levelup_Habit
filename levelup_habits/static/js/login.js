document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = this.username.value.trim();
    const password = this.password.value.trim();
    const message = document.getElementById('message');
    message.textContent = '';

    if (!username || !password) {
        message.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        // Aqui você chamaria a API do seu backend para autenticação
        // Exemplo usando fetch:
        const response = await fetch('/api/token/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password}),
        });

        if (response.ok) {
            const data = await response.json();
            // Salva o token no localStorage para usar depois
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            message.style.color = 'green';
            message.textContent = 'Login realizado com sucesso! Redirecionando...';

            // Redireciona para a página principal depois de 1.5s
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // ou a página principal
            }, 1500);
        } else {
            message.textContent = 'Usuário ou senha inválidos.';
        }
    } catch (error) {
        message.textContent = 'Erro na conexão com o servidor.';
    }
});
