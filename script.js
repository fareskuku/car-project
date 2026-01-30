document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('active');
            hamburger.textContent = menu.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.min = new Date().toISOString().split('T')[0];
        if (!input.value) input.value = input.min;
    });
    
    document.querySelectorAll('input[type="time"]').forEach(input => {
        if (!input.value) {
            const now = new Date();
            now.setHours(now.getHours() + 1);
            input.value = now.getHours().toString().padStart(2, '0') + ':00';
        }
    });
    
    const quickForm = document.getElementById('quick-booking');
    if (quickForm) {
        quickForm.addEventListener('submit', e => {
            e.preventDefault();
            const from = quickForm.querySelector('[name="from"]').value;
            const to = quickForm.querySelector('[name="to"]').value;
            const date = quickForm.querySelector('[name="date"]').value;
            
            if (!from || !to || !date) {
                alert('Please fill all fields');
                return;
            }
            
            if (from === to) {
                alert('From and To cannot be same');
                return;
            }
            
            localStorage.setItem('search', JSON.stringify({from, to, date}));
            window.location.href = 'booking.html';
        });
    }
    
    if (document.getElementById('booking-form')) initializeBooking();
    if (document.getElementById('bookings-list')) initializeBookings();
    if (document.getElementById('contact-form')) {
        document.getElementById('contact-form').addEventListener('submit', e => {
            e.preventDefault();
            alert('Thank you for your message! We will contact you soon.');
            e.target.reset();
        });
    }
    if (document.getElementById('osm-map')) initializeOSMMap();
});

function generateSeats() {
    const container = document.getElementById('seats-container');
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.textContent = i;
        if (Math.random() < 0.2) seat.classList.add('booked');
        container.appendChild(seat);
    }
}

function initializeBooking() {
    let currentStep = 1;
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.form-section');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const form = document.getElementById('booking-form');
    
    const saved = JSON.parse(localStorage.getItem('search') || '{}');
    ['from', 'to', 'date'].forEach(field => {
        const el = document.getElementById(`${field === 'date' ? 'travel-date' : `${field}-location`}`);
        if (el && saved[field]) el.value = saved[field];
    });
    
    function updateSteps() {
        sections.forEach((s, i) => s.style.display = i + 1 === currentStep ? 'block' : 'none');
        steps.forEach((s, i) => s.classList.toggle('active', i + 1 === currentStep));
        
        if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.textContent = currentStep === sections.length ? 'Confirm Booking' : 'Next Step';
        if (currentStep === 4) updateBookingSummary();
    }
    
    function validateStep() {
        const section = sections[currentStep - 1];
        const required = section.querySelectorAll('[required]');
        
        for (let field of required) {
            if (!field.value.trim()) {
                alert(`Please fill: ${field.previousElementSibling?.textContent || field.placeholder || field.name}`);
                field.focus();
                return false;
            }
        }
        
        if (currentStep === 1) {
            const from = document.getElementById('from-location')?.value;
            const to = document.getElementById('to-location')?.value;
            if (from === to) {
                alert('From and To cannot be same');
                return false;
            }
        }
        
        if (currentStep === 2) {
            const selected = document.querySelectorAll('.seat.selected').length;
            const passengers = parseInt(document.getElementById('passengers')?.value || '1');
            if (selected !== passengers) {
                alert(`Please select exactly ${passengers} seat(s)`);
                return false;
            }
        }
        
        return true;
    }
    
    function initializeSeats() {
        generateSeats();
        const seats = document.querySelectorAll('.seat:not(.booked)');
        const passengerSelect = document.getElementById('passengers');
        let maxSeats = parseInt(passengerSelect?.value || '1');
        
        const maxSeatsEl = document.getElementById('max-seats');
        if (maxSeatsEl) maxSeatsEl.textContent = maxSeats;
        
        seats.forEach(seat => {
            seat.addEventListener('click', function() {
                if (this.classList.contains('booked')) return;
                
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                } else {
                    const selected = document.querySelectorAll('.seat.selected').length;
                    if (selected >= maxSeats) {
                        alert(`Maximum ${maxSeats} seat(s) allowed`);
                        return;
                    }
                    this.classList.add('selected');
                }
                
                updateSeatDisplay();
            });
        });
        
        if (passengerSelect) {
            passengerSelect.addEventListener('change', function() {
                maxSeats = parseInt(this.value);
                if (maxSeatsEl) maxSeatsEl.textContent = maxSeats;
                
                const selectedSeats = document.querySelectorAll('.seat.selected');
                if (selectedSeats.length > maxSeats) {
                    for (let i = maxSeats; i < selectedSeats.length; i++) {
                        selectedSeats[i].classList.remove('selected');
                    }
                }
                
                updateSeatDisplay();
            });
        }
        
        updateSeatDisplay();
    }
    
    function updateSeatDisplay() {
        const selectedSeats = document.querySelectorAll('.seat.selected');
        const seatNumbers = Array.from(selectedSeats).map(s => s.textContent);
        
        const countEl = document.getElementById('selected-seats-count');
        const listEl = document.getElementById('selected-seats-list');
        const priceEl = document.getElementById('total-price');
        
        if (countEl) countEl.textContent = selectedSeats.length;
        if (listEl) listEl.textContent = seatNumbers.join(', ') || 'None';
        if (priceEl) priceEl.textContent = selectedSeats.length * 8;
    }
    
    function generatePassengerForms() {
        const container = document.getElementById('passenger-forms');
        if (!container) return;
        
        const count = parseInt(document.getElementById('passengers')?.value || '1');
        container.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            container.innerHTML += `
                <div class="form-group">
                    <h4>Passenger ${i}</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="passenger-name-${i}">Full Name *</label>
                            <input type="text" id="passenger-name-${i}" required>
                        </div>
                        <div class="form-group">
                            <label for="passenger-age-${i}">Age *</label>
                            <input type="number" id="passenger-age-${i}" min="1" max="120" required>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    function updateBookingSummary() {
        const from = document.getElementById('from-location')?.value || '';
        const to = document.getElementById('to-location')?.value || '';
        const date = document.getElementById('travel-date')?.value || '';
        const time = document.getElementById('travel-time')?.value || '';
        const passengers = document.getElementById('passengers')?.value || '1';
        
        const selectedSeats = document.querySelectorAll('.seat.selected');
        const seatNumbers = Array.from(selectedSeats).map(s => s.textContent);
        const total = selectedSeats.length * 8;
        
        const elements = {
            'summary-route': `${from} → ${to}`,
            'summary-date': date,
            'summary-time': time,
            'summary-passengers': passengers,
            'summary-seats': seatNumbers.join(', ') || 'Not selected',
            'summary-total': total
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    }
    
    function completeBooking() {
        const data = {
            from: document.getElementById('from-location')?.value || '',
            to: document.getElementById('to-location')?.value || '',
            date: document.getElementById('travel-date')?.value || '',
            time: document.getElementById('travel-time')?.value || '',
            passengers: document.getElementById('passengers')?.value || '1',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            payment: document.getElementById('payment')?.value || ''
        };
        
        const selectedSeats = document.querySelectorAll('.seat.selected');
        const seatNumbers = Array.from(selectedSeats).map(s => s.textContent);
        const total = selectedSeats.length * 8;
        
        const passengerCount = parseInt(data.passengers);
        const passengerData = [];
        for (let i = 1; i <= passengerCount; i++) {
            const name = document.getElementById(`passenger-name-${i}`)?.value || '';
            const age = document.getElementById(`passenger-age-${i}`)?.value || '';
            if (name && age) passengerData.push({ name, age });
        }
        
        const booking = {
            id: 'ADD' + Date.now().toString().slice(-8),
            ...data,
            seats: seatNumbers,
            passengerData,
            total,
            status: 'valid',
            booked: new Date().toISOString()
        };
        
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        if (form) form.style.display = 'none';
        const confirmation = document.getElementById('confirmation');
        if (confirmation) {
            confirmation.style.display = 'block';
            document.getElementById('booking-id').textContent = booking.id;
        }
        
        localStorage.removeItem('search');
        alert(`Booking successful! Your Booking ID: ${booking.id}`);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep()) {
                if (currentStep < sections.length) {
                    currentStep++;
                    updateSteps();
                    if (currentStep === 3) generatePassengerForms();
                } else {
                    completeBooking();
                }
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateSteps();
            }
        });
    }
    
    updateSteps();
    initializeSeats();
    
    const params = new URLSearchParams(window.location.search);
    ['from', 'to'].forEach(param => {
        const value = params.get(param);
        const el = document.getElementById(`${param}-location`);
        if (el && value) {
            el.value = value;
            el.dispatchEvent(new Event('change'));
        }
    });
}

function initializeBookings() {
    function loadBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const noBookings = document.getElementById('no-bookings');
        const list = document.getElementById('bookings-list');
        
        if (bookings.length === 0) {
            if (noBookings) noBookings.style.display = 'block';
            if (list) list.innerHTML = '';
            return;
        }
        
        if (noBookings) noBookings.style.display = 'none';
        if (list) list.innerHTML = '';
        
        bookings.sort((a, b) => new Date(b.booked) - new Date(a.booked));
        
        bookings.forEach((booking, i) => {
            const card = document.createElement('div');
            card.className = 'ticket';
            card.innerHTML = `
                <div class="ticket-header">
                    <div>
                        <h3>${booking.from} → ${booking.to}</h3>
                        <p>${booking.date} at ${booking.time}</p>
                    </div>
                    <span class="status status-${booking.status}">${booking.status}</span>
                </div>
                <div>
                    <p><strong>Booking ID:</strong> <span class="ticket-id">${booking.id}</span></p>
                    <p><strong>Seats:</strong> ${booking.seats.join(', ') || 'Not selected'}</p>
                    <p><strong>Passengers:</strong> ${booking.passengers}</p>
                    <p><strong>Total:</strong> ETB ${booking.total}</p>
                </div>
                <div class="ticket-actions">
                    <button class="btn btn-secondary" onclick="viewTicketDetails(${i})">View Details</button>
                    ${booking.status === 'valid' ? 
                        `<button class="btn btn-primary" onclick="useTicket(${i})">Use Ticket</button>` : 
                        ''}
                </div>
            `;
            if (list) list.appendChild(card);
        });
        
        const totalEl = document.getElementById('total-bookings');
        const validEl = document.getElementById('valid-bookings');
        const usedEl = document.getElementById('used-bookings');
        
        if (totalEl) totalEl.textContent = bookings.length;
        if (validEl) validEl.textContent = bookings.filter(b => b.status === 'valid').length;
        if (usedEl) usedEl.textContent = bookings.filter(b => b.status === 'used').length;
    }
    
    const searchInput = document.getElementById('search-bookings');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            document.querySelectorAll('.ticket').forEach(ticket => {
                ticket.style.display = ticket.textContent.toLowerCase().includes(term) ? 'block' : 'none';
            });
        });
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            document.querySelectorAll('.ticket').forEach(ticket => {
                if (filter === 'all') {
                    ticket.style.display = 'block';
                } else {
                    const status = ticket.querySelector('.status').textContent.toLowerCase();
                    ticket.style.display = status === filter ? 'block' : 'none';
                }
            });
        });
    });
    
    loadBookings();
}

let osmMap, osmMarkers = [], routeLines = [];

const busStations = [
    { id: 'piazza', name: 'Piazza Station', pos: [9.039, 38.748], routes: ['101', '102'], address: 'Piazza, Addis Ababa' },
    { id: 'mercatto', name: 'Mercato Station', pos: [9.025, 38.743], routes: ['101', '102', '103'], address: 'Mercato, Addis Ababa' },
    { id: 'mexico', name: 'Mexico Square Station', pos: [9.021, 38.758], routes: ['102', '104'], address: 'Mexico Square, Addis Ababa' },
    { id: 'bole', name: 'Bole Station', pos: [8.992, 38.789], routes: ['101', '103', '105'], address: 'Bole, Addis Ababa' },
    { id: 'airport', name: 'Bole Airport Station', pos: [8.980, 38.799], routes: ['103', '105'], address: 'Bole Airport, Addis Ababa' },
    { id: 'saris', name: 'Saris Station', pos: [9.035, 38.792], routes: ['103', '104'], address: 'Saris, Addis Ababa' },
    { id: 'terminal', name: 'City Bus Terminal', pos: [9.030, 38.765], routes: ['101', '102', '103', '104', '105'], address: 'City Terminal, Addis Ababa' }
];

const routes = {
    '101': { name: 'Route 101', stops: ['Piazza Station', 'Mercato Station', 'Bole Station'], duration: '45 min', fare: '8 ETB', frequency: 'Every 15 min', path: [[9.039,38.748],[9.025,38.743],[8.992,38.789]] },
    '102': { name: 'Route 102', stops: ['Piazza Station', 'Mercato Station', 'Mexico Square Station'], duration: '30 min', fare: '6 ETB', frequency: 'Every 10 min', path: [[9.039,38.748],[9.025,38.743],[9.021,38.758]] },
    '103': { name: 'Route 103', stops: ['Mercato Station', 'Bole Station', 'Bole Airport Station', 'Saris Station'], duration: '35 min', fare: '7 ETB', frequency: 'Every 20 min', path: [[9.025,38.743],[8.992,38.789],[8.980,38.799],[9.035,38.792]] },
    '104': { name: 'Route 104', stops: ['Mexico Square Station', 'Saris Station'], duration: '25 min', fare: '5 ETB', frequency: 'Every 15 min', path: [[9.021,38.758],[9.035,38.792]] },
    '105': { name: 'Route 105', stops: ['Bole Airport Station', 'Bole Station'], duration: '15 min', fare: '4 ETB', frequency: 'Every 30 min', path: [[8.980,38.799],[8.992,38.789]] }
};

function initializeOSMMap() {
    osmMap = L.map('osm-map').setView([9.032, 38.746], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
    }).addTo(osmMap);
    
    addStationMarkers();
    setupMapControls();
    showStationInfo(busStations.find(s => s.id === 'terminal'));
}

function addStationMarkers() {
    busStations.forEach(station => {
        const isTerminal = station.id === 'terminal';
        const icon = L.divIcon({
            html: `<div style="width:20px;height:20px;background:${isTerminal?'#DA121A':'#078930'};border:2px solid white;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.3);cursor:pointer"></div>`,
            className: 'bus-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker(station.pos, { icon })
            .addTo(osmMap)
            .bindTooltip(station.name, { direction: 'top' })
            .on('click', () => showStationInfo(station));
        
        osmMarkers.push(marker);
    });
}

function showStationInfo(station) {
    const marker = osmMarkers.find(m => 
        m.getLatLng().lat === station.pos[0] && m.getLatLng().lng === station.pos[1]
    );
    
    if (marker) {
        marker.bindPopup(`
            <div class="station-popup">
                <h3>${station.name}</h3>
                <p><strong>Address:</strong> ${station.address}</p>
                <p><strong>Routes:</strong> ${station.routes.join(', ')}</p>
                <div class="popup-actions">
                    <button onclick="bookFromStation('${station.id}')">
                        Book from here
                    </button>
                    <button onclick="showRoutesFromStation('${station.id}')">
                        Show routes
                    </button>
                </div>
            </div>
        `).openPopup();
    }
    
    updateRouteInfo(station);
}

function updateRouteInfo(station) {
    const details = document.getElementById('route-details');
    if (!details) return;
    
    let html = `<h4>${station.name}</h4><p>Available routes:</p>`;
    
    station.routes.forEach(routeId => {
        const route = routes[routeId];
        if (route) {
            html += `
                <div class="route-card">
                    <h5>${route.name}</h5>
                    <p><strong>Stops:</strong> ${route.stops.join(' → ')}</p>
                    <p><strong>Duration:</strong> ${route.duration} | <strong>Fare:</strong> ${route.fare}</p>
                    <p><strong>Frequency:</strong> ${route.frequency}</p>
                    <div class="route-actions">
                        <button class="btn btn-primary" onclick="showRoute('${routeId}')">
                            Show on Map
                        </button>
                        <button class="btn btn-secondary" onclick="bookRoute('${route.stops[0]}','${route.stops[route.stops.length-1]}')">
                            Book Route
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    details.innerHTML = html;
    document.getElementById('route-info').classList.add('active');
}

function showRoute(routeId) {
    const route = routes[routeId];
    if (!route) return;
    
    clearRoutes();
    
    const line = L.polyline(route.path, {
        color: '#078930',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(osmMap);
    
    routeLines.push(line);
    
    route.path.forEach((point, i) => {
        L.circleMarker(point, {
            radius: 6,
            fillColor: '#078930',
            color: '#fff',
            weight: 2
        }).addTo(osmMap).bindTooltip(route.stops[i] || `Stop ${i+1}`);
    });
    
    const details = document.getElementById('route-details');
    if (details) {
        details.innerHTML = `
            <h4>${route.name}</h4>
            <p><strong>Route:</strong> ${route.stops.join(' → ')}</p>
            <p><strong>Duration:</strong> ${route.duration} | <strong>Fare:</strong> ${route.fare}</p>
            <p><strong>Frequency:</strong> ${route.frequency}</p>
            <div class="route-buttons">
                <button class="btn btn-primary" onclick="bookRoute('${route.stops[0]}','${route.stops[route.stops.length-1]}')">
                    Book This Route
                </button>
                <button class="btn btn-secondary" onclick="clearRoutes()">
                    Clear Route
                </button>
            </div>
        `;
    }
    
    osmMap.fitBounds(line.getBounds());
}

function clearRoutes() {
    routeLines.forEach(line => osmMap.removeLayer(line));
    routeLines = [];
    const selector = document.getElementById('route-selector');
    if (selector) selector.value = '';
}

function setupMapControls() {
    document.getElementById('reset-map')?.addEventListener('click', () => {
        clearRoutes();
        osmMap.setView([9.032, 38.746], 12);
        showStationInfo(busStations.find(s => s.id === 'terminal'));
    });
    
    document.getElementById('show-terminal')?.addEventListener('click', () => {
        const terminal = busStations.find(s => s.id === 'terminal');
        if (terminal) {
            osmMap.setView(terminal.pos, 15);
            showStationInfo(terminal);
        }
    });
    
    document.getElementById('show-all-routes')?.addEventListener('click', () => {
        const details = document.getElementById('route-details');
        if (details) {
            let html = '<h4>All Bus Routes</h4>';
            Object.entries(routes).forEach(([id, route]) => {
                html += `
                    <div class="route-card">
                        <h5>${route.name}</h5>
                        <p><strong>Route:</strong> ${route.stops.join(' → ')}</p>
                        <p><strong>Duration:</strong> ${route.duration} | <strong>Fare:</strong> ${route.fare}</p>
                        <p><strong>Frequency:</strong> ${route.frequency}</p>
                        <div class="route-actions">
                            <button class="btn btn-primary" onclick="showRoute('${id}')">
                                Show on Map
                            </button>
                            <button class="btn btn-secondary" onclick="bookRoute('${route.stops[0]}','${route.stops[route.stops.length-1]}')">
                                Book Route
                            </button>
                        </div>
                    </div>
                `;
            });
            details.innerHTML = html;
            document.getElementById('route-info').classList.add('active');
        }
    });
    
    document.getElementById('route-selector')?.addEventListener('change', function() {
        if (this.value) showRoute(this.value);
        else clearRoutes();
    });
}

function bookFromStation(stationId) {
    window.location.href = `booking.html?from=${stationId}`;
}

function bookRoute(from, to) {
    const fromSimple = from.replace(' Station', '').toLowerCase();
    const toSimple = to.replace(' Station', '').toLowerCase();
    window.location.href = `booking.html?from=${fromSimple}&to=${toSimple}`;
}

function showRoutesFromStation(stationId) {
    const station = busStations.find(s => s.id === stationId);
    if (station) updateRouteInfo(station);
}

function viewTicketDetails(index) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings[index];
    if (!booking) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Ticket Details</h2>
            <div class="ticket">
                <div class="ticket-header">
                    <h3>${booking.from} → ${booking.to}</h3>
                    <span class="status status-${booking.status}">${booking.status}</span>
                </div>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Seats:</strong> ${booking.seats.join(', ')}</p>
                <p><strong>Passengers:</strong> ${booking.passengers}</p>
                <p><strong>Passenger Details:</strong></p>
                ${booking.passengerData?.map(p => `<p class="passenger-info">- ${p.name} (Age: ${p.age})</p>`).join('') || ''}
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Payment:</strong> ${booking.payment}</p>
                <p><strong>Total:</strong> ETB ${booking.total}</p>
                <p><strong>Booked on:</strong> ${new Date(booking.booked).toLocaleString()}</p>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="printTicket(${index})">Print Ticket</button>
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function useTicket(index) {
    if (!confirm('Mark this ticket as used? This cannot be undone.')) return;
    
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    if (bookings[index]) {
        bookings[index].status = 'used';
        localStorage.setItem('bookings', JSON.stringify(bookings));
        if (document.getElementById('bookings-list')) window.location.reload();
        else alert('Ticket marked as used!');
    }
}

function printTicket(index) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings[index];
    if (!booking) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head><title>Ticket - ${booking.id}</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .ticket { border: 2px solid #333; padding: 20px; max-width: 500px; margin: 0 auto; }
                    h1 { color: #078930; text-align: center; }
                    .info { margin: 10px 0; }
                    .qr { text-align: center; margin: 20px 0; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h1>Addis Metro</h1>
                    <h2>Bus Ticket</h2>
                    <div class="info"><strong>Booking ID:</strong> ${booking.id}</div>
                    <div class="info"><strong>Route:</strong> ${booking.from} → ${booking.to}</div>
                    <div class="info"><strong>Date:</strong> ${booking.date}</div>
                    <div class="info"><strong>Time:</strong> ${booking.time}</div>
                    <div class="info"><strong>Seats:</strong> ${booking.seats.join(', ')}</div>
                    <div class="info"><strong>Passengers:</strong> ${booking.passengers}</div>
                    <div class="qr">
                        <div class="qr-placeholder">
                            QR Code<br>${booking.id}
                        </div>
                    </div>
                    <p class="ticket-footer">Present this ticket when boarding</p>
                </div>
                <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1000)}</script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function bookFromMap(from, to) { bookRoute(from, to); }
function showRouteOnMap(stopsString) {
    const route = Object.entries(routes).find(([id, r]) => r.stops.join(',') === stopsString);
    if (route) showRoute(route[0]);
    else alert(`Route: ${stopsString}\n\nThis would highlight the route on the map.`);
}
