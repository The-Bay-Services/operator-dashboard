// Schedule Management
const ScheduleManager = {
    // Default schedule data
    data: {
        operators: {},
        management: {}
    },

    // Initialize schedules
    init() {
        // Try to load saved schedule data
        const saved = localStorage.getItem('scheduleData');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            // Set up default operator schedule for Monday if no saved data
            this.data.operators.Monday = [
                { operator: "Vuqar/David", time: "8:00-11:00" },
                { operator: "Kanan/Kenny", time: "11:00-13:00" },
                { operator: "Nahida/Emma", time: "13:00-15:00" },
                { operator: "Narmina/Nora", time: "15:00-20:00" },
                { operator: "Orxan/Eric", time: "20:00-22:00" }
            ];

            // Set up default management schedule for Monday
            this.data.management.Monday = [
                { operator: "Vuqar/David", time: "9:00-17:00" },
                { operator: "Nahida/Emma", time: "10:00-18:00" }
            ];
            
            // Save default data
            this.saveToLocalStorage();
        }

        // Initialize UI
        this.initializeSchedules();
        this.makeScheduleEditable();
    },

    // Initialize schedule tables
    initializeSchedules() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Populate operators schedule
        const operatorsBody = document.getElementById('operators-schedule-body');
        days.forEach(day => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-3 font-medium">${day}</td>
                ${['Vuqar/David', 'Kanan/Kenny', 'Nahida/Emma', 'Narmina/Nora', 'Orxan/Eric']
                    .map(operator => `
                        <td class="p-3 schedule-cell" 
                            data-day="${day}" 
                            data-operator="${operator}" 
                            data-schedule-type="operators">OFF</td>
                    `).join('')}
            `;
            operatorsBody.appendChild(row);
        });

        // Populate management schedule
        const managementBody = document.getElementById('management-schedule-body');
        days.forEach(day => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-3 font-medium">${day}</td>
                ${['Vuqar/David', 'Nahida/Emma']
                    .map(operator => `
                        <td class="p-3 schedule-cell" 
                            data-day="${day}" 
                            data-operator="${operator}"
                            data-schedule-type="management">OFF</td>
                    `).join('')}
            `;
            managementBody.appendChild(row);
        });

        this.applyScheduleData();
    },

    // Apply schedule data to cells
    applyScheduleData() {
        document.querySelectorAll('.schedule-cell').forEach(cell => {
            const { day, operator, scheduleType } = cell.dataset;
            const schedule = this.data[scheduleType]?.[day];
            if (schedule) {
                const shift = schedule.find(s => s.operator === operator);
                if (shift) {
                    cell.textContent = shift.time;
                }
            }
        });
    },

    // Make schedule cells editable
    makeScheduleEditable() {
        document.querySelectorAll('.schedule-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const { day, operator, scheduleType } = cell.dataset;
                this.showEditPopup(cell, day, operator, scheduleType);
            });
        });
    },

    // Show edit popup
    showEditPopup(cell, day, operator, scheduleType) {
        const currentTime = cell.textContent;
        const timeInputs = {
            start: document.getElementById('editTimeStart'),
            end: document.getElementById('editTimeEnd'),
            status: document.getElementById('editTimeStatus')
        };

        if (currentTime !== 'OFF') {
            const [start, end] = currentTime.split('-');
            timeInputs.start.value = start;
            timeInputs.end.value = end;
            timeInputs.status.value = 'active';
        } else {
            timeInputs.start.value = '09:00';
            timeInputs.end.value = '17:00';
            timeInputs.status.value = 'off';
        }

        // Store current edit context
        window.currentEdit = { cell, day, operator, scheduleType };
        
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('editTimePopup').style.display = 'block';
    },

    // Save time changes
    saveTimeChanges() {
        if (!window.currentEdit) return;
        
        const { cell, day, operator, scheduleType } = window.currentEdit;
        const status = document.getElementById('editTimeStatus').value;
        
        if (status === 'off') {
            cell.textContent = 'OFF';
            this.removeSchedule(day, scheduleType, operator);
        } else {
            const start = document.getElementById('editTimeStart').value;
            const end = document.getElementById('editTimeEnd').value;
            
            if (!start || !end) {
                alert('Please enter both start and end times');
                return;
            }
            
            // Format time for display
            const timeStr = `${start}-${end}`;
            cell.textContent = timeStr;
            
            this.updateSchedule(day, scheduleType, operator, timeStr);
        }
        
        // Add highlight effect
        cell.classList.add('updated');
        
        // Close popup
        this.closeEditPopup();
    },

    // Update schedule data
    updateSchedule(day, scheduleType, operator, timeStr) {
        // Initialize the day array if it doesn't exist
        if (!this.data[scheduleType][day]) {
            this.data[scheduleType][day] = [];
        }

        // Find existing schedule or add new one
        const existingIndex = this.data[scheduleType][day].findIndex(s => s.operator === operator);
        if (existingIndex >= 0) {
            this.data[scheduleType][day][existingIndex].time = timeStr;
        } else {
            this.data[scheduleType][day].push({ operator, time: timeStr });
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
    },

    // Remove schedule
    removeSchedule(day, scheduleType, operator) {
        if (this.data[scheduleType][day]) {
            this.data[scheduleType][day] = this.data[scheduleType][day].filter(s => s.operator !== operator);
            
            // Clean up empty days
            if (this.data[scheduleType][day].length === 0) {
                delete this.data[scheduleType][day];
            }
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
    },

    // Save schedule to localStorage
    saveToLocalStorage() {
        localStorage.setItem('scheduleData', JSON.stringify(this.data));
    },

    // Load schedule from localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('scheduleData');
        if (saved) {
            this.data = JSON.parse(saved);
            this.applyScheduleData();
        }
    }
        setTimeout(() => cell.classList.remove('updated'), 1000);
        
        this.closeEditPopup();
        updateOperatorDisplay();
    },

    // Close edit popup
    closeEditPopup() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('editTimePopup').style.display = 'none';
        window.currentEdit = null;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ScheduleManager.init();
});