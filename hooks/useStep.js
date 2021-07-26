import { useState } from 'react'

export default function useStep(defaultStep = 1) {
  const [step, setStep] = useState(defaultStep)
  const [formData, setFormData] = useState({})

  const backwardStep = () => {
    setStep(1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  return {
    step,
    formData,
    backwardStep,
    prevStep,
    nextStep,
    setFormData,
  }
}
