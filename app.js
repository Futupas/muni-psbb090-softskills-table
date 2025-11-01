'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const MAX_ITEMS_PER_TEAM = 5;
    const MAX_WEIGHT_PER_TEAM = 10;
    const TEAM_NAMES = ['Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    const ITEMS = [
        { id: 1, name: 'Počítač', count: 3, weight: 5 },
        { id: 2, name: 'Monitor', count: 5, weight: 3.5 },
        { id: 3, name: 'Klávesnice', count: 10, weight: 0.8 },
        { id: 4, name: 'Myš', count: 15, weight: 0.2 },
        { id: 5, name: 'Tiskárna', count: 2, weight: 8 },
        { id: 6, name: 'Projektor', count: 1, weight: 4.5 },
    ];

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

    // --- Application State ---
    let itemsState = JSON.parse(JSON.stringify(ITEMS));
    let teamsState = [];
    let draggedItemInfo = null; // { item, source, teamId (if from team), instanceId (if from team) }
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
                    <button class="remove-team-btn" data-id="${team.id}">&times;</button>
                </div>
                <div class="team-info">
                    Položek: ${team.items.length} / ${MAX_ITEMS_PER_TEAM}<br>
                    Hmotnost: ${totalWeight.toFixed(2)} kg / ${MAX_WEIGHT_PER_TEAM} kg
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
        adjustTeamHeights();
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
        e.stopPropagation(); // Prevent team drag events from firing
        const itemId = parseInt(this.dataset.itemId);
        const teamId = parseInt(this.dataset.teamId);
        const instanceId = parseInt(this.dataset.instanceId);
        const item = itemsState.find(p => p.id === itemId);
        
        draggedItemInfo = { item: { ...item }, source: 'team', teamId, instanceId };
        this.classList.add('dragging');
    }
    
    function handleDragEnd() {
        this.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        draggedItemInfo = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        // Add visual cue only if it's a valid drop target
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
            showNotification(`Tým "${team.name}" má již maximální počet položek.`);
            return;
        }
        if (totalWeight + item.weight > MAX_WEIGHT_PER_TEAM) {
            showNotification(`Přidáním této položky by tým "${team.name}" překročil maximální hmotnost.`);
            return;
        }

        const sourceItem = itemsState.find(p => p.id === item.id);
        if (sourceItem.count > 0) {
            sourceItem.count--;
            team.items.push({ ...item, instanceId: Date.now() }); // Unique ID for this specific instance
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
        notificationEl.textContent = message;
        notificationEl.style.display = 'block';
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
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

    const adjustTeamHeights = () => {
        const teams = teamsContainer.querySelectorAll('.team');
        if (teams.length > 0) {
            const containerHeight = teamsContainer.clientHeight;
            const newHeight = containerHeight / teams.length;
            const minHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--min-team-height'));
            
            teams.forEach(team => {
                team.style.height = `${Math.max(newHeight, minHeight)}px`;
            });
        }
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

            if (type === 'number') {
                return (valA - valB) * modifier;
            } else {
                return valA.localeCompare(valB, 'cs') * modifier;
            }
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
            
            // Enforce minimum width
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
    
    new ResizeObserver(adjustTeamHeights).observe(teamsContainer);

    // --- Initialization ---
    rerender();
});
