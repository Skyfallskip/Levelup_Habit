// Função para obter o CSRF token do cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Função para fetch autenticado por sessão (com CSRF)
async function fetchWithSession(url, options = {}) {
    options.headers = options.headers || {};
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
        options.headers['X-CSRFToken'] = csrftoken;
    }
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
        window.location.href = '/login/';
        return;
    }
    return response;
}

// Função para verificar autenticação (opcional, pois sessão já protege as views)
async function checkAuth() {
    // Se a página foi renderizada, já está autenticado
    return true;
}

// Função para inicialização segura da página
async function initializePage() {
    if (window.location.pathname.includes('/login')) {
        return;
    }
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        window.location.href = '/login/';
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Script carregado e DOM pronto!');
    
    // Verifica autenticação antes de continuar
    const isAuth = await initializePage();
    if (!isAuth) return;
    
    const habitList = document.getElementById('habitList');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.getElementById('closeModal');
    const editForm = document.getElementById('editHabitForm');

    let currentHabitId = null;

    // --- Funções auxiliares ---

    // Retorna texto do hábito com status "Ativo" ou "Inativo"
    function habitText(habit) {
        return `${habit.title} ${habit.is_active ? 'Ativo' : 'Inativo'}`;
    }

    // Atualiza o texto do hábito na lista (título + status)
    function updateHabitListItemText(habitId, habit) {
        const habitItem = habitList.querySelector(`.habit-card[data-id="${habitId}"]`);
        if (!habitItem) return;

        const titleSpan = habitItem.querySelector('.habit-header strong');
        if (titleSpan) {
            titleSpan.textContent = habit.title;
        } else {
            habitItem.childNodes[0].nodeValue = habitText(habit) + ' ';
        }
    }

    // --- Event delegation para ações dos botões da lista ---

    if (habitList) {
        habitList.addEventListener('click', async (e) => {
            const target = e.target;
            const habitItem = target.closest('.habit-card');
            if (!habitItem) return;
            const habitId = habitItem.dataset.id;

            // Botão Concluir
            if (target.classList.contains('btn-complete')) {
                try {
                    const response = await fetchWithSession('/api/completions/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ habit: habitId }),
                    });
                    
                    if (!response || !response.ok) throw new Error('Erro ao concluir hábito');

                    habitItem.classList.add('done');
                    alert('Hábito concluído! 🎉');
                } catch (error) {
                    console.error(error);
                    alert('Erro ao concluir hábito.');
                }
                return;
            }

            // Botão Deletar
            if (target.classList.contains('btn-delete')) {
                if (confirm('Tem certeza que quer deletar esse hábito?')) {
                    try {
                        const response = await fetchWithSession(`/api/habits/${habitId}/`, {
                            method: 'DELETE',
                        });
                        
                        if (!response || !response.ok) throw new Error('Erro ao deletar hábito');

                        habitItem.remove();
                        alert('Hábito deletado com sucesso!');
                    } catch (error) {
                        console.error(error);
                        alert('Erro ao deletar hábito.');
                    }
                }
                return;
            }

            // Botão Editar
            if (target.classList.contains('btn-edit') || target.closest('.btn-edit')) {
                currentHabitId = habitId;
                try {
                    const response = await fetchWithSession(`/api/habits/${habitId}/`);
                    
                    if (!response || !response.ok) throw new Error('Falha ao carregar hábito');
                    const data = await response.json();

                    // Preenche formulário com dados atuais
                    document.getElementById('habitTitle').value = data.title;
                    document.getElementById('habitDescription').value = data.description || '';
                    document.getElementById('habitFrequency').value = data.frequency;

                    // Mostrar modal
                    if (editModal) {
                        editModal.style.display = 'block';
                    }
                } catch (error) {
                    console.error(error);
                    alert('Erro ao carregar dados do hábito.');
                }
                return;
            }
        });
    }

    // --- Modal ---

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (editModal) {
                editModal.style.display = 'none';
            }
            currentHabitId = null;
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            if (editModal) {
                editModal.style.display = 'none';
            }
            currentHabitId = null;
        }
    });

    // --- Formulário edição ---

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentHabitId) return;

            const updatedData = {
                title: editForm.title.value.trim(),
                description: editForm.description.value.trim(),
                frequency: editForm.frequency.value,
            };

            try {
                const response = await fetchWithSession(`/api/habits/${currentHabitId}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
                
                if (!response || !response.ok) throw new Error('Falha ao atualizar hábito');

                // Atualiza o texto do hábito na lista (mantém status atual)
                const habitItem = habitList.querySelector(`.habit-card[data-id="${currentHabitId}"]`);
                const isActive = habitItem ? habitItem.textContent.includes('Ativo') : true; // fallback
                updateHabitListItemText(currentHabitId, { ...updatedData, is_active: isActive });

                alert('Hábito atualizado com sucesso!');
                if (editModal) {
                    editModal.style.display = 'none';
                }
                currentHabitId = null;
            } catch (error) {
                console.error(error);
                alert('Erro ao salvar alterações.');
            }
        });
    }

    // --- Formulário criação ---

    const newHabitForm = document.getElementById('NewHabitForm');
    if (newHabitForm) {
        newHabitForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('newHabitTitle').value.trim();
            const description = document.getElementById('newHabitDescription').value.trim();
            const frequency = document.getElementById('newHabitFrequency').value;

            if (!title || !frequency) {
                alert('Por favor, preencha o título e a frequência.');
                return;
            }

            const newHabitData = { title, description, frequency };

            try {
                const response = await fetchWithSession('/api/habits/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newHabitData),
                });

                if (!response || !response.ok) throw new Error('Erro ao adicionar hábito');

                const createdHabit = await response.json();

                // Criar o elemento da lista do novo hábito
                if (habitList) {
                    const div = document.createElement('div');
                    div.classList.add('habit-card');
                    div.dataset.id = createdHabit.id;

                    div.innerHTML = `
                      <div class="habit-header">
                        <strong>${createdHabit.title}</strong>
                        <span class="habit-status">Ativo</span>
                      </div>
                      <div class="habit-actions">
                        <button class="btn-complete">Concluir</button>
                        <button class="btn-delete">Deletar</button>
                        <button class="btn-edit"><i class="fa-sharp fa-solid fa-pencil"></i> Editar</button>
                      </div>
                    `;

                    habitList.appendChild(div);
                }

                e.target.reset(); // limpa o form
                alert('Hábito adicionado com sucesso! 🎉');
            } catch (error) {
                console.error(error);
                alert('Erro ao adicionar hábito: ' + error.message);
            }
        });
    }

    // --- Controle do modal de novo hábito ---

    const btnNewHabit = document.getElementById('addHabitBtn');
    const newHabitModal = document.getElementById('AddNewHabitWrapper');
    const closeNewHabit = document.getElementById('closeNewHabit');

    if (btnNewHabit && newHabitModal) {
        btnNewHabit.addEventListener('click', () => {
            newHabitModal.classList.add('show');
        });
    }

    if (closeNewHabit && newHabitModal) {
        closeNewHabit.addEventListener('click', () => {
            newHabitModal.classList.remove('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === newHabitModal) {
            newHabitModal.classList.remove('show');
        }
    });
});