document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Segurança
    if (typeof requireAuth === 'function') {
        requireAuth();
    } else {
        // Fallback caso o auth.js não carregue
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
    // --- ELEMENTOS DO DOM (Definidos aqui dentro para não dar erro) ---
    const greetingEl = document.querySelector('.hub-greeting h1');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const idEl = document.getElementById('user-id');
    const avatarEl = document.getElementById('user-avatar'); // <--- Aqui é que ele é definido!

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
    if (idEl) idEl.textContent = `ID: ${user.staffId || user.id}`;

    // --- CARGOS ---
    if (roleEl) {
        let roleName = "Passageiro";
        if (user.role === 'owner') roleName = "Direção Executiva";
        else if (user.role === 'staff') roleName = "Staff Operacional";
        roleEl.textContent = roleName;
    }

    // --- LÓGICA DO AVATAR (Via Backend TUSS) ---
    if (avatarEl) {
        const defaultAvatar = "../../assets/svg-icons/user.svg";
        const robloxId = String(user.robloxId);

        // Se o ID for válido, pede ao nosso Backend para resolver a imagem
        if (robloxId && robloxId !== "000000" && robloxId !== "undefined") {
            
            // Usamos a constante global API_BASE_URL definida no auth.js
            // Se der erro aqui, certifica-te que o auth.js é carregado ANTES do hub.js no HTML
            const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : "http://localhost:3000";
            const proxyUrl = `${baseUrl}/roblox/avatar/${robloxId}`;
            
            console.log("Pedindo avatar ao Backend:", proxyUrl);
            avatarEl.src = proxyUrl;

            // Se o backend falhar ou demorar, volta ao SVG
            avatarEl.onerror = () => {
                console.warn("Backend não conseguiu a imagem. A usar SVG.");
                avatarEl.src = defaultAvatar;
            };
        } else {
            // Sem ID Roblox -> Usa SVG direto
            avatarEl.src = defaultAvatar;
        }
    }

    // --- BACKOFFICE ---
    const adminPanel = document.getElementById('admin-panel-card');
    if (adminPanel) {
        adminPanel.style.display = (user.role === 'owner' || user.role === 'staff') ? 'flex' : 'none';
    }
}