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

// Função para mostrar mensagens
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

// Limpa mensagem anterior
function clearMessage() {
    const msgDiv = document.getElementById('messageDiv');
    if (msgDiv) {
        msgDiv.textContent = '';
    }
}

// Manipulador de envio do formulário de login
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
        const response = await fetch('/api/accounts/logar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.access) {
            // Salva os tokens no localStorage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Exibe mensagem e redireciona
            showMessage('Login realizado com sucesso! Redirecionando...', 'success');

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showMessage(data.detail || 'Usuário ou senha incorretos', 'error');
        }

    } catch (error) {
        showMessage('Erro ao conectar ao servidor', 'error');
        console.error('Login error:', error);
    }
});
