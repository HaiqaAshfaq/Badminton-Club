import { useForm } from 'react-hook-form'
import { useData } from '../../context/DataContext'

export default function MemberForm({ member, onDone }) {
  const { addMember, updateMember } = useData()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: member || {
      name: '', joiningDate: new Date().toISOString().slice(0, 10), defaultFee: '', phone: '', notes: '',
    },
  })

  async function onSubmit(data) {
    if (member) await updateMember(member.id, { ...data, defaultFee: Number(data.defaultFee) })
    else await addMember(data)
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Full Name" error={errors.name} required>
        <input {...register('name', { required: 'Name is required' })} placeholder="e.g. Ashfaq Ghuman" className="input" />
      </Field>
      <Field label="Joining Date">
        <input type="date" {...register('joiningDate')} className="input" />
      </Field>
      <Field label="Monthly Fee (Rs)" error={errors.defaultFee} required>
        <input type="number" inputMode="numeric" placeholder="e.g. 2000" {...register('defaultFee', { required: 'Monthly fee is required', min: 0 })} className="input" />
      </Field>
      <Field label="Phone Number (Optional)">
        <input {...register('phone')} placeholder="03xx-xxxxxxx" className="input" />
      </Field>
      <Field label="Notes (Optional)">
        <textarea {...register('notes')} rows={2} className="input resize-none" />
      </Field>
      <button disabled={isSubmitting} className="btn-primary w-full">
        {member ? 'Save Changes' : 'Add Member'}
      </button>
    </form>
  )
}

export function Field({ label, error, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-600 dark:text-cloud-200 mb-1.5 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <span className="text-xs text-rose-500 mt-1 block">{error.message}</span>}
    </label>
  )
}
