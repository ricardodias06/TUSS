const API_BASE = 'http://localhost:3000';
let currentUser = null;

async function init() {
    const userJson = localStorage.getItem('tuss_user');
    if (!userJson) { window.location.href = '../pt/login.html'; return; }
    currentUser = JSON.parse(userJson);

    if (currentUser.role === 'owner' || currentUser.role === 'highrank') {
        const controls = document.querySelectorAll('.admin-only');
        controls.forEach(el => el.style.display = 'flex');
    }

    loadAllShifts();
}

async function loadAllShifts() {
    toggleLoading(true);
    const container = document.getElementById('shiftsContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/shifts`);
        const shifts = await res.json();
        renderShifts(shifts);
    } catch (e) {
        container.innerHTML = '<p class="status-message">Erro de ligação ao servidor.</p>';
    }
    toggleLoading(false);
}

function renderShifts(shifts) {
    const container = document.getElementById('shiftsContainer');
    const emptyMsg = document.getElementById('emptyMessage');
    if (!container) return;

    container.innerHTML = '';

    if (!shifts || shifts.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    // Ordenar por hora de início
    shifts.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

    shifts.forEach(shift => {
        // Se o motorista for "Vago" ou o status não for 'active', fica cinzento
        const isUnassigned = (shift.driverName === 'Vago' || shift.status !== 'active');
        
        const card = document.createElement('div');
        card.className = `shift-card ${isUnassigned ? 'unassigned' : ''}`;

        card.innerHTML = `
            ${(currentUser.role === 'owner') ? `<button class="btn-delete-shift" onclick="deleteShift('${shift.id}')">&times;</button>` : ''}
            
            <div class="shift-banner">
                <span>LINHA ${shift.line || "?"}</span>
                <small>${shift.tourNumber || ""}</small>
            </div>

            <div class="shift-body">
                <div class="shift-times">
                    <div class="time-box">
                        <label>Início</label>
                        <span>${shift.startTime || "--:--"}</span>
                    </div>
                    <div class="time-separator">→</div>
                    <div class="time-box">
                        <label>Fim</label>
                        <span>${shift.endTime || "--:--"}</span>
                    </div>
                </div>

                <div class="shift-info-row">
                    <div class="info-item" style="border-right: 1px solid #ddd;">
                        <label>AUTOCARRO</label>
                        <span>${shift.vehicleDetails || "A definir"}</span>
                    </div>
                    <div class="info-item">
                        <label>MOTORISTA</label>
                        <span>${shift.driverName || "Vago"}</span>
                    </div>
                </div>
            </div>

            <div class="shift-footer" style="color: ${isUnassigned ? '#999' : '#00994d'}">
                ${isUnassigned ? 'AGUARDAR DISPATCH' : '✓ SERVIÇO CONFIRMADO'}
            </div>
        `;
        container.appendChild(card);
    });
}

async function importDailyShifts() {
    if (!confirm("Sincronizar escalas com o Google Sheets agora?")) return;
    toggleLoading(true, "A aceder ao Google Sheets...");

    try {
        const res = await fetch(`${API_BASE}/shifts/import-daily`, { method: 'POST' });
        const data = await res.json();
        alert(`Sucesso! ${data.count} turnos processados.`);
        loadAllShifts();
    } catch (e) {
        alert("Erro na sincronização.");
    }
    toggleLoading(false);
}

async function deleteShift(id) {
    if(!confirm("Apagar este turno?")) return;
    try {
        await fetch(`${API_BASE}/shifts/${id}`, { method: 'DELETE' });
        loadAllShifts();
    } catch(e) { console.error(e); }
}

function toggleLoading(show, text = "A carregar escalas...") {
    const loader = document.getElementById('loadingMessage');
    const loaderText = document.getElementById('loadingText');
    if (loader) loader.style.display = show ? 'block' : 'none';
    if (loaderText) loaderText.textContent = text;
}

init();