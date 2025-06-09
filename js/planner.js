// Planner specific functionality
class PlannerManager {
    constructor(app) {
        this.app = app;
        this.draggedItem = null;
        this.init();
    }

    init() {
        this.enableDragAndDrop();
        this.bindPlannerEvents();
    }

    bindPlannerEvents() {
        // Trip info changes
        document.getElementById('trip-name').addEventListener('input', (e) => {
            this.saveTripInfo();
        });

        document.getElementById('start-time').addEventListener('change', (e) => {
            this.adjustAllTimes();
        });
    }

    enableDragAndDrop() {
        // This would enable drag and drop reordering of itinerary items
        // Implementation would go here for advanced functionality
    }

    saveTripInfo() {
        const tripData = {
            name: document.getElementById('trip-name').value,
            startTime: document.getElementById('start-time').value
        };

        // Save to localStorage or send to server
        localStorage.setItem('currentTrip', JSON.stringify(tripData));
    }

    adjustAllTimes() {
        const newStartTime = document.getElementById('start-time').value;
        if (!newStartTime || this.app.itinerary.length === 0) return;

        const startTime = this.app.parseTime(newStartTime);
        let currentTime = new Date(startTime);

        // Adjust all itinerary times
        this.app.itinerary.forEach(place => {
            place.startTime = this.app.formatTime(currentTime);
            currentTime = this.app.addHours(currentTime, place.duration);
            place.endTime = this.app.formatTime(currentTime);
            
            // Add 30 minutes travel time between places
            currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
        });

        this.app.updateItineraryDisplay();
    }

    optimizeRoute() {
        // This would implement route optimization
        // For now, just sort by time
        this.app.sortItinerary();
        this.app.updateItineraryDisplay();
    }

    calculateTravelTime(place1, place2) {
        // Mock travel time calculation
        // In real implementation, this would use Google Maps API
        const travelTimes = {
            'วัดพระแก้ว-พระบรมมหาราชวัง': 5,
            'วัดพระแก้ว-วัดอรุณราชวราราม': 15,
            'สยามสแควร์-ตลาดจตุจักร': 30,
            'default': 20
        };

        const key = `${place1.name}-${place2.name}`;
        return travelTimes[key] || travelTimes['default'];
    }

    exportItinerary() {
        const tripData = {
            name: document.getElementById('trip-name').value,
            itinerary: this.app.itinerary,
            budget: this.app.budget
        };

        const dataStr = JSON.stringify(tripData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${tripData.name || 'แผนการเดินทาง'}.json`;
        link.click();
    }

    importItinerary(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const tripData = JSON.parse(e.target.result);
                
                // Load trip info
                document.getElementById('trip-name').value = tripData.name || '';
                
                // Load itinerary
                this.app.itinerary = tripData.itinerary || [];
                this.app.budget = tripData.budget || this.app.budget;
                
                this.app.updateUI();
                
                alert('นำเข้าแผนการเดินทางสำเร็จ!');
            } catch (error) {
                alert('ไฟล์ไม่ถูกต้อง กรุณาลองใหม่');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize planner manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.travelApp) {
            window.plannerManager = new PlannerManager(window.travelApp);
        }
    }, 100);
});