// This function will be called by the Google Maps API script on load
function initSearchManager() {
    // If travelApp isn't ready, wait a bit and try again.
    // This handles the race condition between app.js loading and the API callback.
    if (window.travelApp) {
        window.searchManager = new SearchManager(window.travelApp);
    } else {
        setTimeout(initSearchManager, 100);
    }
}

class SearchManager {
    constructor(app) {
        this.app = app; // Reference to the main app
        this.placesService = null;
        this.places = []; // To store API results
        this.init();
    }

    init() {
        try {
            // A map instance is required for the PlacesService, but it doesn't need to be displayed.
            const map = new google.maps.Map(document.createElement('div'));
            this.placesService = new google.maps.places.PlacesService(map);
            this.bindSearchEvents();
            this.searchPlaces("ที่เที่ยวในกรุงเทพ"); // Initial search for better UX
        } catch (error) {
            console.error("Google Maps API not loaded correctly.", error);
            this.showError("ไม่สามารถโหลด Google Maps API ได้ โปรดตรวจสอบ API Key และการเชื่อมต่ออินเทอร์เน็ต");
        }
    }

    bindSearchEvents() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchBtn.addEventListener('click', () => this.searchPlaces(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPlaces(searchInput.value);
        });
    }

    searchPlaces(query) {
        if (!this.placesService) {
             this.showError("บริการค้นหาสถานที่ยังไม่พร้อมใช้งาน");
             return;
        }
        if (!query.trim()) return;
        
        this.showLoading();

        const request = {
            query: query,
            fields: ['name', 'rating', 'formatted_address', 'photos', 'place_id', 'types'],
        };

        this.placesService.textSearch(request, (results, status) => {
            this.hideLoading();
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                this.places = results;
                this.displayPlaces();
            } else {
                this.showError('ไม่พบสถานที่ที่ค้นหา หรือเกิดข้อผิดพลาด กรุณาลองใหม่ (อาจเป็นเพราะ API Key ไม่ถูกต้อง)');
                console.error("Places API search failed with status:", status);
            }
        });
    }

    displayPlaces() {
        const container = document.getElementById('search-results');
        if (!this.places || this.places.length === 0) {
            container.innerHTML = `<div class="no-results"><i class="fas fa-search"></i><h3>ไม่พบผลลัพธ์</h3><p>ลองใช้คำค้นหาอื่น</p></div>`;
            return;
        }

        container.innerHTML = this.places.map(place => this.createPlaceCardHTML(place)).join('');

        // Bind "add to plan" buttons
        container.querySelectorAll('.add-to-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const placeId = e.target.closest('.place-card').dataset.placeId;
                this.addToItinerary(placeId);
            });
        });
    }

    addToItinerary(placeId) {
        const place = this.places.find(p => p.place_id === placeId);
        if (!place) return;

        // Check if already in itinerary
        if (this.app.itinerary.some(p => p.name.toLowerCase() === place.name.toLowerCase())) {
            this.app.showToast(`'${place.name}' อยู่ในแผนการเดินทางแล้ว`, 'info');
            return;
        }

        const placeData = {
            name: place.name,
            description: place.formatted_address || '',
            category: this.mapGoogleTypeToCategory(place.types),
            province: 'bangkok' // Default to bangkok, can be improved
        };
        
        // Use the revised method in the main app to open the modal
        this.app.addPlaceFromApi(placeData);

        // Switch to planner tab to show the result
        this.app.showToast(`'${place.name}' ถูกเลือกแล้ว กรุณากรอกรายละเอียด`, 'success');
    }
    
    mapGoogleTypeToCategory(types) {
        if (!types) return 'Others';
        const typeMap = {
            'tourist_attraction': 'Others', 'temple': 'temple', 'church': 'temple', 'mosque': 'temple', 'hindu_temple': 'temple', 'buddhist_temple': 'temple', 'shopping_mall': 'Shopping mall', 'department_store': 'Shopping mall', 'market': 'Maket', 'cafe': 'Cafe', 'restaurant': 'restaurant', 'bar': 'restaurant', 'museum': 'museum', 'art_gallery': 'museum', 'park': 'viewpoint', 'zoo': 'viewpoint'
        };
        for (const type of types) {
            if (typeMap[type]) return typeMap[type];
        }
        return 'Others';
    }

    createPlaceCardHTML(place) {
        const imageUrl = place.photos && place.photos.length > 0 
            ? place.photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400}) 
            : `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(place.name)}`;

        const rating = place.rating ? `<span class="place-rating"><i class="fas fa-star"></i> ${place.rating.toFixed(1)}</span>` : '';

        return `
            <div class="place-card" data-place-id="${place.place_id}">
                <div class="place-image" style="background-image: url('${imageUrl}');"></div>
                <div class="place-content">
                    <h3>${place.name}</h3>
                    <div class="place-meta">
                         <span class="place-address">${place.formatted_address || ''}</span>
                         ${rating}
                    </div>
                    <div class="place-actions">
                        <button class="btn btn-primary add-to-plan-btn">
                            <i class="fas fa-plus"></i> เพิ่มในแผน
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showLoading() {
        document.getElementById('search-results').innerHTML = `<div class="spinner-container"><div class="spinner"></div><p>กำลังค้นหา...</p></div>`;
    }
    
    hideLoading() {
        const spinner = document.querySelector('.spinner-container');
        if (spinner) spinner.remove();
    }

    showError(message) {
        document.getElementById('search-results').innerHTML = `<div class="no-results"><i class="fas fa-exclamation-triangle"></i><h3>เกิดข้อผิดพลาด</h3><p>${message}</p></div>`;
    }
}
