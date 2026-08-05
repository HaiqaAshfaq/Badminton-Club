import { useForm, Controller } from 'react-hook-form'
import { useData } from '../../context/DataContext'
import MemberSelect from '../../components/MemberSelect'
import { Field } from '../members/MemberForm'

export default function FineForm({ fine, onDone }) {
  const { members, addFine, updateFine } = useData()
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: fine || {
      memberId: '', reason: '', amount: '', date: new Date().toISOString().slice(0, 10), status: 'unpaid', notes: '',
    },
  })
  const status = watch('status')

  async function onSubmit(data) {
    if (fine) await updateFine(fine.id, { ...data, amount: Number(data.amount) })
    else await addFine(data)
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Member" error={errors.memberId} required>
        <Controller
          name="memberId" control={control} rules={{ required: 'Select a member' }}
          render={({ field }) => <MemberSelect members={members} value={field.value} onChange={field.onChange} />}
        />
      </Field>
      <Field label="Reason for Fine" error={errors.reason} required>
        <input {...register('reason', { required: 'Reason is required' })} placeholder="e.g. Came 20 minutes late" className="input" />
      </Field>
      <Field label="Fine Amount (Rs)" error={errors.amount} required>
        <input type="number" inputMode="numeric" {...register('amount', { required: true, min: 1 })} className="input" />
      </Field>
      <Field label="Date">
        <input type="date" {...register('date')} className="input" />
      </Field>
      <Field label="Status">
        <div className="grid grid-cols-2 gap-2">
          <StatusToggle name="status" value="unpaid" register={register} current={status} label="Unpaid" />
          <StatusToggle name="status" value="paid" register={register} current={status} label="Paid" />
        </div>
      </Field>
      {status === 'paid' && (
        <Field label="Date Paid">
          <input type="date" {...register('datePaid')} className="input" />
        </Field>
      )}
      <Field label="Notes (Optional)">
        <textarea {...register('notes')} rows={2} className="input resize-none" />
      </Field>
      <button disabled={isSubmitting} className="btn-primary w-full">{fine ? 'Save Changes' : 'Add Fine'}</button>
    </form>
  )
}

function StatusToggle({ name, value, register, current, label }) {
  const active = current === value
  return (
    <label className={`text-center py-3 rounded-2xl text-sm font-semibold cursor-pointer border ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-cloud-200 dark:border-white/10 text-ink-600 dark:text-cloud-200'}`}>
      <input type="radio" value={value} {...register(name)} className="hidden" />
      {label}
    </label>
  )
}
