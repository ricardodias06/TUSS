document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Segurança
    if (typeof requireAuth === 'function') {
        requireAuth();
    } else {
        if (!localStorage.getItem('authToken')) window.location.href = 'login.html';
    }

    // 2. Carregar dados do Utilizador
    const user = getCurrentUser();

    console.log("--- DEBUG TUSS HUB ---");
    
    if (user) {
        console.log("Utilizador carregado:", user.displayName);
        updateHubInterface(user);
    } else {
        console.warn("Nenhum utilizador encontrado na memória.");
        logout();
    }

    // 3. Botão Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

function updateHubInterface(user) {
    const greetingEl = document.querySelector('.hub-greeting h1');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const idEl = document.getElementById('user-id');
    const avatarEl = document.getElementById('user-avatar');

    // --- SAUDAÇÃO ---
    if (greetingEl) {
        const hour = new Date().getHours();
        let saudacao = (hour >= 6 && hour < 12) ? 'Bom dia' :
                       (hour >= 12 && hour < 20) ? 'Boa tarde' : 'Boa noite';
        
        const nomeMostrado = user.displayName || user.robloxUsername || "Colega";
        greetingEl.innerHTML = `${saudacao}, <span class="highlight">${nomeMostrado}</span>`;
    }

    // --- DADOS BÁSICOS ---
    if (nameEl) nameEl.textContent = user.displayName || user.robloxUsername;
    
    // Mostra o Staff ID se existir, senão mostra o ID interno (1)
    if (idEl) idEl.textContent = `ID: ${user.staffId || user.id}`;

    // --- CORREÇÃO DOS CARGOS ---
    if (roleEl) {
        // Agora usamos diretamente o rank que vem da Base de Dados!
        // Se não tiver rank, assumimos Passageiro.
        roleEl.textContent = user.rank || "Passageiro";
    }

    // --- AVATAR ---
    if (avatarEl) {
        const defaultAvatar = "../../assets/svg-icons/user.svg";
        const robloxId = String(user.robloxId);

        if (robloxId && robloxId !== "000000" && robloxId !== "undefined") {
            const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : "http://localhost:3001";
            const proxyUrl = `${baseUrl}/roblox/avatar/${robloxId}`;
            avatarEl.src = proxyUrl;
            avatarEl.onerror = () => { avatarEl.src = defaultAvatar; };
        } else {
            avatarEl.src = defaultAvatar;
        }
    }

    // --- BACKOFFICE (Acesso ao Painel Admin) ---
    const adminPanel = document.getElementById('admin-panel-card');
    if (adminPanel) {
        // Mostra o painel se o rank NÃO for Passageiro ou indefinido
        const rank = (user.rank || "").toLowerCase();
        
        // Lista de palavras-chave que dão acesso ao painel
        const allowed = ['head', 'operations', 'direção', 'admin', 'staff', 'owner'];
        
        const hasAccess = allowed.some(keyword => rank.includes(keyword));
        adminPanel.style.display = hasAccess ? 'flex' : 'none';
    }
}