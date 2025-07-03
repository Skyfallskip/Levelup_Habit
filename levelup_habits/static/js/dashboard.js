// Utilitário para obter CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Função para escapar HTML e evitar XSS
function escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"'`=\/]/g, function (s) {
        return ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "`": "&#x60;",
            "=": "&#x3D;"
        })[s];
    });
}

// Fetch autenticado por sessão (com CSRF)
async function fetchWithSession(url, options = {}) {
    options.headers = options.headers || {};
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
        options.headers['X-CSRFToken'] = csrftoken;
    }
    const response = await fetch(url, options);
    if ([401, 403].includes(response.status)) {
        window.location.href = '/login/';
        return null;
    }
    return response;
}

// Toast simples para feedback UX
function showToast(msg, type = "success") {
    let toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

// Inicialização segura da página
async function initializePage() {
    if (window.location.pathname.includes('/login')) return false;
    return true;
}

// Atualiza contadores de hábitos no dashboard
function updateHabitCounters({ completed = null, pending = null, total = null } = {}) {
    if (completed !== null) {
        document.querySelector('.stat-completed strong').textContent = completed;
    }
    if (pending !== null) {
        document.querySelector('.stat-pending strong').textContent = pending;
    }
    if (total !== null) {
        document.querySelector('.stat-total strong').textContent = total;
    }
}

// Cria elemento de hábito na lista (escapando HTML)
function createHabitCard(habit) {
    const div = document.createElement('div');
    div.classList.add('habit-card');
    div.dataset.id = habit.id;
    div.innerHTML = `
      <div class="habit-header">
        <strong>${escapeHTML(habit.title)}</strong>
        <span class="habit-status">${habit.is_active ? 'Ativo' : 'Inativo'}</span>
      </div>
      <div class="habit-actions">
        <button class="btn-complete" title="Concluir"><i class="fa-solid fa-circle-check"></i></button>
        <button class="btn-delete" title="Deletar"><i class="fa-solid fa-trash"></i></button>
        <button class="btn-edit" title="Editar"><i class="fa-sharp fa-solid fa-pencil"></i></button>
      </div>
    `;
    return div;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!await initializePage()) return;

    const habitList = document.getElementById('habitList');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.getElementById('closeModal');
    const editForm = document.getElementById('editHabitForm');
    const newHabitForm = document.getElementById('NewHabitForm');
    const btnNewHabit = document.getElementById('addHabitBtn');
    const newHabitModal = document.getElementById('AddNewHabitWrapper');
    const closeNewHabit = document.getElementById('closeNewHabit');
    let currentHabitId = null;

    // --- Event delegation para ações dos hábitos ---
    if (habitList) {
        habitList.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const habitItem = target.closest('.habit-card');
            if (!habitItem) return;
            const habitId = habitItem.dataset.id;

            // Concluir hábito
            if (target.classList.contains('btn-complete')) {
                
                try {
                    const response = await fetchWithSession('/completions/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            habit: habitId,
                            date: (new Date()).toISOString().slice(0, 10)
                        }),
                    });
                    if (!response || !response.ok) {
                        const errorData = await response.json();
                        showToast(errorData.detail || errorData.non_field_errors?.[0] || 'Erro ao concluir hábito.', 'error');
                        return;
                    }
                    habitItem.classList.add('done');
                    showToast('Hábito concluído! 🎉');
                    // Atualiza contador concluídos/pendentes
                    let completed = parseInt(document.querySelector('.stat-completed strong').textContent) + 1;
                    let pending = Math.max(0, parseInt(document.querySelector('.stat-pending strong').textContent) - 1);
                    updateHabitCounters({ completed, pending });
                    location.reload()
                } catch {
                    showToast('Erro ao concluir hábito.', 'error');
                }
                return;
            }

            // Deletar hábito
            if (target.classList.contains('btn-delete')) {
                if (confirm('Tem certeza que quer deletar esse hábito?')) {
                    try {
                        const response = await fetchWithSession(`/habits/${habitId}/`, { method: 'DELETE' });
                        if (!response || !response.ok) throw new Error();
                        habitItem.remove();
                        showToast('Hábito deletado!');
                        // Atualiza contador total
                        let total = Math.max(0, parseInt(document.querySelector('.stat-total strong').textContent) - 1);
                        updateHabitCounters({ total });
                    } catch {
                        showToast('Erro ao deletar hábito.', 'error');
                    }
                }
                return;
            }

            // Editar hábito
            if (target.classList.contains('btn-edit')) {
                currentHabitId = habitId;
                try {
                    const response = await fetchWithSession(`/habits/${habitId}/`);
                    if (!response || !response.ok) throw new Error();
                    const data = await response.json();
                    editForm.title.value = data.title;
                    editForm.description.value = data.description || '';
                    editForm.frequency.value = data.frequency;
                    editModal.style.display = 'block';
                } catch {
                    showToast('Erro ao carregar dados do hábito.', 'error');
                }
            }
        });
    }

    // --- Modal edição ---
    if (closeModalBtn && editModal) {
        closeModalBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
            currentHabitId = null;
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
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
                const response = await fetchWithSession(`habits/${currentHabitId}/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData),
                });
                if (!response || !response.ok) throw new Error();
                // Atualiza título na lista
                const habitItem = habitList.querySelector(`.habit-card[data-id="${currentHabitId}"]`);
                if (habitItem) {
                    habitItem.querySelector('.habit-header strong').textContent = updatedData.title;
                }
                showToast('Hábito atualizado!');
                editModal.style.display = 'none';
                currentHabitId = null;
            } catch {
                showToast('Erro ao salvar alterações.', 'error');
            }
        });
    }

    // --- Formulário criação ---
    if (newHabitForm) {
        newHabitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('newHabitTitle').value.trim();
            const description = document.getElementById('newHabitDescription').value.trim();
            const frequency = document.getElementById('newHabitFrequency').value;
            if (!title || !frequency) {
                showToast('Preencha título e frequência.', 'error');
                return;
            }
            const newHabitData = { title, description, frequency };
            try {
                const response = await fetchWithSession('/habits/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newHabitData),
                });
                if (!response || !response.ok) throw new Error();
                const createdHabit = await response.json();
                if (habitList) {
                    habitList.appendChild(createHabitCard(createdHabit));
                }
                // Atualiza contador total
                let total = parseInt(document.querySelector('.stat-total strong').textContent) + 1;
                updateHabitCounters({ total });
                e.target.reset();
                showToast('Hábito adicionado! 🎉');
                newHabitModal.classList.remove('show');
            } catch {
                showToast('Erro ao adicionar hábito.', 'error');
            }
        });
    }

    // --- Modal novo hábito ---
    if (btnNewHabit && newHabitModal) {
        btnNewHabit.addEventListener('click', () => newHabitModal.classList.add('show'));
    }
    if (closeNewHabit && newHabitModal) {
        closeNewHabit.addEventListener('click', () => newHabitModal.classList.remove('show'));
    }
    window.addEventListener('click', (e) => {
        if (e.target === newHabitModal) newHabitModal.classList.remove('show');
    });

    // --- Toast CSS (inserido dinamicamente se não existir) ---
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
        .toast {
            position: fixed;
            left: 50%;
            bottom: 40px;
            transform: translateX(-50%) scale(0.95);
            background: #222;
            color: #fff;
            padding: 0.9rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s, transform 0.3s;
        }
        .toast-success { background: #4CAF50; }
        .toast-error { background: #bb2222; }
        .toast.show {
            opacity: 1;
            pointer-events: auto;
            transform: translateX(-50%) scale(1);
        }
        `;
        document.head.appendChild(style);
    }
});