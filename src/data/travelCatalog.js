export const AIRPORTS = [
  { code: 'MGQ', city: 'Mogadishu', name: 'Aden Adde International' },
  { code: 'HGA', city: 'Hargeisa', name: 'Egal International' },
  { code: 'GGR', city: 'Garowe', name: 'Garowe Airport' },
  { code: 'KMU', city: 'Kismayo', name: 'Kismayo Airport' },
  { code: 'BSA', city: 'Bosaso', name: 'Bender Qassim International' },
]

export const FLIGHTS = [
  { id: 'fl1', airline: 'Jubba Airways', from: 'MGQ', to: 'HGA', depart: '07:15', arrive: '08:25', duration: '1h 10m', stops: 'Direct', price: 118, cabin: 'Economy' },
  { id: 'fl2', airline: 'Daallo Airlines', from: 'MGQ', to: 'HGA', depart: '14:40', arrive: '15:55', duration: '1h 15m', stops: 'Direct', price: 96, cabin: 'Economy' },
  { id: 'fl3', airline: 'African Express', from: 'HGA', to: 'MGQ', depart: '09:00', arrive: '10:10', duration: '1h 10m', stops: 'Direct', price: 112, cabin: 'Economy' },
  { id: 'fl4', airline: 'Jubba Airways', from: 'MGQ', to: 'KMU', depart: '11:20', arrive: '12:15', duration: '55m', stops: 'Direct', price: 84, cabin: 'Economy' },
  { id: 'fl5', airline: 'Daallo Airlines', from: 'MGQ', to: 'GGR', depart: '08:05', arrive: '09:20', duration: '1h 15m', stops: 'Direct', price: 102, cabin: 'Economy' },
  { id: 'fl6', airline: 'Jubba Airways', from: 'MGQ', to: 'BSA', depart: '16:10', arrive: '17:40', duration: '1h 30m', stops: 'Direct', price: 129, cabin: 'Economy' },
  { id: 'fl7', airline: 'Daallo Airlines', from: 'HGA', to: 'BSA', depart: '12:30', arrive: '13:35', duration: '1h 05m', stops: 'Direct', price: 91, cabin: 'Economy' },
  { id: 'fl8', airline: 'African Express', from: 'GGR', to: 'MGQ', depart: '15:45', arrive: '17:00', duration: '1h 15m', stops: 'Direct', price: 108, cabin: 'Economy' },
  { id: 'fl9', airline: 'Jubba Airways', from: 'KMU', to: 'MGQ', depart: '13:50', arrive: '14:45', duration: '55m', stops: 'Direct', price: 79, cabin: 'Economy' },
  { id: 'fl10', airline: 'Daallo Airlines', from: 'BSA', to: 'MGQ', depart: '06:40', arrive: '08:15', duration: '1h 35m', stops: 'Direct', price: 134, cabin: 'Business' },
]

export const CARS = [
  { id: 'cr1', name: 'Toyota Corolla', city: 'Mogadishu', type: 'Economy', seats: 5, transmission: 'Automatic', price: 38, supplier: 'StayHub Drive' },
  { id: 'cr2', name: 'Toyota Land Cruiser', city: 'Mogadishu', type: '4x4', seats: 7, transmission: 'Automatic', price: 92, supplier: 'Horn Africa Cars' },
  { id: 'cr3', name: 'Hyundai Tucson', city: 'Hargeisa', type: 'SUV', seats: 5, transmission: 'Automatic', price: 61, supplier: 'StayHub Drive' },
  { id: 'cr4', name: 'Kia Picanto', city: 'Hargeisa', type: 'Economy', seats: 4, transmission: 'Manual', price: 29, supplier: 'City Wheels' },
  { id: 'cr5', name: 'Toyota Hilux', city: 'Garowe', type: 'Pickup', seats: 5, transmission: 'Manual', price: 74, supplier: 'Horn Africa Cars' },
  { id: 'cr6', name: 'Nissan Patrol', city: 'Kismayo', type: '4x4', seats: 7, transmission: 'Automatic', price: 88, supplier: 'StayHub Drive' },
  { id: 'cr7', name: 'Suzuki Swift', city: 'Bosaso', type: 'Economy', seats: 4, transmission: 'Automatic', price: 32, supplier: 'City Wheels' },
  { id: 'cr8', name: 'Toyota Hiace', city: 'Mogadishu', type: 'Van', seats: 12, transmission: 'Manual', price: 81, supplier: 'Horn Africa Cars' },
]

export const ATTRACTIONS = [
  { id: 'at1', name: 'Liido Beach', city: 'Mogadishu', duration: '3 hours', price: 18, rating: 8.6, reviews: 1240, summary: 'Guided beach afternoon with swimming time and local seafood stop.' },
  { id: 'at2', name: 'Mogadishu old harbour walk', city: 'Mogadishu', duration: '2 hours', price: 12, rating: 8.1, reviews: 640, summary: 'Waterfront walk with a local guide covering the restored harbour area.' },
  { id: 'at3', name: 'Laas Geel rock art', city: 'Hargeisa', duration: '6 hours', price: 55, rating: 9.2, reviews: 890, summary: 'Day trip to the famous cave paintings with transport and a guide.' },
  { id: 'at4', name: 'Hargeisa livestock market', city: 'Hargeisa', duration: '2 hours', price: 10, rating: 7.8, reviews: 310, summary: 'Morning market visit with a cultural briefing and tea stop.' },
  { id: 'at5', name: 'Garowe city highlights', city: 'Garowe', duration: '3 hours', price: 16, rating: 7.9, reviews: 180, summary: 'City orientation covering civic buildings, markets, and cafes.' },
  { id: 'at6', name: 'Kismayo coastline drive', city: 'Kismayo', duration: '4 hours', price: 28, rating: 8.4, reviews: 220, summary: 'Coastal viewpoints and a beach stop with a private driver.' },
  { id: 'at7', name: 'Bosaso port lookout', city: 'Bosaso', duration: '2 hours', price: 14, rating: 8.0, reviews: 150, summary: 'Port and city viewpoint tour with a local driver-guide.' },
]

export const TAXIS = [
  { id: 'tx1', name: 'Private sedan', from: 'MGQ', to: 'Maka Al Mukarama Road', minutes: 25, people: 3, price: 18, type: 'Private' },
  { id: 'tx2', name: 'Shared shuttle', from: 'MGQ', to: 'Liido Beach hotels', minutes: 40, people: 8, price: 8, type: 'Shared' },
  { id: 'tx3', name: 'VIP SUV', from: 'MGQ', to: 'Airport Road / Wadajir', minutes: 20, people: 4, price: 32, type: 'Private' },
  { id: 'tx4', name: 'Private sedan', from: 'HGA', to: 'Hargeisa city centre', minutes: 20, people: 3, price: 14, type: 'Private' },
  { id: 'tx5', name: 'Shared van', from: 'HGA', to: 'Hargeisa hotels', minutes: 30, people: 10, price: 6, type: 'Shared' },
  { id: 'tx6', name: 'Private sedan', from: 'GGR', to: 'Garowe hotels', minutes: 15, people: 3, price: 12, type: 'Private' },
  { id: 'tx7', name: 'Private sedan', from: 'KMU', to: 'Kismayo beach hotels', minutes: 22, people: 3, price: 16, type: 'Private' },
  { id: 'tx8', name: 'Private sedan', from: 'BSA', to: 'Bosaso city hotels', minutes: 18, people: 3, price: 15, type: 'Private' },
]

export function airportLabel(code) {
  const airport = AIRPORTS.find((item) => item.code === code)
  return airport ? `${airport.city} (${airport.code})` : code
}

export function matchesPlace(value, query) {
  if (!query) return true
  return String(value || '').toLowerCase().includes(query.toLowerCase())
}
