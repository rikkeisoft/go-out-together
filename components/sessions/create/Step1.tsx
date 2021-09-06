import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { updateSessionCreator } from 'api/users'
import messageCodes from 'consts/messageCodes'
import urls from 'consts/urls'
import { Address } from 'lib/interfaces'
import _ from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { memo, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import * as yup from 'yup'
import AddressField from '../../common/AddressField'
import Button from '../../common/Button'
import ErrorText from '../../common/ErrorText'
import Field from '../../common/Field'
import Label from '../../common/Label'
import LoadingOverlay from '../../common/LoadingOverlay'
import MapBox from '../../common/MapBox'
import TextField from '../../common/TextField'

const schema = yup.object().shape({
  name: yup.string().required('Nhập vào tên'),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

interface FormAddressInput {
  address?: Address
  name?: string
}

interface StepProps {
  formData: {}
  setFormData: (props?: FormAddressInput) => unknown
}

const Step1 = memo(({ formData, setFormData }: StepProps) => {
  const [cookies] = useCookies(['username', 'uid'])
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const router = useRouter()

  const { isLoading, isSuccess, data, mutateAsync } = useMutation(updateSessionCreator)

  const defaultValues = Object.assign({}, formData, {
    name: cookies.username,
  })

  const methods = useForm<FormAddressInput>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  })

  const onSubmit = async (data: FormAddressInput) => {
    setFormData(Object.assign({}, formData, data))
    await mutateAsync({
      uid: cookies.uid,
      name: data.name,
      address: data.address,
    })
  }

  useEffect(() => {
    if (userLocation) {
      methods.setValue('address', {
        aid: userLocation.id,
        name: userLocation.place_name,
        longitude: userLocation.center[0],
        latitude: userLocation.center[1],
      })
    }
  }, [userLocation])

  useEffect(() => {
    if (isSuccess) {
      if (data.messageCode === messageCodes.SUCCESS) {
        sessionStorage.removeItem('voted')
        sessionStorage.getItem('sid') && sessionStorage.removeItem('sid')
        router.push(`${urls.SESSIONS_CREATE}/2`)
      } else {
        alert(data.message)
      }
    }
  }, [isSuccess])

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {showMap ? (
        <MapBox
          isOneLocation={true}
          data={(data) => setUserLocation(data)}
          show={() => {
            setShowMap(false)
          }}
        />
      ) : (
        <div className='w-full px-3 py-6 md:mt-14 md:w-6/12 md:mt-2/5 md:mx-auto md:px-10 md:py-10 font-bold'>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor='name'>
                  <p className='mb-2 text-2xl'>Tên:</p>
                </Label>
                <TextField id='name' name='name' />
                <ErrorMessage
                  errors={methods.formState.errors}
                  name='name'
                  render={({ message }) => <ErrorText>{message}</ErrorText>}
                />
              </Field>

              <Field>
                <Label htmlFor='address'>Địa điểm hiện tại của bạn:</Label>
                <div className='py-2 mb-6'>
                  <Button type='button' variant='primary' onClick={() => setShowMap(true)}>
                    <p>Chọn địa điểm trên bản đồ</p>
                  </Button>
                </div>
                <AddressField name='address' />
                {!_.isNil(methods.formState.errors.address) && <ErrorText>Nhập vào địa chỉ</ErrorText>}
              </Field>
              <div className='  mx-auto flex justify-between'>
                <Button type='button' variant='danger' onClick={() => router.back()}>
                  Quay lại
                </Button>
                <Button type='submit' variant='primary'>
                  Tiếp theo
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
      <LoadingOverlay isOpen={isLoading} message='Đang xử lí...' />
    </>
  )
})

export default Step1
