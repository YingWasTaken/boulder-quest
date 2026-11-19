import { Minus, Plus } from 'lucide-react'
import './Stepper.css'

interface StepperProps {
  value: number
  min: number
  max: number
  step?: number
  label: string
  unit?: string
  onChange: (value: number) => void
}

export function Stepper({ value, min, max, step = 1, label, unit, onChange }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`${label} −`}
      >
        <Minus size={20} strokeWidth={3} aria-hidden />
      </button>
      <span className="stepper-value" aria-live="polite">
        <strong>{value}</strong>
        {unit && <small>{unit}</small>}
      </span>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`${label} +`}
      >
        <Plus size={20} strokeWidth={3} aria-hidden />
      </button>
    </div>
  )
}
