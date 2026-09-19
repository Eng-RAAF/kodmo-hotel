import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Wallet, AlertTriangle, Clock3, CircleDollarSign } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { PAYMENT_METHODS, TODAY } from '../lib/constants'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { formatCurrency, formatDate } from '../lib/format'

const STATUS_TONE = {
  open: 'sky',
  partial: 'amber',
  overdue: 'rose',
  paid: 'emerald',
  void: 'slate',
}

const TYPE_LABEL = {
  folio: 'Guest folio',
  city_ledger: 'City ledger',
  manual: 'Manual invoice',
}

const AGING_KEYS = ['current', '1-30', '31-60', '61-90', '90+']

function daysPastDue(dueDate, today = TODAY) {
  const start = new Date(`${dueDate}T00:00:00`)
  const end = new Date(`${today}T00:00:00`)
  return Math.round((end - start) / 86400000)
}

function agingBucket(invoice) {
  const balance = Math.max(0, invoice.amount - invoice.paid)
  if (balance <= 0 || invoice.status === 'void' || invoice.status === 'paid') return 'paid'
  const days = daysPastDue(invoice.dueDate)
  if (days <= 0) return 'current'
  if (days <= 30) return '1-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '90+'
}

export function ReceivablesPage() {
  const invoices = useScopedList(useDataStore((state) => state.invoices || []))
  const guests = useDataStore((state) => state.guests)
  const hotels = useDataStore((state) => state.hotels)
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const addInvoice = useDataStore((state) => state.addInvoice)
  const collectInvoice = useDataStore((state) => state.collectInvoice)
  const voidInvoice = useDataStore((state) => state.voidInvoice)
  const { currentHotelId, isAllHotels, currentHotel } = useHotelScope()
  const pushToast = useUiStore((state) => state.pushToast)
  const [status, setStatus] = useState('open')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [collecting, setCollecting] = useState(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: '',
      guestId: '',
      type: 'city_ledger',
      amount: '',
      dueDate: '',
      notes: '',
    },
  })
  const {
    register: registerCollect,
    handleSubmit: handleCollectSubmit,
    reset: resetCollect,
    setValue: setCollectValue,
  } = useForm({
    defaultValues: { amount: '', method: 'Bank transfer', reference: '' },
  })

  const openCreate = () => {
    reset({
      company: '',
      guestId: '',
      type: 'city_ledger',
      amount: '',
      dueDate: '',
      notes: '',
    })
    setCreateOpen(true)
  }

  const openCollect = (invoice) => {
    const balance = Math.max(0, invoice.amount - invoice.paid)
    setCollecting(invoice)
    resetCollect({ amount: String(balance), method: 'Bank transfer', reference: invoice.number })
    setCollectValue('amount', String(balance))
  }

  const stats = useMemo(() => {
    const live = invoices.filter((item) => item.status !== 'void')
    const openRows = live.filter((item) => item.status !== 'paid')
    const total = openRows.reduce((sum, item) => sum + Math.max(0, item.amount - item.paid), 0)
    const overdue = openRows
      .filter((item) => item.status === 'overdue' || daysPastDue(item.dueDate) > 0)
      .reduce((sum, item) => sum + Math.max(0, item.amount - item.paid), 0)
    const current = total - overdue
    const collected = live.reduce((sum, item) => sum + item.paid, 0)
    const aging = Object.fromEntries(AGING_KEYS.map((key) => [key, 0]))
    for (const invoice of openRows) {
      const bucket = agingBucket(invoice)
      if (aging[bucket] != null) aging[bucket] += Math.max(0, invoice.amount - invoice.paid)
    }
    return { total, overdue, current, collected, aging, openCount: openRows.length }
  }, [invoices])

  const guestOptions = useMemo(() => {
    const ids = new Set(reservations.map((item) => item.guestId))
    for (const invoice of invoices) {
      if (invoice.guestId) ids.add(invoice.guestId)
    }
    const scoped = guests.filter((guest) => ids.has(guest.id))
    return scoped.length ? scoped : guests
  }, [guests, invoices, reservations])

  const rows = useMemo(() => {
    return invoices
      .filter((invoice) => {
        if (status === 'open') return invoice.status !== 'paid' && invoice.status !== 'void'
        if (status !== 'all' && invoice.status !== status) return false
        if (type !== 'all' && invoice.type !== type) return false
        const guest = guests.find((item) => item.id === invoice.guestId)
        const hay = `${invoice.number} ${invoice.company} ${guest?.firstName || ''} ${guest?.lastName || ''}`.toLowerCase()
        return hay.includes(query.trim().toLowerCase())
      })
      .map((invoice) => ({
        ...invoice,
        guest: guests.find((item) => item.id === invoice.guestId),
        hotel: hotels.find((item) => item.id === invoice.hotelId),
        balance: Math.max(0, invoice.amount - invoice.paid),
        aging: agingBucket(invoice),
      }))
  }, [invoices, guests, hotels, status, type, query])

  const saveInvoice = handleSubmit(async (values) => {
    const amount = Number(values.amount)
    if (!values.company.trim() && !values.guestId) {
      pushToast('Add a company or guest for this invoice.', 'info')
      return
    }
    setSaving(true)
    try {
      const invoice = await addInvoice({
        hotelId: isAllHotels ? undefined : currentHotelId,
        company: values.company,
        guestId: values.guestId || undefined,
        type: values.type,
        amount,
        dueDate: values.dueDate || undefined,
        notes: values.notes,
      })
      pushToast(`${invoice.number} posted to receivables`)
      setCreateOpen(false)
    } catch (error) {
      pushToast(error.message || 'Could not create invoice', 'info')
    } finally {
      setSaving(false)
    }
  })

  const saveCollection = handleCollectSubmit(async (values) => {
    if (!collecting) return
    setSaving(true)
    try {
      await collectInvoice({
        invoiceId: collecting.id,
        amount: Number(values.amount),
        method: values.method,
        reference: values.reference,
      })
      pushToast(`Collected ${formatCurrency(Number(values.amount))} on ${collecting.number}`)
      setCollecting(null)
    } catch (error) {
      pushToast(error.message || 'Could not record collection', 'info')
    } finally {
      setSaving(false)
    }
  })

  return (
    <div>
      <PageHeader
        title="Accounts receivable"
        subtitle={
          isAllHotels
            ? 'City ledger and guest folio balances across the group.'
            : `Open invoices, aging, and collections for ${currentHotel?.name || 'this hotel'}.`
        }
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus size={16} /> New invoice
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open AR" value={formatCurrency(stats.total)} hint={`${stats.openCount} invoices`} icon={Wallet} />
        <StatCard label="Current" value={formatCurrency(stats.current)} hint="Not yet due" icon={Clock3} />
        <StatCard label="Overdue" value={formatCurrency(stats.overdue)} hint="Past due date" icon={AlertTriangle} />
        <StatCard label="Collected" value={formatCurrency(stats.collected)} hint="Posted against invoices" icon={CircleDollarSign} />
      </div>

      <Card className="mb-6">
        <div className="border-b border-stone-100 px-5 py-4">
          <h3 className="text-sm font-semibold">Aging</h3>
          <p className="mt-1 text-xs text-stone-500">Open balances by days past due</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-stone-100 sm:grid-cols-3 lg:grid-cols-5">
          {AGING_KEYS.map((key) => (
            <div key={key} className="bg-white px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 sm:text-xs">{key === 'current' ? 'Current' : `${key} days`}</p>
              <p className="mt-2 text-base font-extrabold text-[#1a1a1a] sm:text-lg">{formatCurrency(stats.aging[key])}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold">Invoice register</h3>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full sm:w-auto">
              <option value="open">Open balances</option>
              <option value="all">All invoices</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
            </Select>
            <Select value={type} onChange={(event) => setType(event.target.value)} className="w-full sm:w-auto">
              <option value="all">All types</option>
              <option value="folio">Guest folios</option>
              <option value="city_ledger">City ledger</option>
              <option value="manual">Manual</option>
            </Select>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, company, guest" className="w-full sm:w-56" />
          </div>
        </div>
        <Table
          rows={rows}
          emptyTitle="No receivables in this view"
          emptyBody="Create a city-ledger invoice or wait for open guest folios to sync."
          columns={[
            { key: 'number', label: 'Invoice', render: (row) => <span className="font-bold">{row.number}</span> },
            {
              key: 'account',
              label: 'Account',
              render: (row) => (
                <div>
                  <p className="font-medium">{row.company || (row.guest ? `${row.guest.firstName} ${row.guest.lastName}` : 'Guest folio')}</p>
                  <p className="text-xs text-stone-500">{TYPE_LABEL[row.type] || row.type}</p>
                </div>
              ),
            },
            ...(isAllHotels ? [{ key: 'hotel', label: 'Hotel', render: (row) => row.hotel?.name }] : []),
            { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
            { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
            { key: 'balance', label: 'Balance', render: (row) => formatCurrency(row.balance) },
            { key: 'aging', label: 'Aging', render: (row) => (row.status === 'paid' || row.status === 'void' ? '—' : row.aging) },
            { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <div className="flex justify-end gap-1">
                  {row.balance > 0 && row.status !== 'void' ? (
                    <Button type="button" size="sm" onClick={() => openCollect(row)}>
                      Collect
                    </Button>
                  ) : null}
                  {row.status !== 'paid' && row.status !== 'void' && row.type !== 'folio' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={async () => {
                        try {
                          await voidInvoice(row.id)
                          pushToast(`${row.number} voided`)
                        } catch (error) {
                          pushToast(error.message || 'Could not void invoice', 'info')
                        }
                      }}
                    >
                      Void
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        title="New receivable"
        subtitle="Posts a city-ledger or manual invoice to this hotel."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={saveInvoice} disabled={saving}>{saving ? 'Saving…' : 'Post invoice'}</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Type">
            <Select {...register('type')}>
              <option value="city_ledger">City ledger</option>
              <option value="manual">Manual invoice</option>
            </Select>
          </Field>
          <Field label="Company / account" error={errors.company?.message}>
            <Input {...register('company')} placeholder="Hormuud Telecom" />
          </Field>
          <Field label="Guest (optional)">
            <Select {...register('guestId')}>
              <option value="">No guest</option>
              {guestOptions.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount" error={errors.amount?.message}>
            <Input type="number" min="1" step="0.01" {...register('amount', { required: 'Amount is required' })} />
          </Field>
          <Field label="Due date">
            <Input type="date" {...register('dueDate')} />
          </Field>
          <Field label="Notes">
            <Textarea {...register('notes')} placeholder="Contract, event, or folio notes" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(collecting)}
        onClose={() => !saving && setCollecting(null)}
        title="Collect payment"
        subtitle={collecting ? `${collecting.number} · ${formatCurrency(Math.max(0, collecting.amount - collecting.paid))} open` : ''}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCollecting(null)} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={saveCollection} disabled={saving}>{saving ? 'Posting…' : 'Post collection'}</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Amount">
            <Input type="number" min="1" step="0.01" {...registerCollect('amount', { required: true })} />
          </Field>
          <Field label="Method">
            <Select {...registerCollect('method')}>
              {PAYMENT_METHODS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="Reference">
            <Input {...registerCollect('reference')} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
