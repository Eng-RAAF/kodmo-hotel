import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, Input, Select } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useUiStore } from '../store/uiStore'
import { HOTEL_MANAGER_ADMIN, SUPER_ADMIN, isHotelManagerAdmin, isSuperAdmin } from '../lib/constants'
import { formatCurrency } from '../lib/format'
import { useHotelScope } from '../hooks/useHotelScope'

const TABS = ['Organization', 'Admins', 'Room types']

function emptyOrgForm() {
  return { name: '', legalName: '', timezone: 'Africa/Mogadishu', currency: 'USD', supportEmail: '' }
}

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const organization = useDataStore((state) => state.organization)
  const organizations = useDataStore((state) => state.organizations)
  const addOrganization = useDataStore((state) => state.addOrganization)
  const updateOrganization = useDataStore((state) => state.updateOrganization)
  const removeOrganization = useDataStore((state) => state.removeOrganization)
  const roomTypes = useDataStore((state) => state.roomTypes)
  const hotels = useDataStore((state) => state.hotels)
  const users = useDataStore((state) => state.users)
  const addUser = useDataStore((state) => state.addUser)
  const updateUser = useDataStore((state) => state.updateUser)
  const removeUser = useDataStore((state) => state.removeUser)
  const addRoomType = useDataStore((state) => state.addRoomType)
  const removeRoomType = useDataStore((state) => state.removeRoomType)
  const rooms = useDataStore((state) => state.rooms)
  const pushToast = useUiStore((state) => state.pushToast)
  const { availableHotels, currentHotelId, isAllHotels } = useHotelScope()
  const [tab, setTab] = useState(isSuperAdmin(user) ? 'Organization' : 'Admins')
  const [open, setOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [pendingType, setPendingType] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [orgOpen, setOrgOpen] = useState(false)
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgError, setOrgError] = useState('')
  const [orgEditing, setOrgEditing] = useState(null)
  const [orgForm, setOrgForm] = useState(emptyOrgForm())
  const [pendingOrg, setPendingOrg] = useState(null)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [pendingAdmin, setPendingAdmin] = useState(null)
  const [adminSaving, setAdminSaving] = useState(false)
  const [adminForm, setAdminForm] = useState({ role: HOTEL_MANAGER_ADMIN, hotelId: '' })
  const [typeForm, setTypeForm] = useState({
    hotelId: user?.hotelId || availableHotels[0]?.id || '',
    name: '',
    rate: '',
    capacity: '2',
  })
  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    reset: resetAdmin,
    watch: watchAdmin,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: isSuperAdmin(user) ? HOTEL_MANAGER_ADMIN : HOTEL_MANAGER_ADMIN,
      hotelId: user?.hotelId || availableHotels[0]?.id || 'h1',
    },
  })

  const canCreateAdmins = isSuperAdmin(user) || isHotelManagerAdmin(user)
  const superAdmin = isSuperAdmin(user)
  const tabs = superAdmin ? TABS : TABS.filter((item) => item !== 'Organization')
  const adminRole = watchAdmin('role')
  const orgRows = organizations.length ? organizations : organization?.name ? [organization] : []
  const pendingInUse = pendingType
    ? rooms.filter((room) => room.hotelId === pendingType.hotelId && room.type === pendingType.name).length
    : 0

  const confirmRemoveType = async () => {
    if (!pendingType) return
    setDeleting(true)
    try {
      await removeRoomType(pendingType.id)
      pushToast(`${pendingType.name} removed`)
      setPendingType(null)
    } catch (error) {
      pushToast(error.message || 'Could not delete room type', 'info')
    } finally {
      setDeleting(false)
    }
  }

  const openAddOrg = () => {
    setOrgEditing(null)
    setOrgForm(emptyOrgForm())
    setOrgError('')
    setOrgOpen(true)
  }

  const openEditOrg = (row) => {
    setOrgEditing(row)
    setOrgForm({
      name: row.name || '',
      legalName: row.legalName || '',
      timezone: row.timezone || 'Africa/Mogadishu',
      currency: row.currency || 'USD',
      supportEmail: row.supportEmail || '',
    })
    setOrgError('')
    setOrgOpen(true)
  }

  const saveOrganization = async () => {
    const name = String(orgForm.name || '').trim()
    if (!name) {
      setOrgError('Organization name is required.')
      return
    }
    setOrgSaving(true)
    setOrgError('')
    const payload = {
      name,
      legalName: String(orgForm.legalName || name).trim(),
      timezone: String(orgForm.timezone || 'Africa/Mogadishu').trim(),
      currency: String(orgForm.currency || 'USD').trim(),
      supportEmail: String(orgForm.supportEmail || '').trim(),
    }
    try {
      if (orgEditing?.id) {
        await updateOrganization(orgEditing.id, payload)
        pushToast(`${payload.name} updated`)
      } else {
        await addOrganization(payload)
        pushToast(`${payload.name} added`)
      }
      setOrgOpen(false)
      setOrgEditing(null)
    } catch (error) {
      setOrgError(error.message || 'Could not save organization')
      pushToast(error.message || 'Could not save organization', 'info')
    } finally {
      setOrgSaving(false)
    }
  }

  const confirmRemoveOrg = async () => {
    if (!pendingOrg?.id) return
    setDeleting(true)
    try {
      await removeOrganization(pendingOrg.id)
      pushToast(`${pendingOrg.name} removed`)
      setPendingOrg(null)
    } catch (error) {
      pushToast(error.message || 'Could not delete organization', 'info')
    } finally {
      setDeleting(false)
    }
  }

  const openEditAdmin = (row) => {
    setEditingAdmin(row)
    setAdminForm({
      role: row.role === SUPER_ADMIN ? SUPER_ADMIN : HOTEL_MANAGER_ADMIN,
      hotelId: row.hotelId || hotels[0]?.id || '',
    })
  }

  const saveAdminRole = async () => {
    if (!editingAdmin) return
    setAdminSaving(true)
    try {
      await updateUser(editingAdmin.id, {
        role: adminForm.role,
        hotelId: adminForm.role === SUPER_ADMIN ? null : adminForm.hotelId,
      })
      pushToast(`${editingAdmin.name} updated`)
      setEditingAdmin(null)
    } catch (error) {
      pushToast(error.message || 'Could not update admin role', 'info')
    } finally {
      setAdminSaving(false)
    }
  }

  const confirmRemoveAdmin = async () => {
    if (!pendingAdmin?.id) return
    setDeleting(true)
    try {
      await removeUser(pendingAdmin.id)
      pushToast(`${pendingAdmin.name} removed`)
      setPendingAdmin(null)
    } catch (error) {
      pushToast(error.message || 'Could not delete admin', 'info')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle={superAdmin ? 'Organization profile, login admins, and room-type catalog.' : 'Login admins and room-type catalog for your hotel.'}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`tab-pill ${tab === item ? 'tab-pill-active' : ''}`}
          >
            {item}
          </button>
        ))}
      </div>

      {superAdmin && tab === 'Organization' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={openAddOrg}>
              <Plus size={16} /> Add organization
            </Button>
          </div>
          <Card>
            <Table
              rows={orgRows}
              emptyTitle="No organizations yet"
              emptyBody="Add the hospitality group that owns these hotels."
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'legalName', label: 'Legal name' },
                { key: 'timezone', label: 'Timezone' },
                { key: 'currency', label: 'Currency' },
                { key: 'supportEmail', label: 'Ops email' },
                {
                  key: 'actions',
                  label: '',
                  render: (row) => (
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditOrg(row)}
                        aria-label={`Edit ${row.name}`}
                      >
                        <Pencil size={15} />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setPendingOrg(row)}
                        aria-label={`Delete ${row.name}`}
                      >
                        <Trash2 size={15} />
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      ) : null}

      {tab === 'Admins' ? (
        <div className="space-y-4">
          {canCreateAdmins ? (
            <div className="flex justify-end">
              <Button type="button" onClick={() => setOpen(true)}>
                <Plus size={16} /> {isSuperAdmin(user) ? 'Add hotel manager or admin' : 'Add admin'}
              </Button>
            </div>
          ) : null}
          <Card>
            <Table
              rows={users}
              emptyTitle="No admins in this scope"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (row) => <Badge tone="gold">{row.role}</Badge> },
                { key: 'hotel', label: 'Hotel', render: (row) => (row.hotelId ? hotels.find((hotel) => hotel.id === row.hotelId)?.name : 'All hotels') },
                ...(isSuperAdmin(user)
                  ? [{
                      key: 'actions',
                      label: '',
                      render: (row) => (
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="sm" onClick={() => openEditAdmin(row)}>
                            <Pencil size={15} /> Role
                          </Button>
                          {row.id !== user?.id ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => setPendingAdmin(row)}
                            >
                              <Trash2 size={15} />
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      ),
                    }]
                  : []),
              ]}
            />
          </Card>
        </div>
      ) : null}

      {tab === 'Room types' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              setTypeForm({
                hotelId: user?.hotelId || (currentHotelId === 'all' ? availableHotels[0]?.id || '' : currentHotelId),
                name: '',
                rate: '',
                capacity: '2',
              })
              setTypeOpen(true)
            }}>
              <Plus size={16} /> Add room type
            </Button>
          </div>
          <Card>
            <Table
              rows={roomTypes}
              emptyTitle="No room types yet"
              columns={[
                { key: 'name', label: 'Type' },
                { key: 'hotel', label: 'Hotel', render: (row) => hotels.find((hotel) => hotel.id === row.hotelId)?.name },
                { key: 'capacity', label: 'Capacity' },
                { key: 'rate', label: 'Rack rate', render: (row) => formatCurrency(row.rate) },
                {
                  key: 'actions',
                  label: '',
                  render: (row) => (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => setPendingType(row)}
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 size={15} />
                      Delete
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isSuperAdmin(user) ? 'Add hotel manager or admin' : 'Add admin'}
        subtitle={isHotelManagerAdmin(user) ? 'Creates another Hotel Manager Admin for this hotel.' : 'Create a Hotel Manager Admin for a hotel, or another Super Admin.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdminSubmit(async (values) => {
                try {
                  await addUser({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: isHotelManagerAdmin(user) ? HOTEL_MANAGER_ADMIN : values.role,
                    hotelId: isHotelManagerAdmin(user) ? user.hotelId : values.role === SUPER_ADMIN ? undefined : values.hotelId,
                  })
                  pushToast('Admin account created')
                  resetAdmin()
                  setOpen(false)
                } catch (error) {
                  pushToast(error.message || 'Could not create admin', 'info')
                }
              })}
            >
              Create admin
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Full name"><Input {...registerAdmin('name', { required: true })} /></Field>
          <Field label="Email"><Input type="email" {...registerAdmin('email', { required: true })} /></Field>
          <Field label="Password"><Input type="password" {...registerAdmin('password', { required: true, minLength: 6 })} /></Field>
          {isSuperAdmin(user) ? (
            <Field label="Role">
              <Select {...registerAdmin('role')}>
                <option value={HOTEL_MANAGER_ADMIN}>Hotel Manager Admin</option>
                <option value={SUPER_ADMIN}>Super Admin</option>
              </Select>
            </Field>
          ) : (
            <p className="text-sm text-stone-500">Role is locked to Hotel Manager Admin.</p>
          )}
          {isSuperAdmin(user) && adminRole !== SUPER_ADMIN ? (
            <Field label="Hotel">
              <Select {...registerAdmin('hotelId')}>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </Select>
            </Field>
          ) : null}
          {isHotelManagerAdmin(user) ? (
            <p className="text-sm text-stone-500">This admin will only see {hotels.find((hotel) => hotel.id === user.hotelId)?.name || 'this hotel'}.</p>
          ) : null}
        </div>
      </Modal>
      <Modal
        open={typeOpen}
        onClose={() => setTypeOpen(false)}
        title="Add room type"
        footer={
          <>
            <Button variant="outline" onClick={() => setTypeOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  await addRoomType({
                    hotelId: user?.hotelId || typeForm.hotelId,
                    name: typeForm.name,
                    rate: Number(typeForm.rate),
                    capacity: Number(typeForm.capacity || 2),
                  })
                  pushToast('Room type added')
                  setTypeOpen(false)
                } catch (error) {
                  pushToast(error.message || 'Could not add room type', 'info')
                }
              }}
            >
              Save type
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          {isSuperAdmin(user) ? (
            <Field label="Hotel">
              <Select value={typeForm.hotelId} onChange={(event) => setTypeForm({ ...typeForm, hotelId: event.target.value })}>
                {availableHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Name"><Input value={typeForm.name} onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })} placeholder="Junior Suite" /></Field>
          <Field label="Rack rate"><Input type="number" value={typeForm.rate} onChange={(event) => setTypeForm({ ...typeForm, rate: event.target.value })} /></Field>
          <Field label="Capacity"><Input type="number" value={typeForm.capacity} onChange={(event) => setTypeForm({ ...typeForm, capacity: event.target.value })} /></Field>
        </div>
      </Modal>
      <Modal
        open={Boolean(pendingType)}
        onClose={() => {
          if (!deleting) setPendingType(null)
        }}
        title="Delete room type"
        subtitle={pendingType ? `Remove ${pendingType.name} from the catalog.` : ''}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setPendingType(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmRemoveType} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete type'}
            </Button>
          </>
        }
      >
        {pendingType ? (
          <p className="text-sm leading-6 text-stone-600">
            {pendingInUse
              ? `${pendingInUse} room${pendingInUse === 1 ? '' : 's'} currently use this type and will keep it. It will no longer appear when adding new rooms.`
              : 'This type will no longer appear when adding new rooms.'}
          </p>
        ) : null}
      </Modal>
      <Modal
        open={orgOpen}
        onClose={() => {
          if (!orgSaving) setOrgOpen(false)
        }}
        title={orgEditing ? 'Edit organization' : 'Add organization'}
        subtitle={orgEditing ? 'Updates this hospitality group profile.' : 'Adds another organization profile.'}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOrgOpen(false)} disabled={orgSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={saveOrganization} disabled={orgSaving}>
              {orgSaving ? 'Saving…' : orgEditing ? 'Save changes' : 'Add organization'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          {orgError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{orgError}</p>
          ) : null}
          <Field label="Display name">
            <Input value={orgForm.name} onChange={(event) => setOrgForm({ ...orgForm, name: event.target.value })} placeholder="StayHub Hospitality Group" />
          </Field>
          <Field label="Legal name">
            <Input value={orgForm.legalName} onChange={(event) => setOrgForm({ ...orgForm, legalName: event.target.value })} placeholder="StayHub Hospitality Ltd" />
          </Field>
          <Field label="Timezone">
            <Input value={orgForm.timezone} onChange={(event) => setOrgForm({ ...orgForm, timezone: event.target.value })} />
          </Field>
          <Field label="Currency">
            <Select value={orgForm.currency} onChange={(event) => setOrgForm({ ...orgForm, currency: event.target.value })}>
              <option>USD</option>
              <option>KES</option>
              <option>EUR</option>
            </Select>
          </Field>
          <Field label="Ops email">
            <Input type="email" value={orgForm.supportEmail} onChange={(event) => setOrgForm({ ...orgForm, supportEmail: event.target.value })} placeholder="ops@stayhub.com" />
          </Field>
        </div>
      </Modal>
      <Modal
        open={Boolean(pendingOrg)}
        onClose={() => {
          if (!deleting) setPendingOrg(null)
        }}
        title="Delete organization"
        subtitle={pendingOrg ? `Remove ${pendingOrg.name}.` : ''}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setPendingOrg(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmRemoveOrg} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete organization'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-stone-600">
          Hotels and rooms stay in the system. Keep at least one organization profile.
        </p>
      </Modal>
      <Modal
        open={Boolean(editingAdmin)}
        onClose={() => !adminSaving && setEditingAdmin(null)}
        title="Manage admin role"
        subtitle={editingAdmin ? `Change the role and hotel for ${editingAdmin.name}.` : ''}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditingAdmin(null)} disabled={adminSaving}>Cancel</Button>
            <Button type="button" onClick={saveAdminRole} disabled={adminSaving}>{adminSaving ? 'Saving…' : 'Save role'}</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Role">
            <Select value={adminForm.role} onChange={(event) => setAdminForm({ ...adminForm, role: event.target.value })}>
              <option value={HOTEL_MANAGER_ADMIN}>Hotel Manager Admin</option>
              <option value={SUPER_ADMIN}>Super Admin</option>
            </Select>
          </Field>
          {adminForm.role !== SUPER_ADMIN ? (
            <Field label="Hotel">
              <Select value={adminForm.hotelId} onChange={(event) => setAdminForm({ ...adminForm, hotelId: event.target.value })}>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </Select>
            </Field>
          ) : (
            <p className="text-sm text-stone-500">Super Admin can see every hotel.</p>
          )}
        </div>
      </Modal>
      <Modal
        open={Boolean(pendingAdmin)}
        onClose={() => !deleting && setPendingAdmin(null)}
        title="Delete admin"
        subtitle={pendingAdmin ? `Remove ${pendingAdmin.name}.` : ''}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setPendingAdmin(null)} disabled={deleting}>Cancel</Button>
            <Button type="button" variant="danger" onClick={confirmRemoveAdmin} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete admin'}</Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-stone-600">This login will no longer be able to sign in.</p>
      </Modal>
    </div>
  )
}
