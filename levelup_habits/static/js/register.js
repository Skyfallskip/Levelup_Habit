document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;

    if (password !== passwordConfirm) {
      alert('As senhas não coincidem!');
      return;
    }

    if (password.length < 8) {
      alert('A senha precisa ter no mínimo 8 caracteres.');
      return;
    }

    try {
      const response = await fetch('/api/register/', {  // ajuste a URL para seu endpoint de registro
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao registrar, verifique os dados.');
        return;
      }

      alert('Cadastro realizado com sucesso! Agora faça login.');
      window.location.href = 'login.html';

    } catch (error) {
      alert('Erro na conexão. Tente novamente mais tarde.');
      console.error('Registro error:', error);
    }
  });
});
