// Main App Controller
class TravelPlannerApp {
    constructor() {
        this.currentTab = 'planner';
        this.itinerary = [];
        this.checklist = [];
        this.lastAddedItemId = null; 
        
        this.budgetChart = null; // To hold the chart instance
        this.budgetSettings = { // Default adjustable values
            foodPerDay: 800,
            transportPerPlace: 165
        };

        this.init();
    }

    init() {
        this.loadItinerary();
        this.loadChecklist();
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });

        // Modal events
        document.getElementById('add-place-btn').addEventListener('click', () => this.openAddPlaceModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-add').addEventListener('click', () => this.closeModal());
        document.getElementById('confirm-add').addEventListener('click', () => this.handleConfirmAdd());

        // Quick add buttons
        document.querySelectorAll('.quick-place-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.quickAddPlace(e.currentTarget.dataset.place));
        });
        
        // Close modal on outside click
        document.getElementById('add-place-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-place-modal') this.closeModal();
        });
        
        this.bindChecklistEvents();
        this.bindBudgetSliderEvents(); // Bind new slider events
    }
    
    // --- Budget Functions (HEAVILY REVISED) ---

    bindBudgetSliderEvents() {
        const foodSlider = document.getElementById('food-slider');
        const transportSlider = document.getElementById('transport-slider');
        const foodValueEl = document.getElementById('food-slider-value');
        const transportValueEl = document.getElementById('transport-slider-value');

        if (foodSlider && foodValueEl) {
            foodSlider.addEventListener('input', (e) => {
                this.budgetSettings.foodPerDay = parseInt(e.target.value);
                foodValueEl.textContent = e.target.value;
                this.updateBudgetDisplay();
            });
        }

        if (transportSlider && transportValueEl) {
            transportSlider.addEventListener('input', (e) => {
                this.budgetSettings.transportPerPlace = parseInt(e.target.value);
                transportValueEl.textContent = e.target.value;
                this.updateBudgetDisplay();
            });
        }
    }
    
    updateBudgetDisplay() {
        const dailyContainer = document.getElementById('daily-budget-container');
        if (!dailyContainer) return;

        const groupedByDate = this.itinerary.reduce((acc, place) => {
            const date = place.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(place);
            return acc;
        }, {});
        
        let grandTotal = 0;
        let totalTransport = 0;
        let totalFood = 0;
        let totalEntrance = 0;

        dailyContainer.innerHTML = '';

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

        if (sortedDates.length === 0) {
            dailyContainer.innerHTML = `<div class="empty-state">
                <i class="fas fa-wallet"></i>
                <h3>ยังไม่มีแผนการเดินทาง</h3>
                <p>เพิ่มสถานที่ในแท็บ 'วางแผนการเที่ยว' เพื่อเริ่มคำนวณงบประมาณ</p>
            </div>`;
        } else {
            sortedDates.forEach(date => {
                const placesToday = groupedByDate[date];
                const numPlacesToday = placesToday.length;

                const dailyTransport = numPlacesToday * this.budgetSettings.transportPerPlace;
                const dailyFood = this.budgetSettings.foodPerDay; 
                const dailyEntranceFees = placesToday.reduce((sum, place) => sum + (place.fee || 0), 0);
                
                const dailyTotal = dailyTransport + dailyFood + dailyEntranceFees;
                
                totalTransport += dailyTransport;
                totalFood += dailyFood;
                totalEntrance += dailyEntranceFees;

                grandTotal += dailyTotal;
                
                const d = new Date(date);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = d.toLocaleDateString('th-TH', options);

                const dailyCard = document.createElement('div');
                dailyCard.className = 'daily-budget-card';
                dailyCard.innerHTML = `
                    <div class="daily-budget-header">
                        <h4><i class="fas fa-calendar-day"></i> ${formattedDate}</h4>
                        <span class="daily-budget-total">${dailyTotal.toLocaleString()} บาท</span>
                    </div>
                    <div class="daily-budget-breakdown">
                        <div class="budget-item"><span><i class="fas fa-subway"></i> ค่าเดินทาง</span> <span class="amount">${dailyTransport.toLocaleString()} บาท</span></div>
                        <div class="budget-item"><span><i class="fas fa-utensils"></i> ค่าอาหาร</span> <span class="amount">${dailyFood.toLocaleString()} บาท</span></div>
                        <div class="budget-item"><span><i class="fas fa-ticket-alt"></i> ค่าเข้าชม</span> <span class="amount">${dailyEntranceFees.toLocaleString()} บาท</span></div>
                    </div>
                `;
                dailyContainer.appendChild(dailyCard);
            });
        }

        const grandTotalEl = document.getElementById('grand-total-budget');
        if (grandTotalEl) {
            grandTotalEl.textContent = `${grandTotal.toLocaleString()} บาท`;
        }

        this.updateBudgetChart(totalTransport, totalFood, totalEntrance);
    }

    updateBudgetChart(transport, food, entrance) {
        if (!this.budgetChart) {
            this.initBudgetChart();
        }
        if (this.budgetChart) {
             this.budgetChart.data.datasets[0].data = [transport, food, entrance];
             this.budgetChart.update();
        }
    }

    initBudgetChart() {
        const ctx = document.getElementById('budgetChart');
        if (!ctx) return;
        
        if (this.budgetChart) {
            this.budgetChart.destroy();
        }
        
        const isDarkMode = document.documentElement.hasAttribute('data-theme');
        const textColor = isDarkMode ? '#f9fafb' : '#333';
        
        this.budgetChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['เดินทาง', 'อาหาร', 'ค่าเข้าชม'],
                datasets: [{
                    label: 'งบประมาณ',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(59, 130, 246, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // --- Other functions ---
    
    bindChecklistEvents() {
        const addItemInput = document.getElementById('checklist-item-input');
        const addItemBtn = document.getElementById('add-checklist-item-btn');
        const checklistUl = document.getElementById('checklist');
        const clearBtn = document.getElementById('clear-checklist-btn');

        if(addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                if (addItemInput.value.trim() !== '') {
                    this.addChecklistItem(addItemInput.value.trim());
                    addItemInput.value = '';
                    addItemInput.focus();
                }
            });
        }

        if(addItemInput) {
             addItemInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && addItemInput.value.trim() !== '') {
                    this.addChecklistItem(addItemInput.value.trim());
                    addItemInput.value = '';
                }
            });
        }
       
        if(checklistUl) {
            checklistUl.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') {
                    const id = parseFloat(e.target.dataset.id);
                    this.toggleChecklistItem(id);
                }
                if (e.target.closest('.delete-item-btn')) {
                    const id = parseFloat(e.target.closest('.checklist-item').dataset.id);
                    this.deleteChecklistItem(id);
                }
            });
        }

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadChecklistTemplate(e.currentTarget.dataset.template));
        });

        if(clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('คุณต้องการล้างรายการทั้งหมดใช่หรือไม่?')) {
                    this.checklist = [];
                    this.saveChecklist();
                    this.renderChecklist();
                }
            });
        }
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        this.currentTab = tabName;
        if (tabName === 'budget') this.updateBudgetDisplay();
        if (tabName === 'packing') this.renderChecklist();
    }
    updateAndSave() { this.sortItinerary(); this.saveItinerary(); this.updateUI(); }
    updateUI() { this.updateItineraryDisplay(); this.updateBudgetDisplay(); }
    addPlace(place) { this.itinerary.push(place); this.lastAddedItemId = place.id; }
    deletePlace(id) { if (confirm('คุณต้องการลบสถานที่นี้ใช่หรือไม่?')) { this.itinerary = this.itinerary.filter(place => place.id !== id); this.updateAndSave(); }}
    editPlace(id) { const place = this.itinerary.find(p => p.id === id); if (place) { this.openAddPlaceModal(place); }}
    handleConfirmAdd() {
        const editingId = document.getElementById('confirm-add').dataset.editingId;
        const placeData = { name: document.getElementById('place-name').value.trim(), province: document.getElementById('place-province').value, date: document.getElementById('place-date').value, category: document.getElementById('place-category').value, startTime: document.getElementById('place-start-time').value, endTime: document.getElementById('place-end-time').value, fee: parseInt(document.getElementById('place-fee').value) || 0, description: document.getElementById('place-description').value.trim() };
        if (!placeData.name || !placeData.province || !placeData.date || !placeData.startTime || !placeData.endTime) { alert('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
        placeData.duration = this.calculateDuration(placeData.startTime, placeData.endTime);
        if (editingId) {
            const index = this.itinerary.findIndex(p => p.id === parseInt(editingId));
            if (index !== -1) { this.itinerary[index] = { ...this.itinerary[index], ...placeData }; }
        } else {
            this.addPlace({ ...placeData, id: Date.now() });
        }
        this.updateAndSave();
        this.closeModal();
    }
    quickAddPlace(placeName) {
        const placeData = this.getPlaceData(placeName);
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];
        let latestEndTimeForToday = null;
        this.itinerary.filter(p => p.date === todayDateString).forEach(p => { const placeEndDateTime = this.parseTime(p.endTime); if (latestEndTimeForToday === null || placeEndDateTime > latestEndTimeForToday) { latestEndTimeForToday = placeEndDateTime; } });
        let newStartTime;
        if (latestEndTimeForToday) {
            newStartTime = new Date(latestEndTimeForToday.getTime() + 30 * 60 * 1000);
        } else {
            const timeValue = document.getElementById('start-time').value || '09:00';
            const [hours, minutes] = timeValue.split(':');
            newStartTime = new Date();
            newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        const newEndTime = this.addHours(newStartTime, placeData.duration);
        const place = { id: Date.now(), name: placeName, province: placeData.province || 'bangkok', date: todayDateString, category: placeData.category, startTime: this.formatTime(newStartTime), endTime: this.formatTime(newEndTime), fee: placeData.fee, description: placeData.description, duration: placeData.duration };
        this.addPlace(place);
        this.updateAndSave();
    }
    updateItineraryDisplay() {
        const container = document.getElementById('itinerary-list');
        const emptyState = document.getElementById('empty-state');
        if (!container) return;
        if (this.itinerary.length === 0) { container.innerHTML = ''; if(emptyState) emptyState.style.display = 'block'; return; }
        if(emptyState) emptyState.style.display = 'none';
        const now = new Date();
        const upcomingEvents = this.itinerary.filter(place => { const eventEndDateTime = new Date(place.date); const [endHours, endMinutes] = place.endTime.split(':'); eventEndDateTime.setHours(endHours, endMinutes, 59, 999); return eventEndDateTime >= now; });
        const pastEvents = this.itinerary.filter(place => { const eventEndDateTime = new Date(place.date); const [endHours, endMinutes] = place.endTime.split(':'); eventEndDateTime.setHours(endHours, endMinutes, 59, 999); return eventEndDateTime < now; });
        const groupAndRender = (events, isPast = false) => {
            events.sort((a, b) => { const dateA = new Date(a.date); const dateB = new Date(b.date); if (dateA - dateB !== 0) return dateA - dateB; return this.parseTime(a.startTime) - this.parseTime(b.startTime); });
            const groupedByDate = events.reduce((acc, place) => { const date = place.date; if (!acc[date]) acc[date] = []; acc[date].push(place); return acc; }, {});
            let sectionHtml = '';
            for (const date in groupedByDate) { const d = new Date(date); const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; const formattedDate = d.toLocaleDateString('th-TH', options); sectionHtml += `<div class="date-section ${isPast ? 'past-date-section' : ''}"><div class="date-divider"><span class="date-text"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span></div>`; sectionHtml += groupedByDate[date].map(place => this.createItineraryItemHTML(place, isPast)).join(''); sectionHtml += `</div>`; }
            return sectionHtml;
        };
        let html = '';
        if (upcomingEvents.length > 0) { html += '<h2 class="itinerary-section-header">🗓️ แผนการเดินทางที่กำลังจะมาถึง</h2>'; html += groupAndRender(upcomingEvents, false); } else { html += '<h2 class="itinerary-section-header">🗓️ ไม่มีแผนการเดินทางที่กำลังจะมาถึง</h2>';}
        if (pastEvents.length > 0) { pastEvents.sort((a, b) => { const dateA = new Date(a.date); const dateB = new Date(b.date); if (dateB - dateA !== 0) return dateB - dateA; return this.parseTime(b.startTime) - this.parseTime(a.startTime); }); html += '<h2 class="itinerary-section-header past-header">📍 แผนการเดินทางที่ผ่านมาแล้ว</h2>'; html += groupAndRender(pastEvents, true); }
        container.innerHTML = html;
        container.querySelectorAll('.delete-btn').forEach(btn => { btn.addEventListener('click', (e) => this.deletePlace(parseInt(e.target.closest('.itinerary-item').dataset.id))); });
        container.querySelectorAll('.edit-btn').forEach(btn => { btn.addEventListener('click', (e) => this.editPlace(parseInt(e.target.closest('.itinerary-item').dataset.id))); });
        if (this.lastAddedItemId) { const newItemEl = container.querySelector(`[data-id="${this.lastAddedItemId}"]`); if (newItemEl) { newItemEl.classList.add('new-item-animation'); newItemEl.addEventListener('animationend', () => { newItemEl.classList.remove('new-item-animation'); }, { once: true }); } this.lastAddedItemId = null; }
    }
    createItineraryItemHTML(place, isPast = false) {
        const categoryIcons = { 'temple': 'fas fa-place-of-worship', 'Shopping mall': 'fas fa-shopping-bag', 'Cafe': 'fas fa-coffee', 'Maket': 'fas fa-store', 'restaurant': 'fas fa-utensils', 'viewpoint': 'fas fa-mountain', 'museum': 'fas fa-university', 'Others': 'fas fa-map-marker-alt' };
        const categoryNames = { 'temple': 'วัด-พระราชวัง', 'Shopping mall': 'ห้างสรรพสินค้า', 'Cafe': 'คาเฟ่', 'Maket': 'ตลาด', 'restaurant': 'ร้านอาหาร', 'viewpoint': 'จุดชมวิว', 'museum': 'พิพิธภัณฑ์', 'Others': 'อื่นๆ' };
        const provinceNames = { bangkok: 'กรุงเทพมหานคร', 'Chiang Mai': 'เชียงใหม่', Loei: 'เลย', Krabi: 'กระบี่' };
        const pastClass = isPast ? 'past-event-item' : '';
        return `<div class="itinerary-item ${pastClass}" data-id="${place.id}"><div class="province-badge"><i class="fas fa-map-pin"></i> ${provinceNames[place.province] || place.province}</div><div class="itinerary-header"><div class="itinerary-info"><h3>${place.name}</h3><div class="itinerary-time"><i class="fas fa-clock"></i> ${place.startTime} - ${place.endTime}</div></div><div class="itinerary-actions"><button class="action-btn edit-btn"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn"><i class="fas fa-trash"></i></button></div></div><div class="itinerary-details"><div class="detail-item"><i class="${categoryIcons[place.category] || 'fas fa-map-marker-alt'}"></i> <span>${categoryNames[place.category] || 'กิจกรรม'}</span></div><div class="detail-item"><i class="fas fa-hourglass-half"></i> <span>${this.formatDurationForDisplay(place.duration)}</span></div><div class="detail-item"><i class="fas fa-money-bill-wave"></i> <span>${place.fee} บาท</span></div></div>${place.description ? `<p class="itinerary-description" style="margin-top: 1rem; font-size: 0.9rem;">${place.description}</p>` : ''}</div>`;
    }
    updateChecklistProgress() {
        const progressBar = document.getElementById('checklist-progress-bar');
        const progressText = document.getElementById('checklist-progress-text');
        const packingContainer = document.querySelector('.packing-container');
        if (!progressBar || !progressText || !packingContainer) return;
        const totalItems = this.checklist.length;
        const checkedItems = this.checklist.filter(item => item.checked).length;
        const percentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${checkedItems}/${totalItems} รายการ`;
        const wasComplete = packingContainer.classList.contains('checklist-complete-state');
        if (percentage === 100 && totalItems > 0) {
            packingContainer.classList.add('checklist-complete-state');
            if (!wasComplete) { packingContainer.classList.add('checklist-celebrate'); packingContainer.addEventListener('animationend', () => { packingContainer.classList.remove('checklist-celebrate'); }, { once: true }); }
        } else {
            packingContainer.classList.remove('checklist-complete-state');
        }
    }
    renderChecklist() { const checklistUl = document.getElementById('checklist'); if (!checklistUl) return; checklistUl.innerHTML = ''; this.checklist.forEach(item => { const li = document.createElement('li'); li.className = `checklist-item ${item.checked ? 'checked' : ''}`; li.dataset.id = item.id; li.innerHTML = `<input type="checkbox" data-id="${item.id}" id="item-${item.id}" ${item.checked ? 'checked' : ''}><label for="item-${item.id}">${item.text}</label><button class="action-btn delete-item-btn" title="ลบรายการนี้"><i class="fas fa-times"></i></button>`; checklistUl.appendChild(li); }); this.updateChecklistProgress(); }
    addChecklistItem(text) { const newItem = { id: Date.now(), text: text, checked: false }; this.checklist.push(newItem); this.saveChecklist(); this.renderChecklist(); }
    toggleChecklistItem(id) { const item = this.checklist.find(item => item.id === id); if (item) { item.checked = !item.checked; this.saveChecklist(); this.renderChecklist(); } }
    deleteChecklistItem(id) { this.checklist = this.checklist.filter(item => item.id !== id); this.saveChecklist(); this.renderChecklist(); }
    loadChecklistTemplate(template) { const templates = { beach: [{ text: 'ชุดว่ายน้ำ', checked: false }, { text: 'ครีมกันแดด', checked: false }, { text: 'แว่นกันแดด', checked: false }], winter: [{ text: 'เสื้อโค้ท/เสื้อกันหนาว', checked: false }, { text: 'ผ้าพันคอ', checked: false }, { text: 'ถุงมือ', checked: false }], general: [{ text: 'เสื้อผ้า', checked: false }, { text: 'ของใช้ส่วนตัว', checked: false }, { text: 'ยาประจำตัว', checked: false }] }; if (confirm(`คุณต้องการล้างรายการปัจจุบันและใช้เทมเพลตนี้หรือไม่?`)) { this.checklist = templates[template].map((item, index) => ({...item, id: Date.now() + index })); this.saveChecklist(); this.renderChecklist(); } }
    sortItinerary() { this.itinerary.sort((a, b) => { const dateA = new Date(a.date); const dateB = new Date(b.date); if(dateA - dateB !== 0) return dateA - dateB; return this.parseTime(a.startTime) - this.parseTime(b.startTime); }); }
    saveItinerary() { localStorage.setItem('travelItinerary', JSON.stringify(this.itinerary)); }
    loadItinerary() { const savedItinerary = localStorage.getItem('travelItinerary'); if (savedItinerary) { this.itinerary = JSON.parse(savedItinerary); } }
    saveChecklist() { localStorage.setItem('travelChecklist', JSON.stringify(this.checklist)); }
    loadChecklist() { const storedChecklist = localStorage.getItem('travelChecklist'); if (storedChecklist) { this.checklist = JSON.parse(storedChecklist); } }
    getPlaceData(placeName) { return { 'วัดพระแก้ว': { category: 'temple', province: 'bangkok', fee: 500, duration: 2, description: 'วัดพระแก้วมรกต สถานที่ศักดิ์สิทธิ์ที่สำคัญของไทย' }, 'พระบรมมหาราชวัง': { category: 'temple', province: 'bangkok', fee: 500, duration: 3, description: 'พระราชวังหลวงที่งดงามและมีประวัติศาสตร์ยาวนาน' }, 'วัดอรุณราชวราราม': { category: 'temple', province: 'bangkok', fee: 100, duration: 1.5, description: 'วัดอรุณ จุดชมพระอาทิตย์ขึ้นที่สวยงาม' }, 'สยามสแควร์': { category: 'Shopping mall', province: 'bangkok', fee: 0, duration: 3, description: 'ศูนย์การค้าและความบันเทิงใจกลางกรุงเทพ' }, 'ตลาดจตุจักร': { category: 'Maket', province: 'bangkok', fee: 0, duration: 4, description: 'ตลาดสุดสัปดาห์ที่ใหญ่ที่สุดในโลก' }, 'ไอคอนสยาม': { category: 'Shopping mall', province: 'bangkok', fee: 0, duration: 3, description: 'ศูนย์การค้าริมแม่น้ำเจ้าพระยา' } }[placeName] || { category: 'Others', province: 'bangkok', fee: 0, duration: 2, description: 'สถานที่ท่องเที่ยวที่น่าสนใจ' }; }
    getNextAvailableTime() { if (this.itinerary.length === 0) { const startTime = document.getElementById('start-time').value || '09:00'; const today = new Date(); const [hours, minutes] = startTime.split(':'); today.setHours(parseInt(hours), parseInt(minutes), 0, 0); return today; } let latestEndTime = new Date(0); this.itinerary.forEach(place => { const placeDateTime = new Date(place.date); const [endHours, endMinutes] = place.endTime.split(':'); placeDateTime.setHours(endHours, endMinutes); if (placeDateTime > latestEndTime) { latestEndTime = placeDateTime; } }); return new Date(latestEndTime.getTime() + 30 * 60 * 1000); }
    parseTime(timeString) { const today = new Date(); const [hours, minutes] = timeString.split(':'); today.setHours(parseInt(hours), parseInt(minutes), 0, 0); return today; }
    formatTime(date) { return date.toTimeString().slice(0, 5); }
    addHours(date, hours) { return new Date(date.getTime() + hours * 60 * 60 * 1000); }
    calculateDuration(startTime, endTime) { const start = this.parseTime(startTime); const end = this.parseTime(endTime); let durationInHours = (end - start) / (1000 * 60 * 60); if (durationInHours < 0) { durationInHours += 24; } return durationInHours; }
    formatDurationForDisplay(hours) { if (isNaN(hours) || hours < 0) { return 'N/A'; } const totalMinutes = Math.floor(hours * 60); const h = Math.floor(totalMinutes / 60); const m = totalMinutes % 60; const hourText = h > 0 ? `${h} ชั่วโมง` : ''; const minuteText = m > 0 ? `${m} นาที` : ''; const result = [hourText, minuteText].filter(Boolean).join(' '); return result || '0 นาที'; }
    openAddPlaceModal(placeToEdit = null) { const modal = document.getElementById('add-place-modal'); const confirmBtn = document.getElementById('confirm-add'); if (placeToEdit) { confirmBtn.dataset.editingId = placeToEdit.id; document.querySelector('.modal-header h3').textContent = 'แก้ไขสถานที่'; confirmBtn.textContent = 'บันทึกการเปลี่ยนแปลง'; document.getElementById('place-name').value = placeToEdit.name; document.getElementById('place-province').value = placeToEdit.province; document.getElementById('place-date').value = placeToEdit.date; document.getElementById('place-category').value = placeToEdit.category; document.getElementById('place-start-time').value = placeToEdit.startTime; document.getElementById('place-end-time').value = placeToEdit.endTime; document.getElementById('place-fee').value = placeToEdit.fee; document.getElementById('place-description').value = placeToEdit.description; } else { this.clearModalForm(); } modal.classList.add('active'); }
    closeModal() { document.getElementById('add-place-modal').classList.remove('active'); this.clearModalForm(); }
    clearModalForm() { document.querySelector('.modal-header h3').textContent = 'เพิ่มสถานที่ใหม่'; const confirmBtn = document.getElementById('confirm-add'); confirmBtn.textContent = 'เพิ่มสถานที่'; delete confirmBtn.dataset.editingId; document.getElementById('place-name').value = ''; document.getElementById('place-province').value = ''; document.getElementById('place-date').value = new Date().toISOString().split('T')[0]; document.getElementById('place-category').value = 'temple'; document.getElementById('place-start-time').value = ''; document.getElementById('place-end-time').value = ''; document.getElementById('place-fee').value = ''; document.getElementById('place-description').value = ''; }
}

document.addEventListener('DOMContentLoaded', () => {
    window.travelApp = new TravelPlannerApp();
});
