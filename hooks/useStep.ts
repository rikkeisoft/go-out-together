import { Dispatch, SetStateAction, useState } from 'react'

export default function useStep(): { formData: {}; setFormData: Dispatch<SetStateAction<{}>> } {
  const [formData, setFormData] = useState({})

  return {
    formData,
    setFormData,
  }
}
