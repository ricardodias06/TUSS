// Configuração Central da API
const API_BASE_URL = "http://localhost:3000";

// --- Gestão de Sessão ---

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
    return !!getAuthToken();
}

function logout() {
    console.warn("A terminar sessão...");
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redireciona para o login (ajusta o caminho conforme necessário)
    window.location.href = "login.html";
}

// --- Motor de Pedidos (API Fetcher) ---
// Usa esta função em vez do fetch() normal para falar com o Backend
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    // Configura os headers padrão (JSON + Token)
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Se der erro 401 (Não autorizado), o token provavelmente expirou
        if (response.status === 401) {
            // Ignora o logout se já estivermos na página de login
            if (!window.location.pathname.includes('login.html')) {
                logout();
            }
            throw new Error("Sessão expirada.");
        }

        return response;
    } catch (error) {
        console.error(`Erro no pedido API [${endpoint}]:`, error);
        throw error;
    }
}

// Verifica se o user tem permissão para ver a página
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = "login.html";
    }
}