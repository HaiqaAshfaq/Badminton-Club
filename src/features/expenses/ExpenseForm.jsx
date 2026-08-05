import { useForm } from 'react-hook-form'
import { useData } from '../../context/DataContext'
import { Field } from '../members/MemberForm'

const COMMON = ['Guard Salary', 'Shuttle', 'Light Bill', 'Bulbs', 'Tea', 'Water', 'Repair', 'Cleaning']

export default function ExpenseForm({ expense, onDone }) {
  const { addExpense, updateExpense } = useData()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: expense || { title: '', amount: '', date: new Date().toISOString().slice(0, 10), description: '' },
  })
  const title = watch('title')

  async function onSubmit(data) {
    if (expense) await updateExpense(expense.id, { ...data, amount: Number(data.amount) })
    else await addExpense(data)
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Expense Title" error={errors.title} required>
        <input {...register('title', { required: 'Title is required' })} placeholder="e.g. Shuttle" className="input" />
      </Field>
      <div className="flex flex-wrap gap-1.5 -mt-2">
        {COMMON.map((c) => (
          <button type="button" key={c} onClick={() => setValue('title', c)}
            className={`text-xs px-2.5 py-1 rounded-full border ${title === c ? 'bg-blue-600 text-white border-blue-600' : 'border-cloud-200 dark:border-white/10 text-ink-600 dark:text-cloud-200'}`}>
            {c}
          </button>
        ))}
      </div>
      <Field label="Amount (Rs)" error={errors.amount} required>
        <input type="number" inputMode="numeric" {...register('amount', { required: true, min: 1 })} className="input" />
      </Field>
      <Field label="Date">
        <input type="date" {...register('date')} className="input" />
      </Field>
      <Field label="Description (Optional)">
        <textarea {...register('description')} rows={2} className="input resize-none" />
      </Field>
      <button disabled={isSubmitting} className="btn-primary w-full">{expense ? 'Save Changes' : 'Add Expense'}</button>
    </form>
  )
}
