document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // impede o reload do form

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Limpa mensagens antigas
    clearMessage();

    if (!username || !password) {
        showMessage('Preencha usuário e senha', 'error');
        return;
    }

    try {
        const response = await fetch('/api/token/', {  // ajuste a URL se for diferente no seu backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Login bem-sucedido
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            showMessage('Login realizado com sucesso! Redirecionando...', 'success');

            // Depois de 1 segundo, redireciona para a página principal (ajuste conforme sua app)
            setTimeout(() => {
                window.location.href = '/dashboard/';  // ou qualquer página que você queira
            }, 1000);

        } else {
            // Login falhou: mostra erro retornado da API
            const errorMsg = data.detail || 'Usuário ou senha incorretos';
            showMessage(errorMsg, 'error');
        }
    } catch (error) {
        showMessage('Erro ao conectar ao servidor', 'error');
        console.error('Login error:', error);
    }
});

function showMessage(message, type) {
    let msgDiv = document.getElementById('messageDiv');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'messageDiv';
        msgDiv.style.marginTop = '1rem';
        msgDiv.style.textAlign = 'center';
        msgDiv.style.fontWeight = '600';
        document.querySelector('.container_inner').appendChild(msgDiv);
    }

    msgDiv.textContent = message;
    msgDiv.style.color = (type === 'error') ? '#ff5555' : '#55ff55';
}

function clearMessage() {
    const msgDiv = document.getElementById('messageDiv');
    if (msgDiv) {
        msgDiv.textContent = '';
    }
}
