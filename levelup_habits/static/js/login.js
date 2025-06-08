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


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    clearMessage();

    if (!username || !password) {
        showMessage('Preencha usuário e senha', 'error');
        return;
    }

    try {
        const response = await fetch('/api/token/', { 
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

            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 1000);

        } else {
            const errorMsg = data.detail || 'Usuário ou senha incorretos';
            showMessage(errorMsg, 'error');
        }
    } catch (error) {
        showMessage('Erro ao conectar ao servidor', 'error');
        console.error('Login error:', error);
    }
});
