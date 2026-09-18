import { TODAY } from '../lib/constants'
import { addDays } from '../lib/format'

const STANDARD_AMENITIES = ['Wi-Fi', 'TV', 'Air conditioning', 'Safe']

export const users = [
  {
    id: 'u1',
    name: 'Elena Voss',
    email: 'super@stayhub.com',
    password: 'admin123',
    role: 'Super Admin',
    hotelId: null,
    phone: '+1 415 555 0142',
    title: 'Group Operations Director',
  },
  {
    id: 'u2',
    name: 'Daniel Kariuki',
    email: 'manager@stayhub.com',
    password: 'manager123',
    role: 'Hotel Manager',
    hotelId: 'h1',
    phone: '+254 722 441 890',
    title: 'General Manager, Grand Palace',
  },
  {
    id: 'u3',
    name: 'Sofia Mendes',
    email: 'reception@stayhub.com',
    password: 'desk123',
    role: 'Receptionist',
    hotelId: 'h1',
    phone: '+254 711 220 441',
    title: 'Front Office Supervisor',
  },
  {
    id: 'u4',
    name: 'James Okonkwo',
    email: 'accounts@stayhub.com',
    password: 'accounts123',
    role: 'Accountant',
    hotelId: null,
    phone: '+254 700 118 332',
    title: 'Group Controller',
  },
  {
    id: 'u5',
    name: 'Amina Yusuf',
    email: 'housekeeping@stayhub.com',
    password: 'clean123',
    role: 'Housekeeping',
    hotelId: 'h1',
    phone: '+254 733 905 217',
    title: 'Housekeeping Lead',
  },
  {
    id: 'u6',
    name: 'Owen Blake',
    email: 'maintenance@stayhub.com',
    password: 'fix123',
    role: 'Maintenance',
    hotelId: 'h2',
    phone: '+254 712 884 109',
    title: 'Chief Engineer',
  },
]

export const hotels = [
  {
    id: 'h1',
    name: 'Grand Palace Hotel',
    city: 'Mogadishu',
    country: 'Somalia',
    address: '12 Maka Al Mukarama Road',
    stars: 5,
    phone: '+252 61 445 1900',
    email: 'grandpalace@stayhub.com',
    manager: 'Daniel Kariuki',
    status: 'active',
    rooms: 48,
    accent: 'from-amber-700/80 to-navy-900',
  },
  {
    id: 'h2',
    name: 'Ocean View Resort',
    city: 'Kismayo',
    country: 'Somalia',
    address: '88 Liido Beach Road',
    stars: 4,
    phone: '+252 61 222 6700',
    email: 'oceanview@stayhub.com',
    manager: 'Priya Shah',
    status: 'active',
    rooms: 36,
    accent: 'from-sky-700/80 to-navy-900',
  },
  {
    id: 'h3',
    name: 'City Heights Inn',
    city: 'Hargeisa',
    country: 'Somalia',
    address: '4 Independence Avenue',
    stars: 3,
    phone: '+252 63 202 3311',
    email: 'cityheights@stayhub.com',
    manager: 'Michael Otieno',
    status: 'active',
    rooms: 24,
    accent: 'from-emerald-700/80 to-navy-900',
  },
]

const roomTypeSets = {
  h1: [
    { name: 'Deluxe King', rate: 220, capacity: 2, amenities: [...STANDARD_AMENITIES, 'City view', 'Rain shower'] },
    { name: 'Executive Twin', rate: 245, capacity: 2, amenities: [...STANDARD_AMENITIES, 'Work desk', 'Nespresso'] },
    { name: 'Junior Suite', rate: 380, capacity: 3, amenities: [...STANDARD_AMENITIES, 'Lounge', 'Bathtub'] },
    { name: 'Presidential Suite', rate: 890, capacity: 4, amenities: [...STANDARD_AMENITIES, 'Butler', 'Private dining'] },
  ],
  h2: [
    { name: 'Garden Room', rate: 160, capacity: 2, amenities: [...STANDARD_AMENITIES, 'Garden view'] },
    { name: 'Ocean Deluxe', rate: 240, capacity: 2, amenities: [...STANDARD_AMENITIES, 'Sea view', 'Balcony'] },
    { name: 'Family Suite', rate: 320, capacity: 4, amenities: [...STANDARD_AMENITIES, 'Two bedrooms', 'Kitchenette'] },
  ],
  h3: [
    { name: 'Classic Queen', rate: 95, capacity: 2, amenities: STANDARD_AMENITIES },
    { name: 'Business King', rate: 130, capacity: 2, amenities: [...STANDARD_AMENITIES, 'Work desk'] },
    { name: 'Executive Suite', rate: 185, capacity: 3, amenities: [...STANDARD_AMENITIES, 'Lounge'] },
  ],
}

function buildRooms() {
  const configs = [
    { hotelId: 'h1', floors: 4, perFloor: 12 },
    { hotelId: 'h2', floors: 3, perFloor: 12 },
    { hotelId: 'h3', floors: 3, perFloor: 8 },
  ]
  const rooms = []
  let n = 1
  for (const cfg of configs) {
    const types = roomTypeSets[cfg.hotelId]
    for (let floor = 1; floor <= cfg.floors; floor += 1) {
      for (let i = 1; i <= cfg.perFloor; i += 1) {
        const type = types[(i - 1) % types.length]
        rooms.push({
          id: `r${n}`,
          hotelId: cfg.hotelId,
          number: `${floor}${String(i).padStart(2, '0')}`,
          floor,
          type: type.name,
          rate: type.rate,
          capacity: type.capacity,
          amenities: type.amenities,
          status: 'available',
          notes: '',
        })
        n += 1
      }
    }
  }
  return rooms
}

export const rooms = buildRooms()

export const guests = [
  { id: 'g1', firstName: 'Amara', lastName: 'Okello', email: 'amara.okello@email.com', phone: '+254 700 111 221', nationality: 'Somalia', vip: true, idType: 'Passport', idNumber: 'A0042219', notes: 'Prefers high floor, extra pillows.' },
  { id: 'g2', firstName: 'Liam', lastName: 'Hart', email: 'liam.hart@email.com', phone: '+44 7700 900123', nationality: 'United Kingdom', vip: false, idType: 'Passport', idNumber: 'UK883910', notes: '' },
  { id: 'g3', firstName: 'Nia', lastName: 'Mwangi', email: 'nia.mwangi@email.com', phone: '+254 722 334 556', nationality: 'Somalia', vip: true, idType: 'National ID', idNumber: '28411903', notes: 'Company account — Atlas Logistics.' },
  { id: 'g4', firstName: 'Chen', lastName: 'Wei', email: 'chen.wei@email.com', phone: '+86 138 0013 8890', nationality: 'China', vip: false, idType: 'Passport', idNumber: 'E9982110', notes: '' },
  { id: 'g5', firstName: 'Sofia', lastName: 'Rossi', email: 'sofia.rossi@email.com', phone: '+39 347 112 8890', nationality: 'Italy', vip: false, idType: 'Passport', idNumber: 'YA221098', notes: 'Late arrival expected.' },
  { id: 'g6', firstName: 'David', lastName: 'Njoroge', email: 'david.njoroge@email.com', phone: '+254 711 667 890', nationality: 'Somalia', vip: false, idType: 'National ID', idNumber: '30122811', notes: '' },
  { id: 'g7', firstName: 'Priya', lastName: 'Mehta', email: 'priya.mehta@email.com', phone: '+91 98200 44112', nationality: 'India', vip: true, idType: 'Passport', idNumber: 'N2298711', notes: 'Anniversary stay.' },
  { id: 'g8', firstName: 'Jonas', lastName: 'Berg', email: 'jonas.berg@email.com', phone: '+46 70 123 8899', nationality: 'Sweden', vip: false, idType: 'Passport', idNumber: 'SE441290', notes: '' },
  { id: 'g9', firstName: 'Faith', lastName: 'Achieng', email: 'faith.achieng@email.com', phone: '+254 733 210 443', nationality: 'Somalia', vip: false, idType: 'National ID', idNumber: '27661002', notes: '' },
  { id: 'g10', firstName: 'Marcus', lastName: 'Reed', email: 'marcus.reed@email.com', phone: '+1 646 555 0198', nationality: 'United States', vip: true, idType: 'Passport', idNumber: 'US5521908', notes: 'Allergic to feathers.' },
  { id: 'g11', firstName: 'Hana', lastName: 'Abebe', email: 'hana.abebe@email.com', phone: '+251 911 334 221', nationality: 'Ethiopia', vip: false, idType: 'Passport', idNumber: 'EP330191', notes: '' },
  { id: 'g12', firstName: 'Oliver', lastName: 'Grant', email: 'oliver.grant@email.com', phone: '+61 412 889 001', nationality: 'Australia', vip: false, idType: 'Passport', idNumber: 'PA889120', notes: '' },
  { id: 'g13', firstName: 'Zuri', lastName: 'Kamau', email: 'zuri.kamau@email.com', phone: '+254 700 998 114', nationality: 'Somalia', vip: false, idType: 'National ID', idNumber: '31990021', notes: '' },
  { id: 'g14', firstName: 'Elena', lastName: 'Popov', email: 'elena.popov@email.com', phone: '+7 916 221 0098', nationality: 'Russia', vip: false, idType: 'Passport', idNumber: 'RU771209', notes: '' },
  { id: 'g15', firstName: 'Kwame', lastName: 'Mensah', email: 'kwame.mensah@email.com', phone: '+233 24 889 1102', nationality: 'Ghana', vip: false, idType: 'Passport', idNumber: 'G8892210', notes: '' },
  { id: 'g16', firstName: 'Maya', lastName: 'Santos', email: 'maya.santos@email.com', phone: '+55 11 98812 4410', nationality: 'Brazil', vip: true, idType: 'Passport', idNumber: 'BR229810', notes: 'Celebrating a product launch.' },
]

function roomByNumber(hotelId, number) {
  return rooms.find((room) => room.hotelId === hotelId && room.number === number)
}

function reservation({ id, hotelId, guestId, roomNumber, checkIn, checkOut, status, source, paid, extras = 0, adults = 1, children = 0, notes = '' }) {
  const room = roomByNumber(hotelId, roomNumber)
  const nights = Math.max(1, (new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000)
  const total = room.rate * nights + extras
  return {
    id,
    hotelId,
    guestId,
    roomId: room.id,
    checkIn,
    checkOut,
    status,
    source,
    adults,
    children,
    nights,
    rate: room.rate,
    extras,
    total,
    paid,
    notes,
    createdAt: addDays(checkIn, -6),
  }
}

export const reservations = [
  reservation({ id: 'rs1', hotelId: 'h1', guestId: 'g1', roomNumber: '201', checkIn: addDays(TODAY, -2), checkOut: addDays(TODAY, 2), status: 'checked_in', source: 'Direct', paid: 880, adults: 2 }),
  reservation({ id: 'rs2', hotelId: 'h1', guestId: 'g2', roomNumber: '204', checkIn: addDays(TODAY, -1), checkOut: TODAY, status: 'checked_in', source: 'Booking.com', paid: 220, extras: 40 }),
  reservation({ id: 'rs3', hotelId: 'h1', guestId: 'g3', roomNumber: '305', checkIn: TODAY, checkOut: addDays(TODAY, 3), status: 'confirmed', source: 'Corporate', paid: 0, adults: 1, notes: 'Airport pickup requested.' }),
  reservation({ id: 'rs4', hotelId: 'h1', guestId: 'g7', roomNumber: '408', checkIn: TODAY, checkOut: addDays(TODAY, 4), status: 'confirmed', source: 'Direct', paid: 1520, adults: 2, notes: 'Anniversary — rose petals.' }),
  reservation({ id: 'rs5', hotelId: 'h1', guestId: 'g10', roomNumber: '102', checkIn: addDays(TODAY, -4), checkOut: addDays(TODAY, 1), status: 'checked_in', source: 'Expedia', paid: 1100, adults: 2 }),
  reservation({ id: 'rs6', hotelId: 'h1', guestId: 'g5', roomNumber: '110', checkIn: addDays(TODAY, 1), checkOut: addDays(TODAY, 4), status: 'confirmed', source: 'Website', paid: 245, adults: 1 }),
  reservation({ id: 'rs7', hotelId: 'h1', guestId: 'g6', roomNumber: '301', checkIn: addDays(TODAY, -8), checkOut: addDays(TODAY, -5), status: 'checked_out', source: 'Walk-in', paid: 660 }),
  reservation({ id: 'rs8', hotelId: 'h1', guestId: 'g12', roomNumber: '212', checkIn: addDays(TODAY, -3), checkOut: addDays(TODAY, -1), status: 'checked_out', source: 'Booking.com', paid: 440 }),
  reservation({ id: 'rs9', hotelId: 'h1', guestId: 'g14', roomNumber: '406', checkIn: addDays(TODAY, 3), checkOut: addDays(TODAY, 6), status: 'cancelled', source: 'Website', paid: 0 }),
  reservation({ id: 'rs10', hotelId: 'h2', guestId: 'g4', roomNumber: '205', checkIn: addDays(TODAY, -1), checkOut: addDays(TODAY, 3), status: 'checked_in', source: 'Direct', paid: 480, adults: 2 }),
  reservation({ id: 'rs11', hotelId: 'h2', guestId: 'g8', roomNumber: '108', checkIn: TODAY, checkOut: addDays(TODAY, 5), status: 'confirmed', source: 'Booking.com', paid: 800, adults: 2 }),
  reservation({ id: 'rs12', hotelId: 'h2', guestId: 'g11', roomNumber: '312', checkIn: addDays(TODAY, -2), checkOut: TODAY, status: 'checked_in', source: 'Walk-in', paid: 160 }),
  reservation({ id: 'rs13', hotelId: 'h2', guestId: 'g16', roomNumber: '211', checkIn: addDays(TODAY, 2), checkOut: addDays(TODAY, 6), status: 'confirmed', source: 'Corporate', paid: 0, adults: 2, children: 1 }),
  reservation({ id: 'rs14', hotelId: 'h2', guestId: 'g15', roomNumber: '103', checkIn: addDays(TODAY, -10), checkOut: addDays(TODAY, -7), status: 'checked_out', source: 'Expedia', paid: 480 }),
  reservation({ id: 'rs15', hotelId: 'h3', guestId: 'g9', roomNumber: '201', checkIn: addDays(TODAY, -1), checkOut: addDays(TODAY, 2), status: 'checked_in', source: 'Direct', paid: 190 }),
  reservation({ id: 'rs16', hotelId: 'h3', guestId: 'g13', roomNumber: '104', checkIn: TODAY, checkOut: addDays(TODAY, 1), status: 'confirmed', source: 'Walk-in', paid: 0 }),
  reservation({ id: 'rs17', hotelId: 'h3', guestId: 'g6', roomNumber: '306', checkIn: addDays(TODAY, 4), checkOut: addDays(TODAY, 7), status: 'confirmed', source: 'Website', paid: 390, adults: 2 }),
  reservation({ id: 'rs18', hotelId: 'h1', guestId: 'g8', roomNumber: '107', checkIn: addDays(TODAY, -6), checkOut: addDays(TODAY, -5), status: 'no_show', source: 'Booking.com', paid: 0 }),
  reservation({ id: 'rs19', hotelId: 'h1', guestId: 'g11', roomNumber: '403', checkIn: addDays(TODAY, -3), checkOut: addDays(TODAY, 2), status: 'checked_in', source: 'Direct', paid: 760, adults: 2 }),
  reservation({ id: 'rs20', hotelId: 'h2', guestId: 'g2', roomNumber: '301', checkIn: addDays(TODAY, 5), checkOut: addDays(TODAY, 8), status: 'confirmed', source: 'Website', paid: 480 }),
]

const occupiedByReservation = {
  rs1: 'occupied',
  rs2: 'occupied',
  rs5: 'occupied',
  rs10: 'occupied',
  rs12: 'occupied',
  rs15: 'occupied',
  rs19: 'occupied',
}

const reservedUpcoming = ['rs3', 'rs4', 'rs6', 'rs11', 'rs13', 'rs16', 'rs17', 'rs20']

reservations.forEach((item) => {
  const room = rooms.find((r) => r.id === item.roomId)
  if (!room) return
  if (occupiedByReservation[item.id]) {
    room.status = occupiedByReservation[item.id] === 'dirty' ? 'dirty' : 'occupied'
  } else if (reservedUpcoming.includes(item.id) && (item.checkIn === TODAY || item.checkIn === addDays(TODAY, 1))) {
    if (room.status === 'available') room.status = 'reserved'
  }
})

rooms.find((r) => r.id === 'r8').status = 'out_of_order'
rooms.find((r) => r.id === 'r8').notes = 'AC compressor replacement'
rooms.find((r) => r.id === 'r55').status = 'out_of_order'
rooms.find((r) => r.id === 'r55').notes = 'Water leak — bathroom'
rooms.find((r) => r.id === 'r22').status = 'cleaning'
rooms.find((r) => r.id === 'r40').status = 'cleaning'
rooms.find((r) => r.id === 'r18').status = 'dirty'
rooms.find((r) => r.id === 'r70').status = 'dirty'
rooms.find((r) => r.id === 'r91').status = 'cleaning'

function fillOccupancy(hotelId, target) {
  const hotelRooms = rooms.filter((room) => room.hotelId === hotelId && room.status !== 'out_of_order')
  const needed = Math.round(hotelRooms.length * target) - hotelRooms.filter((room) => room.status === 'occupied').length
  hotelRooms
    .filter((room) => room.status === 'available')
    .slice(0, Math.max(0, needed))
    .forEach((room) => {
      room.status = 'occupied'
    })
}

fillOccupancy('h1', 0.78)
fillOccupancy('h2', 0.72)
fillOccupancy('h3', 0.66)

export const staff = [
  { id: 's1', name: 'Daniel Kariuki', email: 'daniel.k@stayhub.com', role: 'Hotel Manager', hotelId: 'h1', department: 'Management', shift: 'Day', phone: '+254 722 441 890', status: 'active' },
  { id: 's2', name: 'Sofia Mendes', email: 'sofia.m@stayhub.com', role: 'Receptionist', hotelId: 'h1', department: 'Front Office', shift: 'Morning', phone: '+254 711 220 441', status: 'active' },
  { id: 's3', name: 'Peter Langat', email: 'peter.l@stayhub.com', role: 'Receptionist', hotelId: 'h1', department: 'Front Office', shift: 'Evening', phone: '+254 700 221 118', status: 'active' },
  { id: 's4', name: 'Amina Yusuf', email: 'amina.y@stayhub.com', role: 'Housekeeping', hotelId: 'h1', department: 'Housekeeping', shift: 'Morning', phone: '+254 733 905 217', status: 'active' },
  { id: 's5', name: 'Grace Wanjiku', email: 'grace.w@stayhub.com', role: 'Housekeeping', hotelId: 'h1', department: 'Housekeeping', shift: 'Morning', phone: '+254 712 441 009', status: 'active' },
  { id: 's6', name: 'Brian Otieno', email: 'brian.o@stayhub.com', role: 'Maintenance', hotelId: 'h1', department: 'Engineering', shift: 'Day', phone: '+254 722 100 887', status: 'active' },
  { id: 's7', name: 'Priya Shah', email: 'priya.s@stayhub.com', role: 'Hotel Manager', hotelId: 'h2', department: 'Management', shift: 'Day', phone: '+254 722 990 114', status: 'active' },
  { id: 's8', name: 'Hassan Ali', email: 'hassan.a@stayhub.com', role: 'Receptionist', hotelId: 'h2', department: 'Front Office', shift: 'Morning', phone: '+254 700 441 228', status: 'active' },
  { id: 's9', name: 'Owen Blake', email: 'owen.b@stayhub.com', role: 'Maintenance', hotelId: 'h2', department: 'Engineering', shift: 'Day', phone: '+254 712 884 109', status: 'active' },
  { id: 's10', name: 'Lydia Chebet', email: 'lydia.c@stayhub.com', role: 'Housekeeping', hotelId: 'h2', department: 'Housekeeping', shift: 'Morning', phone: '+254 733 221 009', status: 'on_leave' },
  { id: 's11', name: 'Michael Otieno', email: 'michael.o@stayhub.com', role: 'Hotel Manager', hotelId: 'h3', department: 'Management', shift: 'Day', phone: '+254 721 334 009', status: 'active' },
  { id: 's12', name: 'Mercy Atieno', email: 'mercy.a@stayhub.com', role: 'Receptionist', hotelId: 'h3', department: 'Front Office', shift: 'Morning', phone: '+254 700 889 221', status: 'active' },
  { id: 's13', name: 'James Okonkwo', email: 'james.o@stayhub.com', role: 'Accountant', hotelId: 'h1', department: 'Finance', shift: 'Day', phone: '+254 700 118 332', status: 'active' },
]

export const housekeepingTasks = [
  { id: 'hk1', hotelId: 'h1', roomId: roomByNumber('h1', '204').id, type: 'checkout_clean', assigneeId: 's4', status: 'in_progress', priority: 'high', notes: 'Departure today — turn for arrival', due: TODAY },
  { id: 'hk2', hotelId: 'h1', roomId: roomByNumber('h1', '210').id, type: 'cleaning', assigneeId: 's5', status: 'pending', priority: 'medium', notes: 'Stayover service', due: TODAY },
  { id: 'hk3', hotelId: 'h1', roomId: roomByNumber('h1', '108').id, type: 'maintenance', assigneeId: 's6', status: 'pending', priority: 'high', notes: 'AC compressor replacement', due: TODAY },
  { id: 'hk4', hotelId: 'h1', roomId: roomByNumber('h1', '310').id, type: 'cleaning', assigneeId: 's4', status: 'pending', priority: 'medium', notes: '', due: TODAY },
  { id: 'hk5', hotelId: 'h2', roomId: roomByNumber('h2', '312').id, type: 'checkout_clean', assigneeId: 's10', status: 'pending', priority: 'high', notes: 'Departure today', due: TODAY },
  { id: 'hk6', hotelId: 'h2', roomId: roomByNumber('h2', '109').id, type: 'maintenance', assigneeId: 's9', status: 'in_progress', priority: 'high', notes: 'Water leak — bathroom', due: TODAY },
  { id: 'hk7', hotelId: 'h3', roomId: 'r91', type: 'cleaning', assigneeId: 's12', status: 'in_progress', priority: 'medium', notes: '', due: TODAY },
  { id: 'hk8', hotelId: 'h1', roomId: roomByNumber('h1', '201').id, type: 'turndown', assigneeId: 's5', status: 'pending', priority: 'low', notes: 'VIP guest', due: TODAY },
]

export const payments = [
  { id: 'p1', hotelId: 'h1', reservationId: 'rs1', guestId: 'g1', amount: 880, method: 'Card', status: 'paid', type: 'payment', date: addDays(TODAY, -2), reference: 'CH-88421' },
  { id: 'p2', hotelId: 'h1', reservationId: 'rs2', guestId: 'g2', amount: 220, method: 'Card', status: 'partial', type: 'payment', date: addDays(TODAY, -1), reference: 'CH-88490' },
  { id: 'p3', hotelId: 'h1', reservationId: 'rs4', guestId: 'g7', amount: 1520, method: 'Bank transfer', status: 'paid', type: 'payment', date: addDays(TODAY, -4), reference: 'BT-2291' },
  { id: 'p4', hotelId: 'h1', reservationId: 'rs5', guestId: 'g10', amount: 1100, method: 'Card', status: 'paid', type: 'payment', date: addDays(TODAY, -4), reference: 'CH-88110' },
  { id: 'p5', hotelId: 'h1', reservationId: 'rs3', guestId: 'g3', amount: 735, method: 'Corporate', status: 'pending', type: 'charge', date: TODAY, reference: 'INV-4412' },
  { id: 'p6', hotelId: 'h2', reservationId: 'rs10', guestId: 'g4', amount: 480, method: 'Mobile money', status: 'partial', type: 'payment', date: addDays(TODAY, -1), reference: 'MM-99012' },
  { id: 'p7', hotelId: 'h2', reservationId: 'rs11', guestId: 'g8', amount: 800, method: 'Card', status: 'paid', type: 'payment', date: addDays(TODAY, -3), reference: 'CH-77219' },
  { id: 'p8', hotelId: 'h2', reservationId: 'rs12', guestId: 'g11', amount: 160, method: 'Cash', status: 'partial', type: 'payment', date: addDays(TODAY, -2), reference: 'CASH-118' },
  { id: 'p9', hotelId: 'h3', reservationId: 'rs15', guestId: 'g9', amount: 190, method: 'Mobile money', status: 'paid', type: 'payment', date: addDays(TODAY, -1), reference: 'MM-44190' },
  { id: 'p10', hotelId: 'h3', reservationId: 'rs16', guestId: 'g13', amount: 95, method: 'Cash', status: 'pending', type: 'charge', date: TODAY, reference: 'INV-4501' },
  { id: 'p11', hotelId: 'h1', reservationId: 'rs7', guestId: 'g6', amount: 660, method: 'Card', status: 'paid', type: 'payment', date: addDays(TODAY, -5), reference: 'CH-87002' },
  { id: 'p12', hotelId: 'h2', reservationId: 'rs13', guestId: 'g16', amount: 1280, method: 'Card', status: 'pending', type: 'charge', date: addDays(TODAY, 2), reference: 'INV-4608' },
]

export const notifications = [
  { id: 'n1', hotelId: 'h1', title: 'VIP arriving today', body: 'Priya Mehta checks in to Junior Suite 408. Anniversary setup requested.', time: '08:10', read: false, type: 'arrival' },
  { id: 'n2', hotelId: 'h1', title: 'Room 204 ready for turnover', body: 'Liam Hart departs today. Balance of $40 remains on the folio.', time: '07:42', read: false, type: 'housekeeping' },
  { id: 'n3', hotelId: 'h1', title: 'Maintenance: 108 out of order', body: 'AC compressor replacement is still open.', time: 'Yesterday', read: false, type: 'maintenance' },
  { id: 'n4', hotelId: 'h2', title: 'Departure with balance', body: 'Hana Abebe in 312 has an unpaid folio remainder.', time: '06:55', read: true, type: 'payment' },
  { id: 'n5', hotelId: 'h3', title: 'Walk-in expected', body: 'Zuri Kamau has a same-day confirmed stay in 104.', time: '09:18', read: false, type: 'arrival' },
  { id: 'n6', hotelId: 'all', title: 'Month-to-date revenue is up 8%', body: 'Group ADR improved versus last week. Review the reports board.', time: 'Yesterday', read: true, type: 'report' },
]

export const occupancyTrend = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((offset) => {
  const date = addDays(TODAY, offset - 13)
  return {
    date: date.slice(5),
    iso: date,
    'Grand Palace': Math.min(96, Math.max(54, 74 + Math.round(Math.sin(offset) * 10) + (offset % 4) * 2)),
    'Ocean View': Math.min(94, Math.max(50, 68 + Math.round(Math.cos(offset) * 12) + (offset % 3))),
    'City Heights': Math.min(90, Math.max(46, 61 + Math.round(Math.sin(offset + 2) * 9))),
  }
})

export const revenueTrend = occupancyTrend.map((row, offset) => ({
  date: row.date,
  'Grand Palace': 9800 + offset * 240 + (offset % 5) * 420,
  'Ocean View': 6200 + offset * 180 + (offset % 4) * 310,
  'City Heights': 3100 + offset * 90 + (offset % 3) * 160,
}))

export const organization = {
  name: 'StayHub Hospitality Group',
  legalName: 'StayHub Hospitality Ltd',
  timezone: 'Africa/Mogadishu',
  currency: 'USD',
  supportEmail: 'ops@stayhub.com',
}

export const roomTypes = Object.entries(roomTypeSets).flatMap(([hotelId, types]) =>
  types.map((type, index) => ({
    id: `${hotelId}-t${index + 1}`,
    hotelId,
    ...type,
  })),
)

export function seedData() {
  return {
    hotels: hotels.map((hotel) => ({ ...hotel })),
    rooms: rooms.map((room) => ({ ...room, amenities: [...room.amenities] })),
    guests: guests.map((guest) => ({ ...guest })),
    reservations: reservations.map((item) => ({ ...item })),
    staff: staff.map((member) => ({ ...member })),
    housekeepingTasks: housekeepingTasks.map((task) => ({ ...task })),
    payments: payments.map((payment) => ({ ...payment })),
    notifications: notifications.map((item) => ({ ...item })),
    roomTypes: roomTypes.map((type) => ({ ...type, amenities: [...type.amenities] })),
    organization: { ...organization },
  }
}
