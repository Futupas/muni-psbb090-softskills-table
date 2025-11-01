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
    const tableBody = document.querySelector('#item-table tbody');
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
    let draggedItemId = null;

    // --- Functions ---

    /**
     * Renders the item table.
     */
    const renderTable = () => {
        tableBody.innerHTML = '';
        itemsState.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.draggable = item.count > 0;
            if (item.count === 0) {
                row.classList.add('empty');
            }
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.count}</td>
                <td>${item.weight}</td>
            `;
            row.addEventListener('dragstart', handleDragStart);
            tableBody.appendChild(row);
        });
    };

    /**
     * Renders all teams.
     */
    const renderTeams = () => {
        teamsContainer.innerHTML = '';
        teamsState.forEach(team => {
            const teamEl = document.createElement('div');
            teamEl.classList.add('team');
            teamEl.dataset.id = team.id;

            const totalWeight = team.items.reduce((sum, item) => sum + item.weight, 0);

            teamEl.innerHTML = `
                <div class='team-header'>
                    <input type='text' class='team-name' value='${team.name}' data-id='${team.id}'>
                    <button class='remove-team-btn' data-id='${team.id}'>&times;</button>
                </div>
                <div class='team-info'>
                    Položek: ${team.items.length} / ${MAX_ITEMS_PER_TEAM}<br>
                    Hmotnost: ${totalWeight.toFixed(2)} kg / ${MAX_WEIGHT_PER_TEAM} kg
                </div>
                <ul class='team-item-list'>
                    ${team.items.map(p => `<li>${p.name}</li>`).join('')}
                </ul>
            `;
            teamEl.addEventListener('dragover', handleDragOver);
            teamEl.addEventListener('dragleave', handleDragLeave);
            teamEl.addEventListener('drop', handleDrop);
            teamsContainer.appendChild(teamEl);
        });
        adjustTeamHeights();
    };
    
    /**
     * Shows a notification message.
     * @param {string} message - The message to display.
     */
    const showNotification = (message) => {
        notificationEl.textContent = message;
        notificationEl.style.display = 'block';
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
    };

    /**
     * Adds a new team.
     */
    const addTeam = () => {
        const usedNames = teamsState.map(t => t.name);
        const availableNames = TEAM_NAMES.filter(n => !usedNames.includes(n));
        const newName = availableNames.length > 0 ? availableNames[0] : `Tým ${teamsState.length + 1}`;
        
        const newTeam = {
            id: Date.now(),
            name: newName,
            items: []
        };
        teamsState.push(newTeam);
        renderTeams();
    };

    /**
     * Removes a team and returns its items to the main list.
     * @param {number} teamId - The ID of the team to remove.
     */
    const removeTeam = (teamId) => {
        const team = teamsState.find(t => t.id === teamId);
        if (!team) return;

        // Return items to the table
        team.items.forEach(teamItem => {
            const originalItem = itemsState.find(p => p.id === teamItem.id);
            if (originalItem) {
                originalItem.count++;
            }
        });

        teamsState = teamsState.filter(t => t.id !== teamId);
        renderTable();
        renderTeams();
    };

    /**
     * Changes a team's name.
     * @param {number} teamId - The ID of the team.
     * @param {string} newName - The new name.
     */
    const changeTeamName = (teamId, newName) => {
        const team = teamsState.find(t => t.id === teamId);
        if (team) {
            team.name = newName;
        }
    };
    
    /**
     * Adjusts team heights to fill the available space.
     */
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

    /**
     * Sorts the item table by a column.
     * @param {string} column - The column name to sort by.
     * @param {string} type - The data type ('string' or 'number').
     */
    const sortTable = (column, type) => {
        const headerCell = tableHeader.querySelector(`[data-column="${column}"]`);
        const direction = headerCell.dataset.direction === 'asc' ? 'desc' : 'asc';
        
        tableHeader.querySelectorAll('th').forEach(th => th.dataset.direction = '');
        headerCell.dataset.direction = direction;

        itemsState.sort((a, b) => {
            const valA = a[column];
            const valB = b[column];

            if (type === 'number') {
                return direction === 'asc' ? valA - valB : valB - valA;
            } else {
                return direction === 'asc' ? valA.localeCompare(valB, 'cs') : valB.localeCompare(valA, 'cs');
            }
        });
        renderTable();
    };

    // --- Event Handlers ---

    function handleDragStart(e) {
        draggedItemId = parseInt(this.dataset.id);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        document.querySelector('.dragging')?.classList.remove('dragging');

        const teamId = parseInt(this.dataset.id);
        const team = teamsState.find(t => t.id === teamId);
        const item = itemsState.find(p => p.id === draggedItemId);

        if (!team || !item) return;
        
        const totalWeight = team.items.reduce((sum, p) => sum + p.weight, 0);

        // Validation
        if (team.items.length >= MAX_ITEMS_PER_TEAM) {
            showNotification(`Tým "${team.name}" má již maximální počet položek.`);
            return;
        }
        if (totalWeight + item.weight > MAX_WEIGHT_PER_TEAM) {
            showNotification(`Přidáním této položky by tým "${team.name}" překročil maximální hmotnost.`);
            return;
        }

        // Move the item
        item.count--;
        team.items.push({ ...item }); // Add a copy to the team

        renderTable();
        renderTeams();
    }
    
    // --- Event Listeners ---
    addTeamBtn.addEventListener('click', addTeam);

    teamsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-team-btn')) {
            const teamId = parseInt(e.target.dataset.id);
            removeTeam(teamId);
        }
    });

    teamsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('team-name')) {
            const teamId = parseInt(e.target.dataset.id);
            const newName = e.target.value;
            changeTeamName(teamId, newName);
        }
    });
    
    tableHeader.addEventListener('click', (e) => {
        const headerCell = e.target.closest('th');
        if (headerCell) {
            const column = headerCell.dataset.column;
            const type = (column === 'name') ? 'string' : 'number';
            sortTable(column, type);
        }
    });

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startX = e.pageX;
        const startLeftWidth = leftPanel.offsetWidth;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.pageX - startX;
            const newLeftWidth = startLeftWidth + deltaX;
            const percentage = (newLeftWidth / document.body.clientWidth) * 100;
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
    renderTable();
});
