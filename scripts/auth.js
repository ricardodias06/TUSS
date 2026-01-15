function setupLoginButton() {
    const btn = document.getElementById('navLoginBtn');
    
    if(btn) {
        const userJson = localStorage.getItem('tuss_user');

        if (userJson) {
            // ESTADO: LOGADO
            const user = JSON.parse(userJson);
            
            // Texto do botão agora é fixo, não o nome do user
            btn.textContent = "Área Privada"; 
            btn.classList.add('logged-in');
            
            // Clicar leva ao HUB, não faz logout direto
            btn.onclick = function(e) {
                e.preventDefault();
                window.location.href = '../pt/hub.html';
            };
        } else {
            // ESTADO: NÃO LOGADO
            btn.textContent = "Login / Registo"; // Texto mais claro
            btn.classList.remove('logged-in');
            
            btn.onclick = function(e) {
                e.preventDefault();
                window.location.href = '../pt/login.html';
            };
        }
    } else {
        setTimeout(setupLoginButton, 200);
    }
}
setupLoginButton();