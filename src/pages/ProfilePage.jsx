import { useForm } from 'react-hook-form'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, Input } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useUiStore } from '../store/uiStore'
import { initials } from '../lib/format'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const updatePassword = useAuthStore((state) => state.updatePassword)
  const hotels = useDataStore((state) => state.hotels)
  const pushToast = useUiStore((state) => state.pushToast)
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, title: user?.title },
  })
  const passwordForm = useForm({ defaultValues: { current: '', next: '', confirm: '' } })
  const hotel = hotels.find((item) => item.id === user?.hotelId)

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account details for this prototype session." />
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="overflow-hidden text-center">
          <div className="gold-rule" />
          <div className="p-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-white">
            {initials(user?.name)}
          </div>
          <h2 className="mt-4 text-lg font-semibold">{user?.name}</h2>
          <p className="text-sm text-stone-500">{user?.email}</p>
          <div className="mt-3 flex justify-center">
            <Badge tone="gold">{user?.role}</Badge>
          </div>
          <p className="mt-4 text-sm text-stone-500">{hotel ? hotel.name : 'All hotels'}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Personal details</h3>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={handleSubmit((values) => {
                updateProfile(values)
                pushToast('Profile updated')
              })}
            >
              <Field label="Full name" className="sm:col-span-2"><Input {...register('name')} /></Field>
              <Field label="Title"><Input {...register('title')} /></Field>
              <Field label="Phone"><Input {...register('phone')} /></Field>
              <Field label="Email">
                <Input value={user?.email} disabled />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit">Save profile</Button>
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Change password</h3>
            <form
              className="grid max-w-md gap-4"
              onSubmit={passwordForm.handleSubmit(async (values) => {
                if (values.next !== values.confirm) {
                  pushToast('New passwords do not match', 'info')
                  return
                }
                try {
                  await updatePassword({ current: values.current, next: values.next })
                  passwordForm.reset()
                  pushToast('Password updated')
                } catch (error) {
                  pushToast(error.message || 'Could not update password', 'info')
                }
              })}
            >
              <Field label="Current password"><Input type="password" {...passwordForm.register('current', { required: true })} /></Field>
              <Field label="New password"><Input type="password" {...passwordForm.register('next', { required: true })} /></Field>
              <Field label="Confirm password"><Input type="password" {...passwordForm.register('confirm', { required: true })} /></Field>
              <Button type="submit" variant="outline">Update password</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
