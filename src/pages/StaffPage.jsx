import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { STAFF_ROLES } from '../lib/constants'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { initials } from '../lib/format'

export function StaffPage() {
  const staff = useScopedList(useDataStore((state) => state.staff))
  const hotels = useDataStore((state) => state.hotels)
  const addStaff = useDataStore((state) => state.addStaff)
  const updateStaff = useDataStore((state) => state.updateStaff)
  const { currentHotelId, isAllHotels, availableHotels } = useHotelScope()
  const pushToast = useUiStore((state) => state.pushToast)
  const [open, setOpen] = useState(false)
  const [department, setDepartment] = useState('all')
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'Receptionist',
      department: 'Front Office',
      shift: 'Morning',
      hotelId: currentHotelId === 'all' ? 'h1' : currentHotelId,
    },
  })

  const departments = [...new Set(staff.map((member) => member.department))]
  const rows = useMemo(
    () => staff.filter((member) => department === 'all' || member.department === department),
    [staff, department],
  )

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="People assigned to the current hotel scope, including managers, desk, housekeeping, and engineering."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add staff
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setDepartment('all')} className={`chip ${department === 'all' ? 'chip-active' : ''}`}>All</button>
        {departments.map((item) => (
          <button key={item} type="button" onClick={() => setDepartment(item)} className={`chip ${department === item ? 'chip-active' : ''}`}>
            {item}
          </button>
        ))}
      </div>
      <Card>
        <Table
          rows={rows}
          emptyTitle="No staff in this department"
          columns={[
            {
              key: 'name',
              label: 'Team member',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold">
                    {initials(row.name)}
                  </span>
                  <span>
                    <span className="block font-medium">{row.name}</span>
                    <span className="text-xs text-stone-500">{row.email}</span>
                  </span>
                </div>
              ),
            },
            { key: 'role', label: 'Role' },
            { key: 'department', label: 'Department' },
            { key: 'shift', label: 'Shift' },
            { key: 'hotel', label: 'Hotel', render: (row) => hotels.find((hotel) => hotel.id === row.hotelId)?.name },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <button type="button" onClick={() => updateStaff(row.id, { status: row.status === 'active' ? 'on_leave' : 'active' })}>
                  <Badge tone={row.status === 'active' ? 'emerald' : 'amber'}>{row.status.replace('_', ' ')}</Badge>
                </button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add staff member"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit((values) => {
                addStaff(values)
                pushToast('Staff member added')
                reset()
                setOpen(false)
              })}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" className="sm:col-span-2"><Input {...register('name', { required: true })} /></Field>
          <Field label="Email"><Input type="email" {...register('email')} /></Field>
          <Field label="Phone"><Input {...register('phone')} /></Field>
          <Field label="Role">
            <Select {...register('role')}>
              {STAFF_ROLES.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </Select>
          </Field>
          <Field label="Department">
            <Select {...register('department')}>
              {['Management', 'Front Office', 'Housekeeping', 'Engineering', 'Finance'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="Shift">
            <Select {...register('shift')}>
              {['Morning', 'Evening', 'Night', 'Day'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="Hotel">
            <Select {...register('hotelId')} disabled={!isAllHotels && availableHotels.length === 1}>
              {(isAllHotels ? hotels : availableHotels).map((hotel) => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
