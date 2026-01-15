const API_BASE_LOGIN = "http://localhost:3000"; // Porta do LoopBack

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const feedback = document.getElementById('loginFeedback');
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            feedback.textContent = "A autenticar...";
            feedback.className = "feedback-msg";

            try {
                const response = await fetch(`${API_BASE_LOGIN}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: username,
                        password: password 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    feedback.textContent = "Sucesso! A redirecionar...";
                    feedback.classList.add('success');
                    
                    localStorage.setItem('authToken', data.token);
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }

                    setTimeout(() => {
                        // CORREÇÃO AQUI: Caminho direto para o ficheiro na mesma pasta
                        window.location.href = "hub.html"; 
                    }, 1000);
                } else {
                    feedback.textContent = data.error?.message || "Utilizador ou password incorretos.";
                    feedback.classList.add('error');
                }
            } catch (error) {
                console.error("Erro de Login:", error);
                feedback.textContent = "Erro de conexão ao servidor.";
                feedback.classList.add('error');
            }
        });
    }

    // --- LÓGICA DE REGISTO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const feedback = document.getElementById('regFeedback');
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;

            feedback.textContent = "A criar conta...";
            feedback.className = "feedback-msg";

            try {
                const response = await fetch(`${API_BASE_LOGIN}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        displayName: username,
                        robloxUsername: username,
                        robloxId: "000000",
                        password: password,
                        rankId: 2 
                    })
                });

                if (response.ok) {
                    feedback.textContent = "Conta criada! Faça login agora.";
                    feedback.classList.add('success');
                    setTimeout(() => switchTab('login'), 1500);
                } else {
                    const data = await response.json();
                    feedback.textContent = data.error?.message || "Erro ao criar conta.";
                    feedback.classList.add('error');
                }
            } catch (error) {
                console.error("Erro de Registo:", error);
                feedback.textContent = "Erro de conexão ao servidor.";
                feedback.classList.add('error');
            }
        });
    }
});