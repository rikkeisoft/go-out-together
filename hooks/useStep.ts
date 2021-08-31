import { useState } from 'react'

export default function useStep() {
  const [formData, setFormData] = useState({})

  return {
    formData,
    setFormData,
  }
}
