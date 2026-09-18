import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { api, convexMutation } from '../api/client'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } })

  return (
    <div className="rounded-lg border border-stone-line bg-white p-7 shadow-sm sm:p-8">
      <p className="text-sm font-bold text-[#006ce4]">Account</p>
      <h1 className="mt-1 text-3xl font-extrabold text-[#1a1a1a]">Reset password</h1>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        Enter the email on your StayHub account. In this prototype, no email is actually sent.
      </p>
      {sent ? (
        <div className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          If an account exists for that address, a reset link would be delivered. Return to login to continue the demo.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(async ({ email }) => {
            await convexMutation(api.auth.forgotPassword, { email })
            setSent(true)
          })}
          className="mt-8 space-y-4"
        >
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" placeholder="you@stayhub.com" {...register('email', { required: 'Email is required' })} />
          </Field>
          <Button type="submit" className="w-full" size="lg">
            Send reset link
          </Button>
        </form>
      )}
      <Link to="/" className="mt-6 inline-block text-sm font-bold text-[#006ce4] hover:underline">
        Back to login
      </Link>
    </div>
  )
}
