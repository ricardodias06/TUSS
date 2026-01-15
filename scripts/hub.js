// Verifica se está logado
const userJson = localStorage.getItem('tuss_user');
if (!userJson) {
    window.location.href = '../pt/login.html';
}

const user = JSON.parse(userJson);

// Preencher Header
document.getElementById('userNameDisplay').textContent = user.robloxUsername || user.email;

// Formatar Cargo
let roleText = 'Passageiro';
if(user.role === 'owner') roleText = 'Administração (Owner)';
if(user.role === 'highrank') roleText = 'Administração';
if(user.role === 'staff') roleText = 'Motorista';

document.getElementById('userRoleDisplay').textContent = roleText;

// Mostrar opções de Admin apenas se tiver permissão
if (user.role === 'owner' || user.role === 'highrank') {
    const adminCards = document.querySelectorAll('.admin-only');
    adminCards.forEach(card => card.style.display = 'block');
}

// Função de Logout
function logout() {
    localStorage.removeItem('tuss_token');
    localStorage.removeItem('tuss_user');
    window.location.href = '../pt/index.html';
}