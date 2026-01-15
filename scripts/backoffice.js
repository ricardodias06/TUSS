// VARIÁVEIS GLOBAIS DE CONFIGURAÇÃO
const ENDPOINTS = {
    fuel: '/fuel-types',
    trans: '/transmissions',
    status: '/bus-statuses',
    rank: '/ranks'
};

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    const user = getCurrentUser();
    
    if (!user || (user.role !== 'owner' && user.role !== 'staff')) {
        window.location.href = 'hub.html';
        return;
    }

    setupUI(user);
    loadFleetTable();
});

function setupUI(user) {
    document.getElementById('admin-name').textContent = user.displayName;
    
    const avatarEl = document.getElementById('admin-avatar');
    if (user.robloxId && user.robloxId !== "000000") {
        const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : "http://localhost:3000";
        avatarEl.src = `${baseUrl}/roblox/avatar/${user.robloxId}`;
    }

    // Forms Listeners
    document.getElementById('busForm').addEventListener('submit', handleBusSubmit);
    document.getElementById('simpleForm').addEventListener('submit', handleSimpleSubmit);
    
    // Pre-load selects
    loadDropdowns();
}

window.switchSection = function(sectionId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`section-${sectionId}`).classList.add('active');

    if (sectionId === 'settings') {
        loadSettings();
    } else if (sectionId === 'fleet') {
        loadFleetTable();
        loadDropdowns();
    }
};

// --- GESTÃO DE FROTA ---
async function loadFleetTable() {
    const tbody = document.querySelector('#fleet-table tbody');
    // REMOVIDO STYLE INLINE: usa classe 'text-center'
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">A carregar...</td></tr>`;

    try {
        const filter = { include: [{relation: 'fuelType'}, {relation: 'status'}, {relation: 'transmission'}] };
        const encoded = encodeURIComponent(JSON.stringify(filter));
        const res = await apiRequest(`/buses?filter=${encoded}`);
        const buses = await res.json();

        const counter = document.getElementById('stat-buses-header');
        if(counter) counter.textContent = buses.length;

        tbody.innerHTML = '';
        if (buses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Sem veículos.</td></tr>`;
            return;
        }

        buses.forEach(bus => {
            const tr = document.createElement('tr');
            // REMOVIDO STYLE INLINE: usa classes 'btn-text btn-danger'
            tr.innerHTML = `
                <td><strong>${bus.busNumber}</strong></td>
                <td>${bus.licensePlate}</td>
                <td>${bus.name}</td>
                <td><span class="status-dot ${getStatusColor(bus.status?.name)}"></span>${bus.status?.name || '-'}</td>
                <td>${bus.fuelType?.name || '-'}</td>
                <td>
                    <button class="btn-text btn-danger" onclick="deleteBus(${bus.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
    }
}

// --- GESTÃO DE DEFINIÇÕES ---
async function loadSettings() {
    loadSettingList('fuel', 'list-fuel');
    loadSettingList('trans', 'list-trans');
    loadSettingList('status', 'list-status');
    loadSettingList('rank', 'list-rank');
}

async function loadSettingList(type, listId) {
    const list = document.getElementById(listId);
    list.innerHTML = '<li class="text-muted">A carregar...</li>';

    try {
        const res = await apiRequest(ENDPOINTS[type]);
        const items = await res.json();

        list.innerHTML = '';
        if(items.length === 0) {
            list.innerHTML = '<li class="text-muted">Vazio</li>';
            return;
        }

        items.forEach(item => {
            list.innerHTML += `
                <li>
                    ${item.name}
                    <button class="btn-trash-small" onclick="deleteSettingItem('${type}', ${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </li>
            `;
        });
    } catch (e) {
        list.innerHTML = '<li class="text-danger">Erro</li>';
    }
}

// Resto das funções (Modals, Submits) mantêm-se iguais porque já usavam classes
window.openSimpleModal = function(type) {
    document.getElementById('simpleItemType').value = type;
    document.getElementById('simpleItemName').value = '';
    
    const titles = { fuel: 'Novo Combustível', trans: 'Nova Transmissão', status: 'Novo Estado', rank: 'Novo Cargo' };
    document.getElementById('simpleModalTitle').textContent = titles[type] || 'Novo Item';
    
    openModal('simpleModal');
};

async function handleSimpleSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('simpleItemType').value;
    const name = document.getElementById('simpleItemName').value;

    try {
        await apiRequest(ENDPOINTS[type], {
            method: 'POST',
            body: JSON.stringify({ name: name })
        });
        
        closeModal('simpleModal');
        const listMap = { fuel: 'list-fuel', trans: 'list-trans', status: 'list-status', rank: 'list-rank' };
        loadSettingList(type, listMap[type]);
        
    } catch (e) {
        alert("Erro ao criar item.");
    }
}

async function deleteSettingItem(type, id) {
    if(!confirm("Tem a certeza?")) return;
    try {
        await apiRequest(`${ENDPOINTS[type]}/${id}`, { method: 'DELETE' });
        const listMap = { fuel: 'list-fuel', trans: 'list-trans', status: 'list-status', rank: 'list-rank' };
        loadSettingList(type, listMap[type]);
    } catch (e) {
        alert("Erro ao apagar.");
    }
}

async function loadDropdowns() {
    try {
        const [fuels, statuses, trans] = await Promise.all([
            apiRequest(ENDPOINTS.fuel).then(r => r.json()),
            apiRequest(ENDPOINTS.status).then(r => r.json()),
            apiRequest(ENDPOINTS.trans).then(r => r.json())
        ]);
        fillSelect('fuelSelect', fuels);
        fillSelect('statusSelect', statuses);
        fillSelect('transSelect', trans);
    } catch (e) { console.error(e); }
}

function fillSelect(id, items) {
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = '<option value="">Selecionar...</option>';
    items.forEach(i => el.innerHTML += `<option value="${i.id}">${i.name}</option>`);
}

async function handleBusSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
        busNumber: fd.get('busNumber'),
        licensePlate: fd.get('licensePlate'),
        name: fd.get('name'),
        fuelTypeId: Number(fd.get('fuelTypeId')),
        transmissionId: Number(fd.get('transmissionId')),
        statusId: Number(fd.get('statusId'))
    };

    try {
        await apiRequest('/buses', { method: 'POST', body: JSON.stringify(data) });
        closeModal('busModal');
        e.target.reset();
        loadFleetTable();
    } catch (err) { alert("Erro ao criar."); }
}

async function deleteBus(id) {
    if(!confirm("Apagar veículo?")) return;
    try { await apiRequest(`/buses/${id}`, { method: 'DELETE' }); loadFleetTable(); } catch(e) { alert("Erro ao apagar."); }
}

function getStatusColor(s) {
    if(!s) return '';
    s = s.toLowerCase();
    if(s.includes('operacional')) return 'bg-success';
    if(s.includes('oficina') || s.includes('manutenção')) return 'bg-warning';
    return 'bg-danger';
}

window.openModal = (id) => document.getElementById(id).classList.add('active');
window.closeModal = (id) => document.getElementById(id).classList.remove('active');