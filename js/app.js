// Main App Controller - Added Auto-delete for past events
class TravelPlannerApp {
    constructor() {
        this.currentTab = 'planner';
        this.itinerary = [];
        this.checklist = [];
        this.lastAddedItemId = null;
        this.draggedItemId = null;
        
        this.budgetChart = null;
        this.budgetSettings = {
            foodPerDay: 800,
            transportPerPlace: 165,
            accommodationPerNight: 1200,
            otherPerDay: 500
        };

        this.confirmAction = null;
        this.init();
    }

    init() {
        this.loadState();
        this.bindEvents();
        this.updateUI();
    }

    // *** THIS FUNCTION IS MODIFIED ***
    loadState() {
        // Load Itinerary and auto-clean past events
        try {
            const savedItinerary = localStorage.getItem('travelItinerary');
            if (savedItinerary) {
                const loadedItinerary = JSON.parse(savedItinerary);
                const originalCount = loadedItinerary.length;

                // Get the start of today's date
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Filter out events that are from before today
                this.itinerary = loadedItinerary.filter(place => {
                    // Create a date object from the event's date string for accurate comparison
                    const placeDate = new Date(place.date);
                    return placeDate >= today;
                });

                // If some items were removed, notify the user
                if (this.itinerary.length < originalCount) {
                    // Use a timeout to ensure the UI is ready to show the toast
                    setTimeout(() => this.showToast('รายการที่ผ่านไปแล้วถูกลบโดยอัตโนมัติ', 'info'), 500);
                }
            }
        } catch (e) {
            console.error("Could not parse itinerary, resetting.", e);
            this.itinerary = [];
        }

        // Load Checklist
        try {
            const storedChecklist = localStorage.getItem('travelChecklist');
            const parsedChecklist = storedChecklist ? JSON.parse(storedChecklist) : null;
            if (Array.isArray(parsedChecklist) && parsedChecklist.length > 0 && 'items' in parsedChecklist[0]) {
                 this.checklist = parsedChecklist;
            } else {
                throw new Error("Old or invalid checklist format.");
            }
        } catch (e) {
            console.error("Could not parse checklist, resetting to default.", e);
            this.checklist = [
                { id: Date.now(), name: 'เสื้อผ้า', items: [] },
                { id: Date.now() + 1, name: 'ของใช้ส่วนตัว', items: [] },
                { id: Date.now() + 2, name: 'เอกสาร', items: [] }
            ];
        }
        
        // Load Trip Info
        try {
            const tripInfo = localStorage.getItem('currentTrip');
            if (tripInfo) {
                const { name, startTime } = JSON.parse(tripInfo);
                document.getElementById('trip-name').value = name || '';
                document.getElementById('start-time').value = startTime || '09:00';
            }
        } catch (e) {
            console.error("Could not parse trip info.", e);
        }

        // Load Budget Settings
        try {
            const savedBudget = localStorage.getItem('budgetSettings');
            if (savedBudget) {
                this.budgetSettings = JSON.parse(savedBudget);
            }
        } catch(e) {
            console.error("Could not parse budget settings, using defaults.", e);
        }
        
        document.getElementById('food-cost').value = this.budgetSettings.foodPerDay;
        document.getElementById('transport-cost').value = this.budgetSettings.transportPerPlace;
        document.getElementById('accommodation-cost').value = this.budgetSettings.accommodationPerNight;
        document.getElementById('other-cost').value = this.budgetSettings.otherPerDay;
    }

    saveState() {
        localStorage.setItem('travelItinerary', JSON.stringify(this.itinerary));
        localStorage.setItem('travelChecklist', JSON.stringify(this.checklist));
        const tripData = { name: document.getElementById('trip-name').value, startTime: document.getElementById('start-time').value };
        localStorage.setItem('currentTrip', JSON.stringify(tripData));
        localStorage.setItem('budgetSettings', JSON.stringify(this.budgetSettings));
    }
    
    updateAndSave() {
        this.sortItinerary();
        this.saveState();
        this.updateUI();
    }

    bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', e => this.switchTab(e.currentTarget.dataset.tab)));
        document.getElementById('add-place-btn').addEventListener('click', () => this.openAddPlaceModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal('add-place-modal'));
        document.getElementById('cancel-add').addEventListener('click', () => this.closeModal('add-place-modal'));
        document.getElementById('confirm-add').addEventListener('click', () => this.handleConfirmAdd());
        document.getElementById('add-place-modal').addEventListener('click', e => { if (e.target.id === 'add-place-modal') this.closeModal('add-place-modal'); });
        document.querySelectorAll('.quick-place-btn').forEach(btn => btn.addEventListener('click', e => this.quickAddPlace(e.currentTarget.dataset.place)));
        document.getElementById('confirm-cancel-btn').addEventListener('click', () => this.closeModal('confirm-modal'));
        document.getElementById('confirm-ok-btn').addEventListener('click', () => this.executeConfirm());
        document.getElementById('trip-name').addEventListener('input', () => this.saveState());
        document.getElementById('start-time').addEventListener('change', () => this.saveState());
        
        this.bindChecklistEvents();
        this.bindBudgetInputEvents();
        this.bindDragAndDropEvents();
    }

    updateUI() {
        this.updateItineraryDisplay();
        this.updateBudgetDisplay();
        this.renderChecklist();
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        this.currentTab = tabName;
        if (tabName === 'budget') this.updateBudgetDisplay();
        if (tabName === 'packing') this.renderChecklist();
        if (tabName === 'planner') this.updateItineraryDisplay();
    }

    handleConfirmAdd() {
        const editingId = document.getElementById('confirm-add').dataset.editingId ? parseInt(document.getElementById('confirm-add').dataset.editingId) : null;
        const placeData = { name: document.getElementById('place-name').value.trim(), province: document.getElementById('place-province').value, date: document.getElementById('place-date').value, category: document.getElementById('place-category').value, startTime: document.getElementById('place-start-time').value, endTime: document.getElementById('place-end-time').value, fee: parseInt(document.getElementById('place-fee').value) || 0, description: document.getElementById('place-description').value.trim() };
        if (!placeData.name || !placeData.province || !placeData.date || !placeData.startTime || !placeData.endTime) { this.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); return; }
        if (this.parseTime(placeData.startTime) >= this.parseTime(placeData.endTime)) { this.showToast('เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น', 'error'); return; }
        if (this.isTimeOverlapping(placeData.date, placeData.startTime, placeData.endTime, editingId)) { this.showToast('มีกิจกรรมอื่นในช่วงเวลานี้แล้ว', 'error'); return; }
        
        placeData.duration = this.calculateDuration(placeData.startTime, placeData.endTime);
        
        if (editingId) {
            const index = this.itinerary.findIndex(p => p.id === editingId);
            if (index !== -1) this.itinerary[index] = { ...this.itinerary[index], ...placeData, id: editingId };
        } else {
            const newId = Date.now();
            this.itinerary.push({ ...placeData, id: newId });
            this.lastAddedItemId = newId;
        }

        this.updateAndSave();
        this.closeModal('add-place-modal');
        this.showToast(editingId ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มสถานที่ในแผนแล้ว', 'success');
    }

    isTimeOverlapping(date, startTime, endTime, editingId = null) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        const sameDayEvents = this.itinerary.filter(event => event.date === date && event.id !== editingId);
        return sameDayEvents.some(event => {
            const eventStart = this.parseTime(event.startTime);
            const eventEnd = this.parseTime(event.endTime);
            return start < eventEnd && eventStart < end;
        });
    }

    quickAddPlace(placeName) {
        const placeData = this.getPlaceData(placeName);
        const latestDate = this.getLatestDateFromItinerary();
        placeData.date = latestDate;
        this.openAddPlaceModal(placeData);
    }

    getLatestDateFromItinerary() {
        if (this.itinerary.length === 0) {
            return new Date().toISOString().split('T')[0];
        }
        return this.itinerary.reduce((max, place) => {
            return place.date > max ? place.date : max;
        }, this.itinerary[0].date);
    }
    
    deletePlace(id) {
        this.showConfirmation('ยืนยันการลบ', 'คุณต้องการลบสถานที่นี้ออกจากแผนใช่หรือไม่?', () => {
            this.itinerary = this.itinerary.filter(place => place.id !== id);
            this.updateAndSave(); 
            this.showToast('ลบสถานที่แล้ว', 'success');
        });
    }

    updateItineraryDisplay() {
        const container = document.getElementById('itinerary-list');
        const emptyState = document.getElementById('empty-state');
        if (!container) return;
        if (this.itinerary.length === 0) { container.innerHTML = ''; if (emptyState) emptyState.style.display = 'flex'; return; }
        if (emptyState) emptyState.style.display = 'none';
        const groupedByDate = this.itinerary.reduce((acc, place) => { const date = place.date; if (!acc[date]) acc[date] = []; acc[date].push(place); return acc; }, {});
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
        container.innerHTML = '';
        sortedDates.forEach(date => {
            const d = new Date(date);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = d.toLocaleDateString('th-TH', options);
            const section = document.createElement('div');
            section.className = 'date-section';
            section.dataset.date = date;
            section.innerHTML = `<div class="date-divider"><span class="date-text"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span></div>`;
            const placesToday = groupedByDate[date];
            placesToday.forEach(place => { section.innerHTML += this.createItineraryItemHTML(place); });
            container.appendChild(section);
        });
        container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => this.deletePlace(parseInt(e.target.closest('.itinerary-item').dataset.id))));
        container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => this.openAddPlaceModal(this.itinerary.find(p => p.id === parseInt(e.target.closest('.itinerary-item').dataset.id)))));
        if (this.lastAddedItemId) { const newItemEl = container.querySelector(`[data-id="${this.lastAddedItemId}"]`); if (newItemEl) { newItemEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); newItemEl.classList.add('new-item-animation'); newItemEl.addEventListener('animationend', () => newItemEl.classList.remove('new-item-animation'), { once: true }); } this.lastAddedItemId = null; }
    }

    createItineraryItemHTML(place) {
        const categoryIcons = { 'temple': 'fas fa-place-of-worship', 'Shopping mall': 'fas fa-shopping-bag', 'Cafe': 'fas fa-coffee', 'Maket': 'fas fa-store', 'restaurant': 'fas fa-utensils', 'viewpoint': 'fas fa-mountain', 'museum': 'fas fa-university', 'Others': 'fas fa-map-marker-alt' };
        const categoryNames = { 'temple': 'วัด-พระราชวัง', 'Shopping mall': 'ห้างสรรพสินค้า', 'Cafe': 'คาเฟ่', 'Maket': 'ตลาด', 'restaurant': 'ร้านอาหาร', 'viewpoint': 'จุดชมวิว', 'museum': 'พิพิธภัณฑ์', 'Others': 'อื่นๆ' };
        const provinceNames = { bangkok: 'กรุงเทพฯ', 'Chiang Mai': 'เชียงใหม่', Loei: 'เลย', Krabi: 'กระบี่' };
        const pastClass = new Date(`${place.date}T${place.endTime}`) < new Date() ? 'past-event-item' : '';

        return `<div class="itinerary-item ${pastClass}" data-id="${place.id}" draggable="true">
            <div class="province-badge"><i class="fas fa-map-pin"></i> ${provinceNames[place.province] || place.province}</div>
            <div class="itinerary-header"><div class="itinerary-info"><h3>${place.name}</h3><div class="itinerary-time"><i class="fas fa-clock"></i> ${place.startTime} - ${place.endTime}</div></div></div>
            <div class="itinerary-details"><div class="detail-item"><i class="${categoryIcons[place.category] || 'fas fa-map-marker-alt'}"></i> <span>${categoryNames[place.category] || 'กิจกรรม'}</span></div><div class="detail-item"><i class="fas fa-hourglass-half"></i> <span>${this.formatDurationForDisplay(place.duration)}</span></div><div class="detail-item"><i class="fas fa-money-bill-wave"></i> <span>${(place.fee || 0).toLocaleString()} บาท</span></div></div>
            ${place.description ? `<p class="itinerary-description">${place.description}</p>` : ''}
            <div class="itinerary-actions"><button class="action-btn edit-btn" title="แก้ไข"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" title="ลบ"><i class="fas fa-trash"></i></button></div>
        </div>`;
    }

    bindDragAndDropEvents() {
        const container = document.getElementById('itinerary-list');
        container.addEventListener('dragstart', e => { if (e.target.classList.contains('itinerary-item')) { this.draggedItemId = parseInt(e.target.dataset.id); setTimeout(() => e.target.classList.add('dragging'), 0); } });
        container.addEventListener('dragend', e => { if (e.target.classList.contains('itinerary-item')) { e.target.classList.remove('dragging'); this.draggedItemId = null; } });
        container.addEventListener('dragover', e => { e.preventDefault(); const section = e.target.closest('.date-section'); if (!section) return; const afterElement = this.getDragAfterElement(section, e.clientY); const draggable = document.querySelector('.dragging'); if (draggable) { if (afterElement == null) { section.appendChild(draggable); } else { section.insertBefore(draggable, afterElement); } } });
        container.addEventListener('drop', e => {
            e.preventDefault();
            if (this.draggedItemId === null) return;
            const newItinerary = [];
            const allSections = container.querySelectorAll('.date-section');
            allSections.forEach(section => { const date = section.dataset.date; const itemsInSection = section.querySelectorAll('.itinerary-item'); itemsInSection.forEach(itemElement => { const itemId = parseInt(itemElement.dataset.id); const itemData = this.itinerary.find(p => p.id === itemId) || newItinerary.find(p => p.id === itemId); if (itemData) { itemData.date = date; newItinerary.push(itemData); } }); });
            this.itinerary = newItinerary;
            this.updateAndSave();
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.itinerary-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => { const box = child.getBoundingClientRect(); const offset = y - box.top - box.height / 2; if (offset < 0 && offset > closest.offset) { return { offset: offset, element: child }; } else { return closest; } }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    bindBudgetInputEvents() {
        const settingsPanel = document.querySelector('.budget-settings-panel');
        if (!settingsPanel) return;
        settingsPanel.addEventListener('input', e => { const targetId = e.target.id; const value = parseInt(e.target.value) || 0; switch (targetId) { case 'food-cost': this.budgetSettings.foodPerDay = value; break; case 'transport-cost': this.budgetSettings.transportPerPlace = value; break; case 'accommodation-cost': this.budgetSettings.accommodationPerNight = value; break; case 'other-cost': this.budgetSettings.otherPerDay = value; break; } this.updateBudgetDisplay(); this.saveState(); });
    }

    updateBudgetDisplay() {
        const dailyContainer = document.getElementById('daily-budget-container');
        if (!dailyContainer) return;
        const groupedByDate = this.itinerary.reduce((acc, place) => { const date = place.date; if (!acc[date]) acc[date] = []; acc[date].push(place); return acc; }, {});
        const uniqueDates = Object.keys(groupedByDate);
        const numberOfDays = uniqueDates.length;
        const numberOfNights = Math.max(0, numberOfDays - 1);
        let totalFood = numberOfDays * this.budgetSettings.foodPerDay;
        let totalAccommodation = numberOfNights * this.budgetSettings.accommodationPerNight;
        let totalOther = numberOfDays * this.budgetSettings.otherPerDay;
        let totalTransport = 0;
        let totalEntrance = 0;
        dailyContainer.innerHTML = '';
        if (numberOfDays === 0) { dailyContainer.innerHTML = `<div class="empty-state"><i class="fas fa-wallet"></i><h3>ยังไม่มีแผนการเดินทาง</h3><p>เพิ่มสถานที่เพื่อเริ่มคำนวณงบประมาณ</p></div>`; } 
        else { uniqueDates.sort((a, b) => new Date(a) - new Date(b)).forEach(date => { const placesToday = groupedByDate[date]; const dailyTransport = placesToday.length * this.budgetSettings.transportPerPlace; const dailyEntranceFees = placesToday.reduce((sum, place) => sum + (place.fee || 0), 0); totalTransport += dailyTransport; totalEntrance += dailyEntranceFees; const dailyFood = this.budgetSettings.foodPerDay; const dailyOther = this.budgetSettings.otherPerDay; const d = new Date(date); const formattedDate = d.toLocaleDateString('th-TH', { weekday: 'long', month: 'long', day: 'numeric' }); const dailyCard = document.createElement('div'); dailyCard.className = 'daily-budget-card'; dailyCard.innerHTML = `<div class="daily-budget-header"><h4><i class="fas fa-calendar-day"></i> ${formattedDate}</h4></div><div class="daily-budget-breakdown"><div class="budget-item"><span><i class="fas fa-subway"></i> เดินทาง</span> <span class="amount">${dailyTransport.toLocaleString()} บาท</span></div><div class="budget-item"><span><i class="fas fa-ticket-alt"></i> ค่าเข้าชม</span> <span class="amount">${dailyEntranceFees.toLocaleString()} บาท</span></div><div class="budget-item"><span><i class="fas fa-utensils"></i> อาหาร</span> <span class="amount">${dailyFood.toLocaleString()} บาท</span></div><div class="budget-item"><span><i class="fas fa-shopping-bag"></i> อื่นๆ</span> <span class="amount">${dailyOther.toLocaleString()} บาท</span></div></div>`; dailyContainer.appendChild(dailyCard); }); }
        const grandTotal = totalTransport + totalEntrance + totalFood + totalAccommodation + totalOther;
        document.getElementById('grand-total-budget').textContent = `${grandTotal.toLocaleString()} บาท`;
        this.updateBudgetChart(totalTransport, totalFood, totalEntrance, totalAccommodation, totalOther);
    }
    
    updateBudgetChart(transport, food, entrance, accommodation, other) {
        if (!this.budgetChart) this.initBudgetChart();
        if (this.budgetChart) { this.budgetChart.data.datasets[0].data = [transport, food, entrance, accommodation, other]; this.budgetChart.update(); }
    }

    initBudgetChart() {
        const ctx = document.getElementById('budgetChart');
        if (!ctx) return;
        if (this.budgetChart) this.budgetChart.destroy();
        const textColor = document.documentElement.hasAttribute('data-theme') ? '#f9fafb' : '#333';
        this.budgetChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['เดินทาง', 'อาหาร', 'ค่าเข้าชม', 'ที่พัก', 'อื่นๆ'], datasets: [{ data: [0, 0, 0, 0, 0], backgroundColor: ['#667eea', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'], borderColor: getComputedStyle(document.body).getPropertyValue('--card-bg').trim(), borderWidth: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 15 } } }, cutout: '60%' } });
    }

    openModal(modalId) { document.getElementById(modalId).classList.add('active'); }
    closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }
    showConfirmation(title, text, onConfirm) { document.getElementById('confirm-modal-title').textContent = title; document.getElementById('confirm-modal-text').textContent = text; this.confirmAction = onConfirm; this.openModal('confirm-modal'); }
    executeConfirm() { if (typeof this.confirmAction === 'function') { this.confirmAction(); } this.closeModal('confirm-modal'); this.confirmAction = null; }
    showToast(message, type = 'info') { const toastContainer = document.getElementById('toast-container'); const toast = document.createElement('div'); toast.className = `toast ${type}`; const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' }; toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`; toastContainer.appendChild(toast); setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 3000); }
    addPlaceFromApi(placeData) { this.openAddPlaceModal(placeData, true); }
    openAddPlaceModal(placeToEdit = null, fromApi = false) { if (placeToEdit) { if (placeToEdit.id) { document.querySelector('.modal-header h3').textContent = 'แก้ไขสถานที่'; document.getElementById('confirm-add').textContent = 'บันทึกการเปลี่ยนแปลง'; document.getElementById('confirm-add').dataset.editingId = placeToEdit.id; } else { document.querySelector('.modal-header h3').textContent = 'เพิ่มสถานที่ใหม่'; document.getElementById('confirm-add').textContent = 'เพิ่มสถานที่'; delete document.getElementById('confirm-add').dataset.editingId; } document.getElementById('place-name').value = placeToEdit.name || ''; document.getElementById('place-province').value = placeToEdit.province || 'bangkok'; document.getElementById('place-category').value = placeToEdit.category || 'Others'; document.getElementById('place-fee').value = placeToEdit.fee || 0; document.getElementById('place-description').value = placeToEdit.description || ''; document.getElementById('place-date').value = placeToEdit.date || new Date().toISOString().split('T')[0]; const nextTime = this.getNextAvailableTime(document.getElementById('place-date').value); document.getElementById('place-start-time').value = placeToEdit.startTime || this.formatTime(nextTime.start); document.getElementById('place-end-time').value = placeToEdit.endTime || this.formatTime(nextTime.end); } else { this.clearModalForm(); } this.openModal('add-place-modal'); }
    clearModalForm() { document.querySelector('.modal-header h3').textContent = 'เพิ่มสถานที่ใหม่'; const confirmBtn = document.getElementById('confirm-add'); confirmBtn.textContent = 'เพิ่มสถานที่'; delete confirmBtn.dataset.editingId; const form = document.getElementById('add-place-modal'); form.querySelector('#place-name').value = ''; form.querySelector('#place-province').value = 'bangkok'; form.querySelector('#place-date').value = new Date().toISOString().split('T')[0]; form.querySelector('#place-category').value = 'Others'; const nextTime = this.getNextAvailableTime(form.querySelector('#place-date').value); form.querySelector('#place-start-time').value = this.formatTime(nextTime.start); form.querySelector('#place-end-time').value = this.formatTime(nextTime.end); form.querySelector('#place-fee').value = ''; form.querySelector('#place-description').value = ''; }
    bindChecklistEvents() { const addItemBtn = document.getElementById('add-checklist-item-btn'); const addItemInput = document.getElementById('checklist-item-input'); const addCategoryBtn = document.getElementById('add-category-btn'); const newCategoryInput = document.getElementById('new-category-input'); const checklistContainer = document.getElementById('checklist-container'); addItemBtn.addEventListener('click', () => { const text = addItemInput.value.trim(); const categoryId = parseInt(document.getElementById('checklist-category-select').value); if (text && categoryId) { this.addChecklistItem(text, categoryId); addItemInput.value = ''; addItemInput.focus(); } else { this.showToast('กรุณาใส่ชื่อสิ่งของและเลือกหมวดหมู่', 'error'); } }); addItemInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addItemBtn.click(); }); addCategoryBtn.addEventListener('click', () => { const name = newCategoryInput.value.trim(); if (name) { this.addChecklistCategory(name); newCategoryInput.value = ''; } }); newCategoryInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addCategoryBtn.click(); }); checklistContainer.addEventListener('click', (e) => { const itemElement = e.target.closest('.checklist-item'); const categoryElement = e.target.closest('.checklist-category'); if (e.target.closest('.delete-category-btn')) { const categoryId = parseInt(categoryElement.dataset.id); this.deleteChecklistCategory(categoryId); } else if (itemElement && categoryElement) { const itemId = parseInt(itemElement.dataset.id); const categoryId = parseInt(categoryElement.dataset.id); if (e.target.type === 'checkbox') { this.toggleChecklistItem(categoryId, itemId); } if (e.target.closest('.delete-item-btn')) { this.deleteChecklistItem(categoryId, itemId); } } }); document.getElementById('clear-checklist-btn').addEventListener('click', () => { this.showConfirmation('ยืนยันการล้างรายการ', 'คุณต้องการล้างรายการและหมวดหมู่ทั้งหมดใช่หรือไม่?', () => { this.checklist = []; this.updateAndSave(); }); }); }
    renderChecklist() { const container = document.getElementById('checklist-container'); const categorySelect = document.getElementById('checklist-category-select'); if (!container || !categorySelect) return; container.innerHTML = ''; categorySelect.innerHTML = ''; if (this.checklist.length === 0) { container.innerHTML = '<p class="empty-checklist">ยังไม่มีหมวดหมู่ เริ่มต้นโดยการเพิ่มหมวดหมู่ใหม่</p>'; } this.checklist.forEach(category => { const option = document.createElement('option'); option.value = category.id; option.textContent = category.name; categorySelect.appendChild(option); const categoryElement = document.createElement('details'); categoryElement.className = 'checklist-category'; categoryElement.dataset.id = category.id; categoryElement.open = true; const summary = document.createElement('summary'); summary.innerHTML = `<h3>${category.name}</h3><button class="action-btn delete-category-btn" title="ลบหมวดหมู่นี้"><i class="fas fa-trash"></i></button>`; categoryElement.appendChild(summary); const itemList = document.createElement('ul'); itemList.className = 'checklist'; if (category.items.length === 0) { itemList.innerHTML = '<li class="empty-item-list">ไม่มีของในหมวดหมู่นี้</li>'; } else { category.items.forEach(item => { itemList.appendChild(this.createChecklistItemElement(item)); }); } categoryElement.appendChild(itemList); container.appendChild(categoryElement); }); this.updateChecklistProgress(); }
    createChecklistItemElement(item) { const li = document.createElement('li'); li.className = `checklist-item ${item.checked ? 'checked' : ''}`; li.dataset.id = item.id; li.innerHTML = `<input type="checkbox" id="item-${item.id}" ${item.checked ? 'checked' : ''}><label for="item-${item.id}">${item.text}</label><button class="action-btn delete-item-btn" title="ลบรายการนี้"><i class="fas fa-times"></i></button>`; return li; }
    addChecklistCategory(name) { if (this.checklist.some(cat => cat.name.toLowerCase() === name.toLowerCase())) { this.showToast('มีหมวดหมู่นี้อยู่แล้ว', 'error'); return; } this.checklist.push({ id: Date.now(), name, items: [] }); this.updateAndSave(); }
    deleteChecklistCategory(categoryId) { this.showConfirmation('ยืนยันการลบ', 'การลบหมวดหมู่นี้จะลบของทั้งหมดที่อยู่ข้างในด้วย คุณแน่ใจหรือไม่?', () => { this.checklist = this.checklist.filter(cat => cat.id !== categoryId); this.updateAndSave(); }); }
    addChecklistItem(text, categoryId) { const category = this.checklist.find(cat => cat.id === categoryId); if (category) { category.items.push({ id: Date.now(), text, checked: false }); this.updateAndSave(); } }
    toggleChecklistItem(categoryId, itemId) { const category = this.checklist.find(cat => cat.id === categoryId); if (category) { const item = category.items.find(i => i.id === itemId); if (item) { item.checked = !item.checked; const itemElement = document.querySelector(`.checklist-item[data-id="${itemId}"]`); if (itemElement) { itemElement.classList.toggle('checked', item.checked); } this.saveState(); this.updateChecklistProgress(); } } }
    deleteChecklistItem(categoryId, itemId) { const category = this.checklist.find(cat => cat.id === categoryId); if (category) { const itemElement = document.querySelector(`.checklist-item[data-id="${itemId}"]`); category.items = category.items.filter(i => i.id !== itemId); if (itemElement) { itemElement.classList.add('removing'); itemElement.addEventListener('animationend', () => { if (category.items.length === 0) { this.renderChecklist(); } else { itemElement.remove(); } }, { once: true }); } this.saveState(); this.updateChecklistProgress(); } }
    updateChecklistProgress() { const progressBar = document.getElementById('checklist-progress-bar'); const progressText = document.getElementById('checklist-progress-text'); if (!progressBar || !progressText) return; let totalItems = 0; let checkedItems = 0; this.checklist.forEach(category => { totalItems += category.items.length; checkedItems += category.items.filter(item => item.checked).length; }); const percentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0; progressBar.style.width = `${percentage}%`; progressText.textContent = `${checkedItems}/${totalItems} รายการ`; }
    sortItinerary() { this.itinerary.sort((a, b) => { const dateA = new Date(a.date); const dateB = new Date(b.date); if (dateA - dateB !== 0) return dateA - dateB; return this.parseTime(a.startTime) - this.parseTime(b.startTime); }); }
    getPlaceData(placeName) { const places = { 'วัดพระแก้ว': { category: 'temple', province: 'bangkok', fee: 500, description: 'วัดพระแก้วมรกต' }, 'พระบรมมหาราชวัง': { category: 'temple', province: 'bangkok', fee: 500, description: 'พระราชวังหลวงที่งดงาม' }, 'วัดอรุณราชวราราม': { category: 'temple', province: 'bangkok', fee: 100, description: 'วัดอรุณ จุดชมวิวริมแม่น้ำ' }, 'สยามสแควร์': { category: 'Shopping mall', province: 'bangkok', fee: 0, description: 'ศูนย์การค้าใจกลางกรุงเทพ' }, 'ตลาดจตุจักร': { category: 'Maket', province: 'bangkok', fee: 0, description: 'ตลาดสุดสัปดาห์ที่ใหญ่ที่สุด' }, 'ไอคอนสยาม': { category: 'Shopping mall', province: 'bangkok', fee: 0, description: 'ศูนย์การค้าริมแม่น้ำเจ้าพระยา' } }; return { name: placeName, ...(places[placeName] || { category: 'Others', province: 'bangkok', fee: 0, description: '' }) }; }
    getNextAvailableTime(dateString) { const placesOnDate = this.itinerary.filter(p => p.date === dateString); let lastEndTime = null; if (placesOnDate.length > 0) { placesOnDate.forEach(p => { const placeEndTime = this.parseTime(p.endTime); if (!lastEndTime || placeEndTime > lastEndTime) { lastEndTime = placeEndTime; } }); } let newStartTime; if (lastEndTime) { newStartTime = new Date(lastEndTime.getTime() + 30 * 60 * 1000); } else { const timeValue = document.getElementById('start-time').value || '09:00'; const [hours, minutes] = timeValue.split(':'); newStartTime = new Date(); newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0); } const newEndTime = new Date(newStartTime.getTime() + 2 * 60 * 60 * 1000); return { start: newStartTime, end: newEndTime }; }
    parseTime(timeString) { const [hours, minutes] = timeString.split(':'); const date = new Date(); date.setHours(parseInt(hours), parseInt(minutes), 0, 0); return date; }
    formatTime(date) { return date.toTimeString().slice(0, 5); }
    calculateDuration(startTime, endTime) { const start = this.parseTime(startTime); const end = this.parseTime(endTime); let durationInHours = (end - start) / (1000 * 60 * 60); if (durationInHours < 0) durationInHours += 24; return durationInHours; }
    formatDurationForDisplay(hours) { if (isNaN(hours) || hours < 0) return 'N/A'; const h = Math.floor(hours); const m = Math.round((hours - h) * 60); const hourText = h > 0 ? `${h} ชั่วโมง` : ''; const minuteText = m > 0 ? `${m} นาที` : ''; return [hourText, minuteText].filter(Boolean).join(' ') || '0 นาที'; }
}

document.addEventListener('DOMContentLoaded', () => {
    window.travelApp = new TravelPlannerApp();
});
