document.addEventListener('DOMContentLoaded', () => {
  console.log('Script carregado e DOM pronto!');
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

  habitList.addEventListener('click', async (e) => {
    const target = e.target;
    const habitItem = target.closest('.habit-card');
    if (!habitItem) return;
    const habitId = habitItem.dataset.id;

    // Botão Concluir
    if (target.classList.contains('btn-complete')) {
      try {
        const response = await fetch('/api/completions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
          },
          body: JSON.stringify({ habit: habitId }),
        });
        if (!response.ok) throw new Error('Erro ao concluir hábito');

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
          const response = await fetch(`/api/habits/${habitId}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            },
          });
          if (!response.ok) throw new Error('Erro ao deletar hábito');

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
        const response = await fetch(`/api/habits/${habitId}/`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
          },
        });
        if (!response.ok) throw new Error('Falha ao carregar hábito');
        const data = await response.json();

        // Preenche formulário com dados atuais
        document.getElementById('habitTitle').value = data.title;
        document.getElementById('habitDescription').value = data.description || '';
        document.getElementById('habitFrequency').value = data.frequency;

        // Mostrar modal
        editModal.style.display = 'block';
      } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados do hábito.');
      }
      return;
    }
  });

  // --- Modal ---

  closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    currentHabitId = null;
  });

  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.style.display = 'none';
      currentHabitId = null;
    }
  });

  // --- Formulário edição ---

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentHabitId) return;

    const updatedData = {
      title: editForm.title.value.trim(),
      description: editForm.description.value.trim(),
      frequency: editForm.frequency.value,
    };

    try {
      const response = await fetch(`/api/habits/${currentHabitId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Falha ao atualizar hábito');

      // Atualiza o texto do hábito na lista (mantém status atual)
      // Aqui idealmente a API deveria retornar o hábito atualizado completo,
      // mas como não retorna (ainda nao implementei), vamos buscar o is_active antigo:
      const habitItem = habitList.querySelector(`.habit[data-id="${currentHabitId}"]`);
      const isActive = habitItem ? habitItem.textContent.includes('Ativo') : true; // fallback
      updateHabitListItemText(currentHabitId, { ...updatedData, is_active: isActive });

      alert('Hábito atualizado com sucesso!');
      editModal.style.display = 'none';
      currentHabitId = null;
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar alterações.');
    }
  });

  // --- Formulário criação ---

  document.getElementById('NewHabitForm').addEventListener('submit', async (e) => {
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
    const response = await fetch('/api/habits/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      },
      body: JSON.stringify(newHabitData),
    });

    if (!response.ok) throw new Error('Erro ao adicionar hábito');

    const createdHabit = await response.json();

    // Criar o elemento da lista do novo hábito
    const habitList = document.getElementById('habitList');

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

    habitList.appendChild(li);

    e.target.reset(); // limpa o form
    alert('Hábito adicionado com sucesso! 🎉');
  } catch (error) {
    console.error(error);
    //alert('Erro ao adicionar hábito: ' + error.message);
  }
});

});

const btnNewHabit = document.getElementById('addHabitBtn');
const newHabitModal = document.getElementById('AddNewHabitWrapper');
const closeNewHabit = document.getElementById('closeNewHabit');

btnNewHabit.addEventListener('click', () => {
  newHabitModal.classList.add('show');
});

closeNewHabit.addEventListener('click', () => {
  newHabitModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
  if (e.target === newHabitModal) {
    newHabitModal.classList.remove('show');
  }
});
