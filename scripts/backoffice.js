const API_BASE = 'http://localhost:3000';

// 1. Verificar Permissão
function checkPermission() {
    const userJson = localStorage.getItem('tuss_user');
    if (!userJson) {
        window.location.href = '../pt/index.html'; 
        return;
    }
    const user = JSON.parse(userJson);
    if (user.role === 'passenger') {
        window.location.href = '../pt/index.html';
    }
}
checkPermission();

// 2. Helper para mensagens de erro amigáveis
function getErrorMessage(code) {
    const errors = {
        'USER_EMAIL_EXISTS': 'Esse email já está a ser utilizado por outro membro.',
        'AUTH_INVALID_CREDENTIALS': 'Dados incorretos.',
        'UPDATE_NO_DATA': 'Não selecionou nenhuns dados para alterar.',
        'USER_NOT_FOUND': 'Utilizador não encontrado.',
        'Conflict': 'Conflito de dados (ex: email duplicado).'
    };
    return errors[code] || code || 'Ocorreu um erro desconhecido.';
}

// 3. Carregar Lista
async function loadStaff() {
    const tbody = document.getElementById('staffTableBody');
    const loadingMsg = document.getElementById('loadingMessage');
    
    tbody.innerHTML = '';
    loadingMsg.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();

        loadingMsg.style.display = 'none';

        users.forEach(user => {
            let badgeClass = 'badge-passenger';
            let roleName = 'Passageiro';

            if (user.role === 'owner') { 
                badgeClass = 'badge-owner'; roleName = 'Owner';
            } else if (user.role === 'highrank') {
                badgeClass = 'badge-owner'; roleName = 'Admin';
            } else if (user.role === 'staff') {
                badgeClass = 'badge-staff'; roleName = 'Motorista';
            }

            const safeUsername = user.robloxUsername || '';
            const safeEmail = user.email || '';
            const safeRole = user.role || 'passenger';

            const row = `
                <tr>
                    <td data-label="Username"><strong>${safeUsername}</strong></td>
                    <td data-label="Email">${safeEmail}</td>
                    <td data-label="Cargo"><span class="badge ${badgeClass}">${roleName}</span></td>
                    <td data-label="Estado"><span style="color: #27ae60; font-weight:700;">● Ativo</span></td>
                    <td>
                        <button class="btn-edit" onclick="initEdit('${user.id}', '${safeUsername}', '${safeEmail}', '${safeRole}')">Editar</button>
                        <button class="btn-delete" onclick="deleteUser('${user.id}')">Remover</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        loadingMsg.innerHTML = '<span style="color:#e74c3c">Erro ao ligar ao servidor.</span>';
    }
}

// 4. Criar Novo Utilizador
const createForm = document.getElementById('createStaffForm');
if (createForm) {
    createForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const feedback = document.getElementById('createFeedback');
        
        const payload = {
            robloxUsername: document.getElementById('newUsername').value,
            email: document.getElementById('newEmail').value,
            password: document.getElementById('newPassword').value,
            role: document.getElementById('newRole').value,
            status: 'active'
        };

        try {
            feedback.textContent = "A processar...";
            feedback.className = "tuss-feedback text-blue";

            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'Erro ao criar');
            }

            feedback.textContent = "Sucesso!";
            feedback.className = "tuss-feedback text-green";
            
            createForm.reset();
            setTimeout(() => {
                closeCreateModal();
                loadStaff();
                feedback.textContent = "";
            }, 1000);

        } catch (error) {
            feedback.textContent = getErrorMessage(error.message);
            feedback.className = "tuss-feedback text-red";
        }
    };
}

// ==========================================
// 5. LÓGICA DE EDIÇÃO (WIZARD)
// ==========================================

let currentEditId = null;
let currentEditData = {};

function initEdit(id, username, email, role) {
    currentEditId = id;
    currentEditData = { username, email, role };

    document.querySelectorAll('.edit-option input').forEach(input => input.checked = false);
    
    document.getElementById('editUserId').value = id;
    document.getElementById('editUsername').value = username;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role;
    document.getElementById('editPassword').value = '';

    resetEditModal();
    document.getElementById('editModal').classList.add('open');
}

function resetEditModal() {
    document.getElementById('editStep1').style.display = 'block';
    document.getElementById('editStaffForm').style.display = 'none';
    document.getElementById('editFeedback').textContent = '';
}

function goToEditForm() {
    const chkUser = document.getElementById('chkUsername').checked;
    const chkEmail = document.getElementById('chkEmail').checked;
    const chkPass = document.getElementById('chkPassword').checked;
    const chkRole = document.getElementById('chkRole').checked;

    if (!chkUser && !chkEmail && !chkPass && !chkRole) {
        alert("Selecione pelo menos um campo para alterar.");
        return;
    }

    document.getElementById('groupUsername').style.display = chkUser ? 'block' : 'none';
    document.getElementById('groupEmail').style.display = chkEmail ? 'block' : 'none';
    document.getElementById('groupPassword').style.display = chkPass ? 'block' : 'none';
    document.getElementById('groupRole').style.display = chkRole ? 'block' : 'none';

    document.getElementById('editStep1').style.display = 'none';
    document.getElementById('editStaffForm').style.display = 'block';
}

document.getElementById('editStaffForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const feedback = document.getElementById('editFeedback');
    const updatePayload = {};

    // Só adiciona ao payload se o campo estiver visível (selecionado no passo 1)
    if (document.getElementById('groupUsername').style.display !== 'none') {
        updatePayload.robloxUsername = document.getElementById('editUsername').value;
    }
    if (document.getElementById('groupEmail').style.display !== 'none') {
        updatePayload.email = document.getElementById('editEmail').value;
    }
    if (document.getElementById('groupRole').style.display !== 'none') {
        updatePayload.role = document.getElementById('editRole').value;
    }
    if (document.getElementById('groupPassword').style.display !== 'none') {
        const pass = document.getElementById('editPassword').value;
        if (pass && pass.trim() !== '') updatePayload.password = pass;
    }

    try {
        feedback.textContent = "A atualizar...";
        feedback.className = "tuss-feedback text-blue";

        const response = await fetch(`${API_BASE}/users/${currentEditId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
            // AQUI ESTÁ O TRUQUE: Ler a mensagem de erro do backend
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Erro genérico');
        }

        feedback.textContent = "Dados atualizados!";
        feedback.className = "tuss-feedback text-green";

        // Se editou o próprio utilizador, atualizar sessão
        const sessionUser = JSON.parse(localStorage.getItem('tuss_user'));
        if (sessionUser.id === currentEditId) {
             if (updatePayload.robloxUsername) sessionUser.robloxUsername = updatePayload.robloxUsername;
             if (updatePayload.role) sessionUser.role = updatePayload.role;
             if (updatePayload.email) sessionUser.email = updatePayload.email;
             localStorage.setItem('tuss_user', JSON.stringify(sessionUser));
             setTimeout(() => location.reload(), 1000);
             return;
        }

        setTimeout(() => {
            closeEditModal();
            loadStaff();
            feedback.textContent = "";
        }, 1000);

    } catch (error) {
        // Mostra a mensagem traduzida pelo getErrorMessage
        feedback.textContent = getErrorMessage(error.message);
        feedback.className = "tuss-feedback text-red";
    }
};

function closeEditModal() { document.getElementById('editModal').classList.remove('open'); }

// 6. ELIMINAR
let userToDeleteId = null;

function deleteUser(id) {
    userToDeleteId = id;
    document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
    userToDeleteId = null;
}

const confirmBtn = document.getElementById('confirmDeleteBtn');
if (confirmBtn) {
    confirmBtn.onclick = async () => {
        if (!userToDeleteId) return;
        try {
            confirmBtn.textContent = "A eliminar...";
            await fetch(`${API_BASE}/users/${userToDeleteId}`, { method: 'DELETE' });
            closeDeleteModal();
            loadStaff(); 
            confirmBtn.textContent = "Sim, Eliminar"; 
        } catch (error) {
            alert("Erro ao eliminar.");
            confirmBtn.textContent = "Sim, Eliminar";
        }
    };
}

function openCreateModal() { document.getElementById('createModal').classList.add('open'); }
function closeCreateModal() { document.getElementById('createModal').classList.remove('open'); }

loadStaff();