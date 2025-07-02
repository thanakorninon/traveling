class InfoManager {
    constructor(app) {
        this.app = app; // Reference to the main app
        this.essentialInfo = {
            flights: [],
            accommodations: [],
            contacts: []
        };
        this.init();
    }

    init() {
        this.loadInfo();
        this.bindEvents();
        this.updateDisplay();
    }

    loadInfo() {
        try {
            const savedInfo = localStorage.getItem('travelEssentialInfo');
            if (savedInfo) {
                this.essentialInfo = JSON.parse(savedInfo);
            }
        } catch (e) {
            console.error("Could not parse essential info from localStorage", e);
            this.essentialInfo = { flights: [], accommodations: [], contacts: [] };
        }
    }

    saveInfo() {
        localStorage.setItem('travelEssentialInfo', JSON.stringify(this.essentialInfo));
    }

    bindEvents() {
        document.getElementById('add-flight-btn').addEventListener('click', () => this.addInfoItem('flight'));
        document.getElementById('add-hotel-btn').addEventListener('click', () => this.addInfoItem('accommodation'));
        document.getElementById('add-contact-btn').addEventListener('click', () => this.addInfoItem('contact'));
        
        // Use event delegation for delete buttons
        document.querySelector('.info-display').addEventListener('click', e => {
            const deleteBtn = e.target.closest('.delete-info-btn');
            if (deleteBtn) {
                const card = deleteBtn.closest('.info-card');
                const id = parseInt(card.dataset.id);
                const type = card.dataset.type;
                this.deleteInfoItem(type, id);
            }
        });
    }

    addInfoItem(type) {
        let newItem = { id: Date.now() };
        let isValid = false;

        if (type === 'flight') {
            newItem.number = document.getElementById('info-flight-number').value.trim();
            newItem.departure = document.getElementById('info-flight-departure').value;
            newItem.arrival = document.getElementById('info-flight-arrival').value;
            if (newItem.number && newItem.departure && newItem.arrival) isValid = true;
        } else if (type === 'accommodation') {
            newItem.name = document.getElementById('info-hotel-name').value.trim();
            newItem.bookingId = document.getElementById('info-hotel-booking-id').value.trim();
            newItem.phone = document.getElementById('info-hotel-phone').value.trim();
            if (newItem.name) isValid = true;
        } else if (type === 'contact') {
            newItem.name = document.getElementById('info-contact-name').value.trim();
            newItem.relation = document.getElementById('info-contact-relation').value.trim();
            newItem.phone = document.getElementById('info-contact-phone').value.trim();
            if (newItem.name && newItem.phone) isValid = true;
        }

        if (isValid) {
            this.essentialInfo[type + 's'].push(newItem);
            this.saveInfo();
            this.updateDisplay();
            this.app.showToast('เพิ่มข้อมูลสำเร็จ', 'success');
            // Clear the form fields
            const formCard = document.getElementById(`add-${type}-btn`).closest('.card');
            formCard.querySelectorAll('input').forEach(input => input.value = '');
        } else {
            this.app.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        }
    }

    deleteInfoItem(type, id) {
        this.app.showConfirmation('ยืนยันการลบ', 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?', () => {
            const collection = type + 's';
            this.essentialInfo[collection] = this.essentialInfo[collection].filter(item => item.id !== id);
            this.saveInfo();
            this.updateDisplay();
            this.app.showToast('ลบข้อมูลแล้ว', 'success');
        });
    }

    updateDisplay() {
        const flightList = document.getElementById('flight-info-list');
        const hotelList = document.getElementById('hotel-info-list');
        const contactList = document.getElementById('contact-info-list');
        const emptyState = document.getElementById('info-empty-state');

        flightList.innerHTML = '';
        hotelList.innerHTML = '';
        contactList.innerHTML = '';

        const flights = this.essentialInfo.flights || [];
        const accommodations = this.essentialInfo.accommodations || [];
        const contacts = this.essentialInfo.contacts || [];

        flights.forEach(item => flightList.innerHTML += this.createCardHTML(item, 'flight'));
        accommodations.forEach(item => hotelList.innerHTML += this.createCardHTML(item, 'accommodation'));
        contacts.forEach(item => contactList.innerHTML += this.createCardHTML(item, 'contact'));

        if (flights.length === 0 && accommodations.length === 0 && contacts.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        };
        return date.toLocaleDateString('th-TH', options);
    }

    createCardHTML(item, type) {
        let body = '';
        let header = '';
        let icon = '';

        switch (type) {
            case 'flight':
                icon = 'fa-plane-departure';
                header = `เที่ยวบิน: ${item.number}`;
                body = `
                    <div class="info-item"><strong>ออกเดินทาง:</strong> <span>${this.formatDateTime(item.departure)}</span></div>
                    <div class="info-item"><strong>ถึงที่หมาย:</strong> <span>${this.formatDateTime(item.arrival)}</span></div>
                `;
                break;
            case 'accommodation':
                icon = 'fa-hotel';
                header = item.name;
                body = `
                    <div class="info-item"><strong>Booking ID:</strong> <span>${item.bookingId || 'N/A'}</span></div>
                    <div class="info-item"><strong>โทรศัพท์:</strong> <span>${item.phone || 'N/A'}</span></div>
                `;
                break;
            case 'contact':
                icon = 'fa-address-book';
                header = item.name;
                body = `
                    <div class="info-item"><strong>ความสัมพันธ์:</strong> <span>${item.relation || 'N/A'}</span></div>
                    <div class="info-item"><strong>โทรศัพท์:</strong> <span>${item.phone}</span></div>
                `;
                break;
        }

        return `
            <div class="info-card" data-id="${item.id}" data-type="${type}">
                <div class="info-header">
                    <i class="fas ${icon}"></i>
                    <h4>${header}</h4>
                    <button class="action-btn delete-info-btn" title="ลบข้อมูล"><i class="fas fa-trash"></i></button>
                </div>
                <div class="info-body">
                    ${body}
                </div>
            </div>
        `;
    }
}
