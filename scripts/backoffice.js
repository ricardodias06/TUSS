let userToDeleteId = null; // Variável para guardar o ID temporariamente

// Abre o modal personalizado em vez do confirm() nativo
function deleteUser(id) {
    userToDeleteId = id;
    document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
    userToDeleteId = null;
}

// Ação real de eliminar (só acontece quando clicam no botão vermelho)
document.getElementById('confirmDeleteBtn').onclick = async () => {
    if (!userToDeleteId) return;

    try {
        const btn = document.getElementById('confirmDeleteBtn');
        btn.textContent = "A eliminar...";
        
        await fetch(`${API_BASE}/users/${userToDeleteId}`, { method: 'DELETE' });
        
        closeDeleteModal();
        loadStaff(); // Recarrega a tabela
        btn.textContent = "Sim, Eliminar"; // Repõe texto
    } catch (error) {
        alert("Erro ao eliminar."); // Aqui ainda usamos alert pq é erro crítico
    }
};