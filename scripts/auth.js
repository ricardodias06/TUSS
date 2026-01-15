// Apenas funções utilitárias de sessão (Redirecionamento puro)

function setupLoginButton() {
    const btn = document.getElementById('navLoginBtn');
    
    // Verifica se o botão existe (Navbar carregada)
    if(btn) {
        const userJson = localStorage.getItem('tuss_user');

        if (userJson) {
            // ESTADO: LOGADO
            const user = JSON.parse(userJson);
            btn.textContent = `Olá, ${user.robloxUsername}`;
            btn.classList.add('logged-in');
            
            // Ao clicar, faz logout
            btn.onclick = function(e) {
                e.preventDefault();
                if(confirm("Deseja terminar a sessão?")) {
                    localStorage.removeItem('tuss_token');
                    localStorage.removeItem('tuss_user');
                    window.location.href = 'index.html';
                }
            };
        } else {
            // ESTADO: NÃO LOGADO
            btn.textContent = "Área Cliente";
            btn.classList.remove('logged-in');
            
            // Ao clicar, vai para a página de login
            btn.onclick = function(e) {
                e.preventDefault();
                window.location.href = '../pt/login.html'; // Redireciona para a nova página
            };
        }
    } else {
        // Tenta novamente daqui a pouco se a navbar ainda não carregou
        setTimeout(setupLoginButton, 200);
    }
}

// Inicia a verificação
setupLoginButton();