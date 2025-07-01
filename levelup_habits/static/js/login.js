// Este arquivo pode ser removido ou deixado apenas para mensagens de UI, pois o login é feito por formulário HTML tradicional.
// Se quiser exibir mensagens de erro/sucesso dinâmicas, pode usar este arquivo para isso.
// Exemplo: mostrar mensagem de erro se existir div.error no template.
document.addEventListener('DOMContentLoaded', function() {
    const errorDiv = document.querySelector('.error');
    if (errorDiv) {
        errorDiv.style.color = '#ff5555';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.marginTop = '1rem';
    }
});