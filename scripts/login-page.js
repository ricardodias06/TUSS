const API_BASE_LOGIN = 'http://localhost:3000';

// --- GESTÃO DE ABAS (LOGIN vs REGISTO) ---
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    if(tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('loginFeedback').textContent = '';
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('regFeedback').textContent = '';
    }
}

// --- LÓGICA DE LOGIN ---
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const feedback = document.getElementById('loginFeedback');
    const btn = e.target.querySelector('button');

    feedback.className = "feedback-msg text-blue";
    feedback.textContent = "A verificar credenciais...";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
        const response = await fetch(`${API_BASE_LOGIN}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error();
        const data = await response.json();

        // Guardar Sessão
        localStorage.setItem('tuss_token', data.token);
        localStorage.setItem('tuss_user', JSON.stringify(data.user));

        feedback.textContent = "Sucesso! A entrar...";
        feedback.className = "feedback-msg text-green";

        // REDIRECIONAMENTO ATUALIZADO -> Vai para o Hub Central
        setTimeout(() => {
            window.location.href = 'hub.html'; 
        }, 1000);

    } catch (error) {
        feedback.textContent = "Email ou password incorretos.";
        feedback.className = "feedback-msg text-red";
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

// --- LÓGICA DE REGISTO ---
document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const feedback = document.getElementById('regFeedback');
    const btn = e.target.querySelector('button');

    feedback.className = "feedback-msg text-blue";
    feedback.textContent = "A criar conta...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_LOGIN}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                robloxUsername: username,
                email: email,
                password: password,
                role: 'passenger', // Por segurança, registo público é sempre passageiro
                status: 'active'
            })
        });

        if (!response.ok) throw new Error();

        feedback.textContent = "Conta criada com sucesso! Faça login.";
        feedback.className = "feedback-msg text-green";
        
        e.target.reset();
        
        // Mudar automaticamente para a aba de login
        setTimeout(() => {
            switchTab('login');
            document.getElementById('loginFeedback').textContent = "Conta criada! Pode entrar.";
            document.getElementById('loginFeedback').className = "feedback-msg text-green";
            btn.disabled = false;
        }, 1500);

    } catch (error) {
        feedback.textContent = "Erro: Este email já está registado.";
        feedback.className = "feedback-msg text-red";
        btn.disabled = false;
    }
};