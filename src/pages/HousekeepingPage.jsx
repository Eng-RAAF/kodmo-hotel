import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { RoomStatusBadge, Badge } from '../components/ui/Badge'
import { Field, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { HOUSEKEEPING_TYPES, ROOM_STATUSES } from '../lib/constants'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'

export function HousekeepingPage() {
  const rooms = useScopedList(useDataStore((state) => state.rooms))
  const tasks = useScopedList(useDataStore((state) => state.housekeepingTasks))
  const staff = useDataStore((state) => state.staff)
  const hotels = useDataStore((state) => state.hotels)
  const setRoomStatus = useDataStore((state) => state.setRoomStatus)
  const updateTask = useDataStore((state) => state.updateTask)
  const addTask = useDataStore((state) => state.addTask)
  const { isAllHotels, currentHotelId, availableHotels } = useHotelScope()
  const pushToast = useUiStore((state) => state.pushToast)
  const [floor, setFloor] = useState('all')
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({ hotelId: '', roomId: '', type: 'cleaning', notes: '', priority: 'medium' })

  const floors = useMemo(() => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b), [rooms])
  const visibleRooms = rooms.filter((room) => floor === 'all' || room.floor === Number(floor))
  const grouped = floors
    .filter((value) => floor === 'all' || value === Number(floor))
    .map((value) => ({
      floor: value,
      rooms: visibleRooms.filter((room) => room.floor === value),
    }))

  const openTasks = tasks.filter((task) => task.status !== 'done')

  return (
    <div>
      <PageHeader
        title="Housekeeping"
        subtitle="Room board and task queue. Status changes here are the same source of truth used by Rooms and Front Desk."
        actions={
          <Button onClick={() => {
            setTaskForm({
              hotelId: isAllHotels ? availableHotels[0]?.id || '' : currentHotelId,
              roomId: '',
              type: 'cleaning',
              notes: '',
              priority: 'medium',
            })
            setTaskOpen(true)
          }}>
            <Plus size={16} /> Add task
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {ROOM_STATUSES.map((item) => (
          <span key={item.id} className="chip">
            {item.label} · {rooms.filter((room) => room.status === item.id).length}
          </span>
        ))}
      </div>

      <div className="mb-4 max-w-xs">
        <Select value={floor} onChange={(event) => setFloor(event.target.value)}>
          <option value="all">All floors</option>
          {floors.map((value) => (
            <option key={value} value={value}>Floor {value}</option>
          ))}
        </Select>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {grouped.map((group) => (
            <Card key={group.floor} className="p-4">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-stone-500 uppercase">Floor {group.floor}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {group.rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      const order = ['dirty', 'cleaning', 'available', 'occupied', 'reserved', 'out_of_order']
                      const next = order[(order.indexOf(room.status) + 1) % order.length]
                      setRoomStatus(room.id, next)
                      pushToast(`Room ${room.number} → ${next.replaceAll('_', ' ')}`)
                    }}
                    className="rounded-2xl border border-stone-line bg-gradient-to-b from-white to-ivory-50 p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold-400/50"
                  >
                    <p className="text-sm font-semibold">{room.number}</p>
                    <RoomStatusBadge status={room.status} />
                    {isAllHotels ? (
                      <p className="mt-1 truncate text-[10px] text-stone-400">
                        {hotels.find((hotel) => hotel.id === room.hotelId)?.name}
                      </p>
                    ) : null}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader title="Task queue" subtitle={`${openTasks.length} open`} />
          <div className="divide-y divide-ivory-100">
            {openTasks.map((task) => {
              const room = useDataStore.getState().roomById(task.roomId)
              const assignee = staff.find((member) => member.id === task.assigneeId)
              return (
                <div key={task.id} className="space-y-2 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        Room {room?.number} · {task.type.replaceAll('_', ' ')}
                      </p>
                      <p className="text-xs text-stone-500">{task.notes || 'No notes'}</p>
                    </div>
                    <Badge tone={task.priority === 'high' ? 'rose' : task.priority === 'low' ? 'slate' : 'amber'}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      className="py-1.5 text-xs"
                      value={task.assigneeId || ''}
                      onChange={(event) => updateTask(task.id, { assigneeId: event.target.value || null })}
                    >
                      <option value="">Unassigned</option>
                      {staff
                        .filter((member) => member.hotelId === task.hotelId && ['Housekeeping', 'Maintenance'].includes(member.role))
                        .map((member) => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </Select>
                    <Button
                      size="sm"
                      variant={task.status === 'in_progress' ? 'gold' : 'outline'}
                      onClick={() => updateTask(task.id, { status: task.status === 'in_progress' ? 'pending' : 'in_progress' })}
                    >
                      {task.status === 'in_progress' ? 'In progress' : 'Start'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateTask(task.id, { status: 'done' })
                        if (room && (room.status === 'dirty' || room.status === 'cleaning')) {
                          setRoomStatus(room.id, 'available')
                        }
                        pushToast(`Room ${room?.number} completed`)
                      }}
                    >
                      Done
                    </Button>
                  </div>
                  {assignee ? <p className="text-[11px] text-stone-400">Assigned to {assignee.name}</p> : null}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
      <Modal
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        title="Add housekeeping task"
        footer={
          <>
            <Button variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  await addTask({
                    hotelId: taskForm.hotelId,
                    roomId: taskForm.roomId,
                    type: taskForm.type,
                    notes: taskForm.notes,
                    priority: taskForm.priority,
                  })
                  pushToast('Task added to the queue')
                  setTaskOpen(false)
                } catch (error) {
                  pushToast(error.message || 'Could not add task', 'info')
                }
              }}
            >
              Save task
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          {isAllHotels ? (
            <Field label="Hotel">
              <Select value={taskForm.hotelId} onChange={(event) => setTaskForm({ ...taskForm, hotelId: event.target.value, roomId: '' })}>
                {availableHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Room">
            <Select value={taskForm.roomId} onChange={(event) => setTaskForm({ ...taskForm, roomId: event.target.value })}>
              <option value="">Select room</option>
              {rooms.filter((room) => !taskForm.hotelId || room.hotelId === taskForm.hotelId).map((room) => (
                <option key={room.id} value={room.id}>{room.number} · {room.type}</option>
              ))}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={taskForm.type} onChange={(event) => setTaskForm({ ...taskForm, type: event.target.value })}>
              {HOUSEKEEPING_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea value={taskForm.notes} onChange={(event) => setTaskForm({ ...taskForm, notes: event.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
