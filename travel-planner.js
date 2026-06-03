/* ========================================
   KONYA → ROTTERDAM TRAVEL PLANNER
   Interactive Route & Cost Calculator
   ======================================== */

// ========================================
// DATA: Route Stops
// ========================================
const EUR_TO_TRY = 38.5; // Approximate EUR/TRY rate June 2026

const COUNTRY_DATA = {
    TR: { name: 'Türkiye', flag: '🇹🇷', diesel: 1.25, food: 12, hotel: 35, currency: 'TRY' },
    BG: { name: 'Bulgaristan', flag: '🇧🇬', diesel: 1.71, food: 15, hotel: 25, currency: 'BGN' },
    RS: { name: 'Sırbistan', flag: '🇷🇸', diesel: 1.90, food: 15, hotel: 30, currency: 'RSD' },
    HU: { name: 'Macaristan', flag: '🇭🇺', diesel: 1.73, food: 18, hotel: 40, currency: 'HUF' },
    AT: { name: 'Avusturya', flag: '🇦🇹', diesel: 1.88, food: 32, hotel: 85, currency: 'EUR' },
    DE: { name: 'Almanya', flag: '🇩🇪', diesel: 1.93, food: 32, hotel: 75, currency: 'EUR' },
    NL: { name: 'Hollanda', flag: '🇳🇱', diesel: 2.30, food: 35, hotel: 90, currency: 'EUR' },
    BE: { name: 'Belçika', flag: '🇧🇪', diesel: 1.85, food: 30, hotel: 70, currency: 'EUR' },
    HR: { name: 'Hırvatistan', flag: '🇭🇷', diesel: 1.65, food: 20, hotel: 50, currency: 'EUR' },
    SI: { name: 'Slovenya', flag: '🇸🇮', diesel: 1.60, food: 25, hotel: 60, currency: 'EUR' },
    CZ: { name: 'Çekya', flag: '🇨🇿', diesel: 1.55, food: 20, hotel: 45, currency: 'CZK' },
    RO: { name: 'Romanya', flag: '🇷🇴', diesel: 1.60, food: 15, hotel: 30, currency: 'RON' }
};

const VITO_CONSUMPTION = 8.0; // L/100km realistic

// Toll/Vignette costs per country (round trip)
const TOLL_COSTS = {
    TR: { name: 'Türkiye HGS Otoyol', cost: 32, note: 'Gidiş-dönüş otoyol + köprü' },
    BG: { name: 'Bulgaristan Vinyeti', cost: 16, note: 'Haftalık vinyetx2' },
    RS: { name: 'Sırbistan Otoyol', cost: 40, note: 'Mesafe bazlı gişe (gidiş-dönüş)' },
    HU: { name: 'Macaristan e-Matrica', cost: 35, note: '10 günlükx2' },
    AT: { name: 'Avusturya Vinyeti', cost: 26, note: '10 günlükx2' },
    DE: { name: 'Almanya', cost: 0, note: 'Binek araç ücretsiz ✓' },
    NL: { name: 'Hollanda', cost: 0, note: 'Binek araç ücretsiz ✓' }
};

// Default route stops
let routeStops = [
    // === GİDİŞ ===
    {
        id: 1, city: 'Konya', country: 'TR', lat: 37.8746, lng: 32.4932,
        type: 'start', day: 1, stayDays: 0, distToNext: 280,
        notes: 'Yola erken saatte çıkın. HGS bakiyenizi kontrol edin. Yanınıza yeterli TL alın.',
        direction: 'outbound'
    },
    {
        id: 2, city: 'Ankara', country: 'TR', lat: 39.9334, lng: 32.8597,
        type: 'transit', day: 1, stayDays: 0, distToNext: 450,
        notes: 'Ankara çevre yolundan geçin, şehir merkezine girmeyin. Yakıt kontrolü yapın.',
        direction: 'outbound'
    },
    {
        id: 3, city: 'İstanbul (Anadolu)', country: 'TR', lat: 41.0082, lng: 29.1319,
        type: 'overnight', day: 1, stayDays: 1, distToNext: 60,
        notes: 'Pendik veya Gebze civarında konaklayın. 15 Temmuz Köprüsü veya FSM\'den geçiş: 59 TL. Gece geçiş trafiği az olur.',
        direction: 'outbound'
    },
    {
        id: 4, city: 'Edirne (Kapıkule)', country: 'TR', lat: 41.6818, lng: 26.5623,
        type: 'border', day: 2, stayDays: 0, distToNext: 300,
        notes: '⚠️ Yaz döneminde Kapıkule\'de 2-4 saat bekleme olabilir. Sabah erken saatte geçmeyi planlayın. Pasaport ve vize kontrolü.',
        direction: 'outbound'
    },
    {
        id: 5, city: 'Sofya', country: 'BG', lat: 42.6977, lng: 23.3219,
        type: 'overnight', day: 2, stayDays: 1, distToNext: 200,
        notes: 'Bulgaristan vinyetini sınırda veya bgtoll.bg\'den alın (~€8 haftalık). Merkezdeki bütçe oteller uygun. Vitosha Blvd güzel bir akşam yürüyüşü.',
        direction: 'outbound'
    },
    {
        id: 6, city: 'Niş', country: 'RS', lat: 43.3209, lng: 21.8958,
        type: 'transit', day: 3, stayDays: 0, distToNext: 240,
        notes: 'Sırbistan gişelerinde EUR veya RSD nakit ödeme yapılabilir. Sırbistan\'da yakıt Avrupa ortalamasına yakın.',
        direction: 'outbound'
    },
    {
        id: 7, city: 'Belgrad', country: 'RS', lat: 44.7866, lng: 20.4489,
        type: 'overnight', day: 3, stayDays: 1, distToNext: 375,
        notes: 'Kalemegdan Kalesi ve Skadarlija sokağı mutlaka görülmeli. Ćevapčići deneyin! Uygun fiyatlı konaklama. Ada Ciganlija gölü güzel bir mola noktası.',
        direction: 'outbound'
    },
    {
        id: 8, city: 'Budapeşte', country: 'HU', lat: 47.4979, lng: 19.0402,
        type: 'sightseeing', day: 4, stayDays: 2, distToNext: 245,
        notes: 'Macaristan e-Matrica\'yı ematrica.nemzetiutdij.hu\'dan alın. Tuna nehri kıyısında akşam yürüyüşü, Zincir Köprü, Parlament binası, Széchenyi Termali.',
        direction: 'outbound'
    },
    {
        id: 9, city: 'Viyana', country: 'AT', lat: 48.2082, lng: 16.3738,
        type: 'sightseeing', day: 6, stayDays: 2, distToNext: 460,
        notes: 'Avusturya vinyetini 18 gün önceden dijital alın veya sınırda fiziksel alın! Schönbrunn Sarayı, Stephansdom, Naschmarkt. Wiener Schnitzel deneyin.',
        direction: 'outbound'
    },
    {
        id: 10, city: 'Nürnberg', country: 'DE', lat: 49.4521, lng: 11.0767,
        type: 'transit', day: 8, stayDays: 0, distToNext: 225,
        notes: 'Almanya\'da otoyollarda hız sınırı olmayan bölümler var ama dikkatli olun. Nürnberg kalesi ve eski şehir güzel bir mola.',
        direction: 'outbound'
    },
    {
        id: 11, city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821,
        type: 'overnight', day: 8, stayDays: 1, distToNext: 240,
        notes: 'Römerberg meydanı, Main nehri kıyısı. Apfelwein (elma şarabı) deneyin. Sachsenhausen bölgesi.',
        direction: 'outbound'
    },
    {
        id: 12, city: 'Köln', country: 'DE', lat: 50.9375, lng: 6.9603,
        type: 'transit', day: 9, stayDays: 0, distToNext: 200,
        notes: 'Köln Katedrali (Dom) görülmesi gereken bir UNESCO mirası. Kölsch birası tadılabilir.',
        direction: 'outbound'
    },
    {
        id: 13, city: 'Rotterdam', country: 'NL', lat: 51.9244, lng: 4.4777,
        type: 'destination', day: 9, stayDays: 10, distToNext: 0,
        notes: '🎯 Varış! Erasmus Köprüsü, Markthal, Küp Evler, Europoort limanı. Amsterdam\'a günübirlik tren ile gidilebilir (1.5 saat). Den Haag 30 dk uzaklıkta.',
        direction: 'outbound'
    },
    // === DÖNÜŞ ===
    {
        id: 14, city: 'Rotterdam', country: 'NL', lat: 51.9244, lng: 4.4777,
        type: 'start', day: 19, stayDays: 0, distToNext: 440,
        notes: 'Dönüş yolculuğu başlıyor. Yakıt deposunu doldurun (Hollanda pahalı, mümkünse Almanya\'da doldurun).',
        direction: 'return'
    },
    {
        id: 15, city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821,
        type: 'overnight', day: 19, stayDays: 1, distToNext: 460,
        notes: 'Dönüş molası. Almanya\'da son yakıt ikmali.',
        direction: 'return'
    },
    {
        id: 16, city: 'Viyana', country: 'AT', lat: 48.2082, lng: 16.3738,
        type: 'transit', day: 20, stayDays: 0, distToNext: 245,
        notes: 'Viyana\'dan geçiş. Avusturya vinyetiniz hala geçerliyse ek maliyet yok.',
        direction: 'return'
    },
    {
        id: 17, city: 'Budapeşte', country: 'HU', lat: 47.4979, lng: 19.0402,
        type: 'overnight', day: 20, stayDays: 1, distToNext: 375,
        notes: 'Son gece Budapeşte\'de konaklama. Romkert (yıkıntı barlar) deneyimi.',
        direction: 'return'
    },
    {
        id: 18, city: 'Belgrad', country: 'RS', lat: 44.7866, lng: 20.4489,
        type: 'transit', day: 21, stayDays: 0, distToNext: 440,
        notes: 'Belgrad üzerinden Bulgaristan\'a geçiş.',
        direction: 'return'
    },
    {
        id: 19, city: 'Sofya', country: 'BG', lat: 42.6977, lng: 23.3219,
        type: 'overnight', day: 21, stayDays: 1, distToNext: 300,
        notes: 'Son Avrupa konaklaması. Sofya\'da Aleksander Nevski Katedrali ziyareti.',
        direction: 'return'
    },
    {
        id: 20, city: 'Edirne (Kapıkule)', country: 'TR', lat: 41.6818, lng: 26.5623,
        type: 'border', day: 22, stayDays: 0, distToNext: 700,
        notes: 'Türkiye\'ye giriş. Selimiye Camii Edirne\'nin sembolü. Tava ciğer deneyin!',
        direction: 'return'
    },
    {
        id: 21, city: 'İstanbul', country: 'TR', lat: 41.0082, lng: 29.1319,
        type: 'overnight', day: 22, stayDays: 1, distToNext: 700,
        notes: 'İstanbul\'da mola. Boğaz turu veya eski şehir ziyareti.',
        direction: 'return'
    },
    {
        id: 22, city: 'Konya', country: 'TR', lat: 37.8746, lng: 32.4932,
        type: 'destination', day: 23, stayDays: 0, distToNext: 0,
        notes: '🏠 Eve dönüş! Toplam ~6,600 km yol tamamlandı.',
        direction: 'return'
    }
];

// Travel tips data
const TIPS = [
    {
        icon: 'fas fa-gas-pump',
        color: 'var(--gradient-warm)',
        title: 'Yakıt Stratejisi',
        text: 'Türkiye\'de ve Macaristan\'da yakıt en ucuz. Hollanda ve Almanya\'da en pahalı. Sınır geçmeden önce mutlaka deposu doldurun. Vito\'nun deposu ~75L, tam depoyla ~900 km gidebilirsiniz.'
    },
    {
        icon: 'fas fa-passport',
        color: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        title: 'Vize & Belgeler',
        text: '30 günlük Schengen vizesi için en az 3 ay önceden başvurun. Yanınızda: pasaport, vize, ehliyet (uluslararası sürücü belgesi önerilir), ruhsat, green card sigorta poliçesi, otel rezervasyonları bulundurun.'
    },
    {
        icon: 'fas fa-road',
        color: 'var(--gradient-accent)',
        title: 'Vinyetler & Geçişler',
        text: 'Tüm vinyetleri (Bulgaristan, Macaristan, Avusturya) ÖNCEDEN online satın alın. Avusturya dijital vinyetinde 18 gün aktivasyon süresi var! Sırbistan gişelerinde nakit EUR kabul edilir.'
    },
    {
        icon: 'fas fa-clock',
        color: 'var(--gradient-cool)',
        title: 'Sınır Kapısı İpuçları',
        text: 'Kapıkule\'de yaz aylarında 2-4 saat bekleme olabilir. Hafta içi ve sabah erken saatte geçiş yapmaya çalışın. Pasaportları ve belgeleri hazır tutun. AB giriş/çıkışta EES biyometrik kontrol başlamış olabilir.'
    },
    {
        icon: 'fas fa-utensils',
        color: 'linear-gradient(135deg, #10b981, #f59e0b)',
        title: 'Yemek & Bütçe',
        text: 'Balkanlar\'da (Bulgaristan, Sırbistan) yemek çok uygun. Market alışverişi her yerde bütçe dostu. Vito\'da mini buzdolabı veya soğutucu çanta bulundurun. Almanya\'da Aldi/Lidl ucuz market seçeneği.'
    },
    {
        icon: 'fas fa-bed',
        color: 'var(--gradient-primary)',
        title: 'Konaklama Önerileri',
        text: 'Booking.com veya Hostelworld\'den önceden rezervasyon yapın. Bulgaristan ve Sırbistan\'da çok uygun pansiyon/hostel var. Vito\'da uyuma düzeni de düşünülebilir (katlanır yatak).'
    },
    {
        icon: 'fas fa-car',
        color: 'linear-gradient(135deg, #64748b, #94a3b8)',
        title: 'Araç Hazırlığı',
        text: 'Yola çıkmadan önce: motor yağı, antifriz, lastik basıncı, fren balatası, far ve sinyal kontrolü. Stepne, kriko, reflektör yelek, yangın söndürücü (AB\'de zorunlu), ilk yardım çantası bulundurun.'
    },
    {
        icon: 'fas fa-wifi',
        color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        title: 'İletişim & Navigasyon',
        text: 'AB roaming ücretsiz (Schengen içi). Sırbistan AB dışı, ek ücret olabilir. Google Maps offline haritaları önceden indirin. Waze sınır bekleme süreleri için faydalı.'
    }
];

// ========================================
// APP STATE
// ========================================
let map = null;
let markers = [];
let routeLines = [];
let currentView = 'outbound';
let editingStopId = null;

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderTimeline();
    renderCosts();
    renderStopsList();
    renderTips();
    updateHeaderStats();
    bindEvents();
});

// ========================================
// MAP INITIALIZATION
// ========================================
function initMap() {
    map = L.map('map', {
        center: [46.0, 18.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
    });

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    drawRoute();
}

function createCustomIcon(type) {
    const iconMap = {
        start: 'fa-flag-checkered',
        transit: 'fa-arrows-left-right',
        border: 'fa-passport',
        overnight: 'fa-moon',
        destination: 'fa-location-dot',
        sightseeing: 'fa-camera'
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin ${type}"><i class="fas ${iconMap[type] || 'fa-circle'}"></i></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
}

function drawRoute() {
    // Clear existing
    markers.forEach(m => map.removeLayer(m));
    routeLines.forEach(l => map.removeLayer(l));
    markers = [];
    routeLines = [];

    const outboundStops = routeStops.filter(s => s.direction === 'outbound');
    const returnStops = routeStops.filter(s => s.direction === 'return');

    // Draw outbound line
    const outboundCoords = outboundStops.map(s => [s.lat, s.lng]);
    if (outboundCoords.length > 1) {
        const outboundLine = L.polyline(outboundCoords, {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.8,
            dashArray: null,
            smoothFactor: 1
        }).addTo(map);
        routeLines.push(outboundLine);
    }

    // Draw return line (slightly offset)
    const returnCoords = returnStops.map(s => [s.lat + 0.15, s.lng + 0.15]);
    if (returnCoords.length > 1) {
        const returnLine = L.polyline(returnCoords, {
            color: '#f59e0b',
            weight: 3,
            opacity: 0.5,
            dashArray: '8, 8',
            smoothFactor: 1
        }).addTo(map);
        routeLines.push(returnLine);
    }

    // Add markers for outbound
    outboundStops.forEach(stop => {
        const marker = L.marker([stop.lat, stop.lng], {
            icon: createCustomIcon(stop.type)
        }).addTo(map);

        const country = COUNTRY_DATA[stop.country];
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 200px; padding: 4px;">
                <h4 style="margin: 0 0 6px; font-size: 14px;">${country.flag} ${stop.city}</h4>
                <p style="margin: 0 0 4px; font-size: 12px; color: #666;">
                    <strong>Gün ${stop.day}</strong> · ${country.name}
                </p>
                ${stop.distToNext > 0 ? `<p style="margin: 0 0 4px; font-size: 12px; color: #888;">Sonraki durağa: ${stop.distToNext} km</p>` : ''}
                ${stop.stayDays > 0 ? `<p style="margin: 0 0 4px; font-size: 12px; color: #8b5cf6;">🛏️ ${stop.stayDays} gece konaklama</p>` : ''}
                <p style="margin: 6px 0 0; font-size: 11px; color: #999; line-height: 1.5;">${stop.notes}</p>
            </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 280 });
        markers.push(marker);
    });

    // Fit bounds
    const allCoords = routeStops.map(s => [s.lat, s.lng]);
    if (allCoords.length > 0) {
        map.fitBounds(allCoords, { padding: [30, 30] });
    }
}

// ========================================
// TIMELINE
// ========================================
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    const stops = routeStops.filter(s => s.direction === currentView);
    
    container.innerHTML = '';

    stops.forEach((stop, index) => {
        const country = COUNTRY_DATA[stop.country];
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.dataset.id = stop.id;

        item.innerHTML = `
            <div class="timeline-dot ${stop.type}"></div>
            <div class="timeline-card" onclick="focusOnStop(${stop.id})">
                <div class="timeline-card-header">
                    <span class="timeline-day">Gün ${stop.day}</span>
                    <span class="timeline-country">${country.flag} ${country.name}</span>
                </div>
                <div class="timeline-city">
                    <span class="flag">${country.flag}</span>
                    ${stop.city}
                    ${stop.stayDays > 0 ? `<span style="font-size:0.7rem; color: var(--accent-purple); margin-left: auto;">🛏️ ${stop.stayDays} gece</span>` : ''}
                </div>
                <div class="timeline-info">
                    ${stop.distToNext > 0 ? `
                        <div class="timeline-info-item">
                            <i class="fas fa-road"></i> ${stop.distToNext} km sonraki durak
                        </div>
                    ` : ''}
                    <div class="timeline-info-item">
                        <i class="fas fa-gas-pump"></i> ${country.diesel.toFixed(2)} €/L
                    </div>
                    ${stop.stayDays > 0 ? `
                        <div class="timeline-info-item">
                            <i class="fas fa-bed"></i> ~€${country.hotel}/gece
                        </div>
                    ` : ''}
                </div>
                ${stop.notes ? `<div class="timeline-notes">${stop.notes}</div>` : ''}
            </div>
        `;

        container.appendChild(item);
    });
}

function focusOnStop(stopId) {
    const stop = routeStops.find(s => s.id === stopId);
    if (stop && map) {
        map.flyTo([stop.lat, stop.lng], 10, { duration: 1.5 });
        // Open popup
        const markerIndex = routeStops.filter(s => s.direction === 'outbound').findIndex(s => s.id === stopId);
        if (markerIndex >= 0 && markers[markerIndex]) {
            markers[markerIndex].openPopup();
        }
    }
}

// ========================================
// COST CALCULATIONS
// ========================================
function calculateCosts() {
    const costs = {
        fuel: { items: [], total: 0 },
        tolls: { items: [], total: 0 },
        accommodation: { items: [], total: 0 },
        food: { items: [], total: 0 },
        visa: { items: [], total: 0 },
        extras: { items: [], total: 0 }
    };

    // --- FUEL ---
    // Calculate fuel per country segment
    const countryDistances = {};
    routeStops.forEach(stop => {
        if (stop.distToNext > 0) {
            if (!countryDistances[stop.country]) {
                countryDistances[stop.country] = 0;
            }
            countryDistances[stop.country] += stop.distToNext;
        }
    });

    Object.entries(countryDistances).forEach(([code, dist]) => {
        const country = COUNTRY_DATA[code];
        const liters = (dist / 100) * VITO_CONSUMPTION;
        const cost = liters * country.diesel;
        costs.fuel.items.push({
            label: `${country.flag} ${country.name} (${dist} km)`,
            value: cost,
            detail: `${liters.toFixed(0)}L × €${country.diesel.toFixed(2)}`
        });
        costs.fuel.total += cost;
    });

    // --- TOLLS ---
    Object.entries(TOLL_COSTS).forEach(([code, toll]) => {
        costs.tolls.items.push({
            label: `${COUNTRY_DATA[code].flag} ${toll.name}`,
            value: toll.cost,
            detail: toll.note
        });
        costs.tolls.total += toll.cost;
    });

    // --- ACCOMMODATION ---
    const overnightStops = routeStops.filter(s => s.stayDays > 0);
    overnightStops.forEach(stop => {
        const country = COUNTRY_DATA[stop.country];
        const cost = stop.stayDays * country.hotel;
        costs.accommodation.items.push({
            label: `${country.flag} ${stop.city} (${stop.stayDays} gece)`,
            value: cost,
            detail: `${stop.stayDays} × €${country.hotel}/gece`
        });
        costs.accommodation.total += cost;
    });

    // --- FOOD ---
    // Calculate total days
    const totalDays = Math.max(...routeStops.map(s => s.day + s.stayDays));
    // Group days by country
    const daysByCountry = {};
    routeStops.forEach(stop => {
        const days = Math.max(1, stop.stayDays);
        if (!daysByCountry[stop.country]) {
            daysByCountry[stop.country] = 0;
        }
        daysByCountry[stop.country] += days;
    });

    Object.entries(daysByCountry).forEach(([code, days]) => {
        const country = COUNTRY_DATA[code];
        const cost = days * country.food;
        costs.food.items.push({
            label: `${country.flag} ${country.name} (${days} gün)`,
            value: cost,
            detail: `${days} × €${country.food}/gün`
        });
        costs.food.total += cost;
    });

    // --- VISA & INSURANCE ---
    costs.visa.items.push({
        label: '🛂 Schengen Vizesi (yetişkin)',
        value: 90,
        detail: '2026 ücreti'
    });
    costs.visa.items.push({
        label: '📋 VFS Hizmet Bedeli',
        value: 40,
        detail: 'Başvuru merkezi ücreti'
    });
    costs.visa.items.push({
        label: '🚗 Green Card Sigorta (1 ay)',
        value: 59,
        detail: 'Uluslararası trafik sigortası'
    });
    costs.visa.items.push({
        label: '🏥 Seyahat Sağlık Sigortası',
        value: 45,
        detail: '30 gün, min €30.000 teminat (vize şartı)'
    });
    costs.visa.total = costs.visa.items.reduce((sum, i) => sum + i.value, 0);

    // --- EXTRAS ---
    costs.extras.items.push({
        label: '🅿️ Park ücretleri (tahmini)',
        value: 60,
        detail: 'Şehir içi park (toplam)'
    });
    costs.extras.items.push({
        label: '📱 İletişim (Sırbistan SIM)',
        value: 10,
        detail: 'Sırbistan AB dışı, yerel SIM'
    });
    costs.extras.items.push({
        label: '🎫 Müze/gezi giriş ücretleri',
        value: 50,
        detail: 'Çeşitli giriş ücretleri tahmini'
    });
    costs.extras.items.push({
        label: '⛽ Acil durum / beklenmedik',
        value: 100,
        detail: 'Yedek bütçe'
    });
    costs.extras.total = costs.extras.items.reduce((sum, i) => sum + i.value, 0);

    return costs;
}

function renderCosts() {
    const costs = calculateCosts();

    // Render each cost category
    renderCostCard('fuelCostBody', 'fuelCostTotal', costs.fuel);
    renderCostCard('tollCostBody', 'tollCostTotal', costs.tolls);
    renderCostCard('accCostBody', 'accCostTotal', costs.accommodation);
    renderCostCard('foodCostBody', 'foodCostTotal', costs.food);
    renderCostCard('visaCostBody', 'visaCostTotal', costs.visa);
    renderCostCard('extraCostBody', 'extraCostTotal', costs.extras);

    // Grand total
    const grandTotal = costs.fuel.total + costs.tolls.total + costs.accommodation.total +
                       costs.food.total + costs.visa.total + costs.extras.total;
    
    document.getElementById('grandTotalEur').textContent = `€ ${grandTotal.toFixed(0)}`;
    document.getElementById('grandTotalTry').textContent = `≈ ₺ ${Math.round(grandTotal * EUR_TO_TRY).toLocaleString('tr-TR')}`;
    document.getElementById('totalCostStat').querySelector('span').textContent = `€${grandTotal.toFixed(0)}`;

    // Breakdown bar
    const breakdownContainer = document.getElementById('grandTotalBreakdown');
    const segments = [
        { class: 'fuel', value: costs.fuel.total, label: 'Yakıt' },
        { class: 'toll', value: costs.tolls.total, label: 'Geçiş' },
        { class: 'acc', value: costs.accommodation.total, label: 'Konaklama' },
        { class: 'food', value: costs.food.total, label: 'Yemek' },
        { class: 'visa', value: costs.visa.total, label: 'Vize/Sigorta' },
        { class: 'extra', value: costs.extras.total, label: 'Diğer' }
    ];

    breakdownContainer.innerHTML = segments.map(seg => {
        const pct = (seg.value / grandTotal * 100);
        return `<div class="breakdown-segment ${seg.class}" 
                     style="width: ${pct}%"
                     title="${seg.label}: €${seg.value.toFixed(0)} (%${pct.toFixed(1)})"></div>`;
    }).join('');

    // Add legend below breakdown
    const legendHtml = `
        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 0.75rem; color: var(--text-muted);">
            ${segments.map(seg => `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 10px; height: 10px; border-radius: 2px;" class="breakdown-segment ${seg.class}"></div>
                    <span>${seg.label}: €${seg.value.toFixed(0)}</span>
                </div>
            `).join('')}
        </div>
    `;
    breakdownContainer.insertAdjacentHTML('afterend', legendHtml);
}

function renderCostCard(bodyId, totalId, costData) {
    const body = document.getElementById(bodyId);
    body.innerHTML = costData.items.map(item => `
        <div class="cost-row">
            <span class="cost-row-label">${item.label}</span>
            <span class="cost-row-value">€${item.value.toFixed(0)}</span>
        </div>
    `).join('');

    const total = document.getElementById(totalId);
    total.querySelector('strong').textContent = `€${costData.total.toFixed(0)}`;
}

// ========================================
// STOPS LIST (EDITOR)
// ========================================
function renderStopsList() {
    const list = document.getElementById('stopsList');
    list.innerHTML = '';

    routeStops.forEach((stop, index) => {
        const country = COUNTRY_DATA[stop.country];
        const item = document.createElement('div');
        item.className = 'stop-item';
        item.draggable = true;
        item.dataset.id = stop.id;

        const dirLabel = stop.direction === 'outbound' ? '→' : '←';
        const typeLabels = {
            start: '🟢 Başlangıç',
            transit: '🔵 Transit',
            border: '🟠 Sınır',
            overnight: '🟣 Konaklama',
            destination: '🔴 Varış',
            sightseeing: '🟡 Gezi'
        };

        item.innerHTML = `
            <div class="stop-drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="stop-number">${index + 1}</div>
            <div class="stop-info">
                <div class="stop-city">${country.flag} ${stop.city}</div>
                <div class="stop-meta">
                    <span>${dirLabel} ${stop.direction === 'outbound' ? 'Gidiş' : 'Dönüş'}</span>
                    <span>${typeLabels[stop.type] || stop.type}</span>
                    <span>Gün ${stop.day}</span>
                    ${stop.stayDays > 0 ? `<span>🛏️ ${stop.stayDays} gece</span>` : ''}
                    ${stop.distToNext > 0 ? `<span>→ ${stop.distToNext} km</span>` : ''}
                </div>
            </div>
            <div class="stop-actions">
                <button class="btn btn-glass" onclick="editStop(${stop.id})" title="Düzenle">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteStop(${stop.id})" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(item);
    });

    // Drag and drop
    initDragAndDrop();
}

// ========================================
// DRAG AND DROP
// ========================================
function initDragAndDrop() {
    const list = document.getElementById('stopsList');
    let draggedItem = null;

    list.querySelectorAll('.stop-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem && draggedItem !== item) {
                const fromId = parseInt(draggedItem.dataset.id);
                const toId = parseInt(item.dataset.id);
                const fromIndex = routeStops.findIndex(s => s.id === fromId);
                const toIndex = routeStops.findIndex(s => s.id === toId);

                const [moved] = routeStops.splice(fromIndex, 1);
                routeStops.splice(toIndex, 0, moved);

                refreshAll();
            }
        });
    });
}

// ========================================
// STOP EDITING
// ========================================
function editStop(stopId) {
    editingStopId = stopId;
    const stop = routeStops.find(s => s.id === stopId);
    if (!stop) return;

    document.getElementById('modalTitle').textContent = `${stop.city} Düzenle`;
    document.getElementById('inputCity').value = stop.city;
    document.getElementById('inputCountry').value = stop.country;
    document.getElementById('inputLat').value = stop.lat;
    document.getElementById('inputLng').value = stop.lng;
    document.getElementById('inputDays').value = stop.stayDays;
    document.getElementById('inputType').value = stop.type;
    document.getElementById('inputNotes').value = stop.notes || '';

    document.getElementById('editModal').classList.add('active');
}

function saveStop() {
    const stop = routeStops.find(s => s.id === editingStopId);
    if (!stop) return;

    stop.city = document.getElementById('inputCity').value;
    stop.country = document.getElementById('inputCountry').value;
    stop.lat = parseFloat(document.getElementById('inputLat').value);
    stop.lng = parseFloat(document.getElementById('inputLng').value);
    stop.stayDays = parseInt(document.getElementById('inputDays').value);
    stop.type = document.getElementById('inputType').value;
    stop.notes = document.getElementById('inputNotes').value;

    closeModal();
    refreshAll();
}

function deleteStop(stopId) {
    if (!confirm('Bu durağı silmek istediğinize emin misiniz?')) return;
    routeStops = routeStops.filter(s => s.id !== stopId);
    refreshAll();
}

function addNewStop() {
    const maxId = Math.max(...routeStops.map(s => s.id), 0);
    const lastOutbound = routeStops.filter(s => s.direction === 'outbound').pop();
    
    const newStop = {
        id: maxId + 1,
        city: 'Yeni Durak',
        country: 'DE',
        lat: 50.0,
        lng: 10.0,
        type: 'transit',
        day: lastOutbound ? lastOutbound.day : 1,
        stayDays: 0,
        distToNext: 100,
        notes: '',
        direction: currentView
    };

    // Insert before last stop of current view
    const viewStops = routeStops.filter(s => s.direction === currentView);
    const lastStop = viewStops[viewStops.length - 1];
    const insertIndex = routeStops.indexOf(lastStop);
    routeStops.splice(insertIndex, 0, newStop);

    refreshAll();
    editStop(newStop.id);
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    editingStopId = null;
}

// ========================================
// TIPS
// ========================================
function renderTips() {
    const grid = document.getElementById('tipsGrid');
    grid.innerHTML = TIPS.map(tip => `
        <div class="tip-card">
            <div class="tip-card-icon" style="background: ${tip.color};">
                <i class="${tip.icon}"></i>
            </div>
            <h4>${tip.title}</h4>
            <p>${tip.text}</p>
        </div>
    `).join('');
}

// ========================================
// HEADER STATS
// ========================================
function updateHeaderStats() {
    const totalDist = routeStops.reduce((sum, s) => sum + (s.distToNext || 0), 0);
    const maxDay = Math.max(...routeStops.map(s => s.day + s.stayDays));

    document.getElementById('totalDistanceStat').querySelector('span').textContent = 
        `~${totalDist.toLocaleString('tr-TR')} km`;
    document.getElementById('totalDaysStat').querySelector('span').textContent = 
        `${maxDay} gün`;
}

// ========================================
// REFRESH ALL
// ========================================
function refreshAll() {
    // Recalculate days
    recalculateDays();
    
    drawRoute();
    renderTimeline();
    
    // Remove old breakdown legend
    const existingLegend = document.querySelector('.grand-total-card > div:last-child:not(.grand-total-content):not(.grand-total-breakdown)');
    if (existingLegend && existingLegend.style) {
        existingLegend.remove();
    }
    
    renderCosts();
    renderStopsList();
    updateHeaderStats();
}

function recalculateDays() {
    let currentDay = 1;
    
    ['outbound', 'return'].forEach(direction => {
        const stops = routeStops.filter(s => s.direction === direction);
        stops.forEach((stop, index) => {
            stop.day = currentDay;
            currentDay += Math.max(stop.stayDays, 0);
            if (index < stops.length - 1 && stop.stayDays === 0) {
                // If same-day transit, don't increment day unless next stop is overnight
            }
            if (stop.stayDays > 0) {
                currentDay += 1; // Day after staying
            } else if (index < stops.length - 1) {
                // Check if next segment is long enough for a new day
                if (stop.distToNext > 400) {
                    currentDay += 1;
                }
            }
        });
    });
}

// ========================================
// EVENT BINDINGS
// ========================================
function bindEvents() {
    // Fit bounds button
    document.getElementById('btnFitBounds').addEventListener('click', () => {
        const allCoords = routeStops.map(s => [s.lat, s.lng]);
        map.fitBounds(allCoords, { padding: [30, 30] });
    });

    // Toggle view
    document.getElementById('btnOutbound').addEventListener('click', function() {
        currentView = 'outbound';
        this.classList.add('active');
        document.getElementById('btnReturn').classList.remove('active');
        renderTimeline();
    });

    document.getElementById('btnReturn').addEventListener('click', function() {
        currentView = 'return';
        this.classList.add('active');
        document.getElementById('btnOutbound').classList.remove('active');
        renderTimeline();
    });

    // Add stop
    document.getElementById('btnAddStop').addEventListener('click', addNewStop);

    // Modal
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);
    document.getElementById('btnModalSave').addEventListener('click', saveStop);
    
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('editModal')) {
            closeModal();
        }
    });

    // Toggle stops visibility
    let stopsVisible = true;
    document.getElementById('btnToggleStops').addEventListener('click', () => {
        stopsVisible = !stopsVisible;
        markers.forEach(m => {
            if (stopsVisible) {
                m.addTo(map);
            } else {
                map.removeLayer(m);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Smooth scroll for header
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        const currentScroll = window.scrollY;
        
        if (currentScroll > 100) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// Make functions globally accessible
window.focusOnStop = focusOnStop;
window.editStop = editStop;
window.deleteStop = deleteStop;
