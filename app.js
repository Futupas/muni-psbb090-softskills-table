'use strict';

//todo remove potentional XSS

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const MAX_ITEMS_PER_TEAM = 5;
    const MAX_WEIGHT_PER_TEAM = 10;
    const TEAM_NAMES = [
        'Profesionální Přeživší',
        'Společenstvo Prstenu a Rumun',
        'Trosečníci s.r.o.',
        'Kapitáni Vlastní Vany',
        'Posádka Létajícího Špagetového Monstra',
        'Experti na Kokosy',
        'Lovci Selfie Tyčí',
        'Klub Otrhaných Dobrodruhů',
        'Jednorožci Apokalypsy',
        'Syndikát Lávových Lamp'
    ];
    const ITEMS = [
        { id: 1, name: 'Duct Tape', count: 10, weight: 1 },
        { id: 2, name: 'Litr motorového oleje', count: 10, weight: 1 },
        { id: 3, name: 'Multifunkční nůž', count: 10, weight: 0 },
        { id: 4, name: 'Kompas', count: 10, weight: 0 },
        { id: 5, name: 'Rybářský vlasec a háčky', count: 10, weight: 0 },
        { id: 6, name: 'Héliová lahev (malá, na párty balónky)', count: 9, weight: 0.5 },
        { id: 7, name: 'Stojan na ubrousky', count: 9, weight: 0.5 },
        { id: 8, name: 'Lávová lampa', count: 9, weight: 0.5 },
        { id: 9, name: 'Vaflovač', count: 8, weight: 0.5 },
        { id: 10, name: 'Selfie tyč', count: 8, weight: 0.5 },
        { id: 11, name: 'Hřebínek', count: 8, weight: 0.5 },
        { id: 12, name: 'Bowlingová koule', count: 7, weight: 1 },
        { id: 13, name: 'Maska jednorožce', count: 7, weight: 0.5 },
        { id: 14, name: 'Podtácky na pivo', count: 7, weight: 0.5 },
        { id: 15, name: 'Lano (15 metrů)', count: 2, weight: 2 },
        { id: 16, name: 'Benzín (1l)', count: 2, weight: 1 },
        { id: 17, name: 'Sekera', count: 2, weight: 2 },
        { id: 18, name: 'Světlice (s jednou ranou)', count: 2, weight: 1 },
        { id: 19, name: 'Sextant', count: 2, weight: 1 },
        { id: 20, name: 'Hodinky', count: 2, weight: 0 },
        { id: 21, name: 'Zapalovač', count: 2, weight: 0 },
        { id: 22, name: 'Flashlight', count: 2, weight: 1 },
        { id: 23, name: 'Lupa', count: 2, weight: 0.5 },
        { id: 24, name: 'Kniha "Jak přežít v divočině"', count: 2, weight: 1 },
        { id: 25, name: 'Turistická sada', count: 2, weight: 4 },
        { id: 26, name: 'Nepromokavá plachta (3x3m)', count: 2, weight: 2 },
        { id: 27, name: 'Teplé oblečení', count: 2, weight: 2 },
        { id: 28, name: 'Hrnec', count: 2, weight: 1 },
        { id: 29, name: '5l pitné vody', count: 2, weight: 5 },
        { id: 30, name: 'Jídlo', count: 2, weight: 5 },
        { id: 31, name: 'Vodní filtr', count: 2, weight: 2 },
        { id: 32, name: 'Sůl (1kg)', count: 2, weight: 1 },
        { id: 33, name: 'Lékárnička', count: 2, weight: 3 },
        { id: 34, name: 'Rum (1l)', count: 2, weight: 1 },
        { id: 35, name: 'Nafukovací záchranný člun (v batohu)', count: 1, weight: 6 },
        { id: 36, name: 'Rubikova kostka', count: 1, weight: 0.5 }
    ];

    const NOTIFICATION_TIMEOUT = 5000;

    // --- DOM Elements ---
    const container = document.getElementById('container');
    const tableBody = document.getElementById('item-table-body');
    const tableHeader = document.querySelector('#item-table thead');
    const teamsContainer = document.getElementById('teams-container');
    const addTeamBtn = document.getElementById('add-team-btn');
    const resizer = document.getElementById('resizer');
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const notificationEl = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationCloseBtn = document.getElementById('notification-close');

    // --- Application State ---
    let itemsState = JSON.parse(JSON.stringify(ITEMS));
    // Initialize with two default teams
    let teamsState = [
        { id: Date.now(), name: TEAM_NAMES[0], items: [] },
        { id: Date.now() + 1, name: TEAM_NAMES[1], items: [] }
    ];
    let draggedItemInfo = null;
    let sortState = { column: 'name', direction: 'asc' };

    // --- Render Functions ---
    const renderTable = () => {
        tableBody.innerHTML = '';
        sortTable(); // Sort before rendering
        itemsState.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.draggable = item.count > 0;
            row.classList.toggle('empty', item.count === 0);
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.count}</td>
                <td>${item.weight}</td>
            `;
            row.addEventListener('dragstart', handleTableDragStart);
            row.addEventListener('dragend', handleDragEnd);
            tableBody.appendChild(row);
        });
    };

    const renderTeams = () => {
        teamsContainer.innerHTML = '';
        teamsState.forEach(team => {
            const teamEl = document.createElement('div');
            teamEl.classList.add('team');
            teamEl.dataset.id = team.id;
            const totalWeight = team.items.reduce((sum, item) => sum + item.weight, 0);
            let itemsHtml = '';
            team.items.forEach(item => {
                itemsHtml += `
                    <li draggable="true" data-item-id="${item.id}" data-team-id="${team.id}" data-instance-id="${item.instanceId}">
                        <span class="team-item-name">${item.name}</span>
                        <span class="team-item-details">1 ks / ${item.weight.toFixed(1)} kg</span>
                    </li>`;
            });
            teamEl.innerHTML = `
                <div class="team-header">
                    <input type="text" class="team-name" value="${team.name}" data-id="${team.id}">
                    <span class="team-header-stats">
                        ${team.items.length}/${MAX_ITEMS_PER_TEAM} věcí, ${totalWeight.toFixed(1)}/${MAX_WEIGHT_PER_TEAM} kg
                    </span>
                    <button class="remove-team-btn" data-id="${team.id}">&times;</button>
                </div>
                <ul class="team-item-list">${itemsHtml}</ul>
            `;
            teamEl.addEventListener('dragover', handleDragOver);
            teamEl.addEventListener('dragleave', handleDragLeave);
            teamEl.addEventListener('drop', handleDropOnTeam);
            teamEl.querySelectorAll('.team-item-list li').forEach(li => {
                li.addEventListener('dragstart', handleTeamDragStart);
                li.addEventListener('dragend', handleDragEnd);
            });
            teamsContainer.appendChild(teamEl);
        });
    };

    const rerender = () => {
        renderTable();
        renderTeams();
    };

    // --- Drag and Drop Handlers ---
    function handleTableDragStart(e) {
        const itemId = parseInt(this.dataset.id);
        const item = itemsState.find(p => p.id === itemId);
        draggedItemInfo = { item: { ...item }, source: 'table' };
        this.classList.add('dragging');
    }

    function handleTeamDragStart(e) {
        e.stopPropagation();
        const itemId = parseInt(this.dataset.itemId);
        const teamId = parseInt(this.dataset.teamId);
        const instanceId = parseInt(this.dataset.instanceId);
        const item = itemsState.find(p => p.id === itemId);
        draggedItemInfo = { item: { ...item }, source: 'team', teamId, instanceId };
        this.classList.add('dragging');
    }

    function handleDragEnd(e) {
        // Use a small timeout to ensure this runs after the drop event
        setTimeout(() => {
            document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            draggedItemInfo = null;
        }, 0);
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        const targetIsTeam = e.currentTarget.classList.contains('team');
        const targetIsTable = e.currentTarget.id === 'item-table-body';
        if ((targetIsTeam && draggedItemInfo?.source === 'table') ||
            (targetIsTable && draggedItemInfo?.source === 'team')) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDropOnTeam(e) {
        e.preventDefault();
        if (draggedItemInfo?.source !== 'table') return;

        const teamId = parseInt(this.dataset.id);
        const team = teamsState.find(t => t.id === teamId);
        const item = draggedItemInfo.item;

        if (!team || !item) return;

        const totalWeight = team.items.reduce((sum, p) => sum + p.weight, 0);

        if (team.items.length >= MAX_ITEMS_PER_TEAM) {
            return showNotification(`Tým "${team.name}" má již maximální počet položek.`);
        }
        if (totalWeight + item.weight > MAX_WEIGHT_PER_TEAM) {
            return showNotification(`Přidáním této položky by tým "${team.name}" překročil maximální hmotnost.`);
        }

        const sourceItem = itemsState.find(p => p.id === item.id);
        if (sourceItem.count > 0) {
            sourceItem.count--;
            team.items.push({ ...item, instanceId: Date.now() });
            rerender();
        }
    }

    function handleDropOnTable(e) {
        e.preventDefault();
        if (draggedItemInfo?.source !== 'team') return;
        const { item, teamId, instanceId } = draggedItemInfo;
        const sourceItem = itemsState.find(p => p.id === item.id);
        const sourceTeam = teamsState.find(t => t.id === teamId);
        if (sourceItem && sourceTeam) {
            sourceItem.count++;
            sourceTeam.items = sourceTeam.items.filter(i => i.instanceId !== instanceId);
            rerender();
        }
    }

    // --- Other Functions ---
    const showNotification = (message) => {
        notificationMessage.textContent = message; // Target the inner span
        notificationEl.style.display = 'block';
        // The timeout now just hides it, it doesn't clear content
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, NOTIFICATION_TIMEOUT); // Increased timeout slightly
    };

    const addTeam = () => {
        const usedNames = teamsState.map(t => t.name);
        const availableNames = TEAM_NAMES.filter(n => !usedNames.includes(n));
        const newName = availableNames.length > 0 ? availableNames[0] : `Tým ${teamsState.length + 1}`;
        teamsState.push({ id: Date.now(), name: newName, items: [] });
        renderTeams();
    };

    const removeTeam = (teamId) => {
        const teamIndex = teamsState.findIndex(t => t.id === teamId);
        if (teamIndex === -1) return;
        const team = teamsState[teamIndex];
        team.items.forEach(teamItem => {
            const originalItem = itemsState.find(p => p.id === teamItem.id);
            if (originalItem) originalItem.count++;
        });
        teamsState.splice(teamIndex, 1);
        rerender();
    };

    const sortTable = () => {
        const { column, direction } = sortState;
        const inStock = itemsState.filter(item => item.count > 0);
        const outOfStock = itemsState.filter(item => item.count === 0);
        const type = (column === 'name') ? 'string' : 'number';

        inStock.sort((a, b) => {
            const valA = a[column];
            const valB = b[column];
            const modifier = direction === 'asc' ? 1 : -1;
            if (type === 'number') return (valA - valB) * modifier;
            return valA.localeCompare(valB, 'cs') * modifier;
        });
        itemsState = [...inStock, ...outOfStock];
    };

    // --- Event Listeners ---
    addTeamBtn.addEventListener('click', addTeam);

    teamsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-team-btn')) {
            removeTeam(parseInt(e.target.dataset.id));
        }
    });

    teamsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('team-name')) {
            const team = teamsState.find(t => t.id === parseInt(e.target.dataset.id));
            if (team) team.name = e.target.value;
        }
    });

    tableHeader.addEventListener('click', (e) => {
        const headerCell = e.target.closest('th');
        if (headerCell) {
            const column = headerCell.dataset.column;
            if (sortState.column === column) {
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.column = column;
                sortState.direction = 'asc';
            }
            renderTable();
        }
    });

    tableBody.addEventListener('dragover', handleDragOver);
    tableBody.addEventListener('dragleave', handleDragLeave);
    tableBody.addEventListener('drop', handleDropOnTable);

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const handleMouseMove = (moveEvent) => {
            const containerRect = container.getBoundingClientRect();
            const minWidthPx = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--min-panel-width')) / 100) * containerRect.width;
            let newLeftWidth = moveEvent.clientX - containerRect.left;
            newLeftWidth = Math.max(newLeftWidth, minWidthPx);
            newLeftWidth = Math.min(newLeftWidth, containerRect.width - minWidthPx);
            const percentage = (newLeftWidth / containerRect.width) * 100;
            leftPanel.style.width = `${percentage}%`;
            rightPanel.style.width = `${100 - percentage}%`;
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    });

    notificationCloseBtn.addEventListener('click', () => {
        notificationEl.style.display = 'none';
    });

    // --- Initialization ---
    rerender();
});
