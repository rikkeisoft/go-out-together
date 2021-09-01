import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { joinSession } from 'api/users'
import messageCodes from 'consts/messageCodes'
import urls from 'consts/urls'
import { Address } from 'lib/interfaces'
import _ from 'lodash'
import Head from 'next/head'
import router from 'next/router'
import { memo, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import * as yup from 'yup'
import AddressField from '../../common/AddressField'
import Button from '../../common/Button'
import ButtonGroup from '../../common/ButtonGroup'
import ErrorText from '../../common/ErrorText'
import Field from '../../common/Field'
import FormCard from '../../common/FormCard'
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

interface Step1Props {
  sid: string
  formData: {}
  setFormData: (params: FormAddressInput) => unknown
}

const Step1 = memo(({ sid, formData, setFormData }: Step1Props) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  const { isSuccess, isLoading, data, mutateAsync } = useMutation(joinSession)

  const defaultValues = Object.assign({}, formData, {
    name: cookies.username,
  })

  const methods = useForm<FormAddressInput>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  })

  const onSubmit = async (data: FormAddressInput) => {
    const params = Object.assign({}, formData, data)
    setFormData(params)
    const isSessionExpired = JSON.parse(sessionStorage.getItem('isSessionExpired'))
    if (isSessionExpired) {
      router.push(`${urls.SESSIONS}/${sid}/2`)
    } else {
      await mutateAsync({
        sid: sid,
        uid: cookies.uid,
        name: data.name,
        address: data.address,
      })
    }
  }

  useEffect(() => {
    if (userLocation) {
      methods.setValue(
        'address',
        {
          aid: userLocation.id,
          name: userLocation.place_name,
          longitude: userLocation.center[0],
          latitude: userLocation.center[1],
        },
        { shouldValidate: true },
      )
    }
  }, [userLocation])

  useEffect(() => {
    if (isSuccess) {
      if (data.messageCode === messageCodes.SUCCESS) {
        router.push(`${urls.SESSIONS}/${sid}/2`)
      } else {
        alert(data.message)
      }
    }
  }, [isSuccess])

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {showMap ? (
        <MapBox
          isOneLocation={true}
          data={(data) => {
            setUserLocation(data)
          }}
          show={() => {
            setShowMap(false)
          }}
        />
      ) : (
        <FormCard>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor="name">Tên:</Label>
                <TextField id="name" name="name" />
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="name"
                  render={({ message }) => <ErrorText>{message}</ErrorText>}
                />
              </Field>

              <Field>
                <Label htmlFor="address">Địa điểm hiện tại của bạn:</Label>
                <div className="py-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setShowMap(true)
                    }}
                  >
                    Chọn địa điểm trên bản đồ
                  </Button>
                </div>
                <AddressField name="address" />
                {!_.isNil(methods.formState.errors.address) && <ErrorText>Nhập vào địa chỉ</ErrorText>}
              </Field>

              <ButtonGroup>
                <Button type="submit" variant="primary" onClick={() => {}}>
                  Tiếp theo
                </Button>
              </ButtonGroup>
            </form>
          </FormProvider>
        </FormCard>
      )}
      <LoadingOverlay isOpen={isLoading} message="Đang xử lí..." />
    </>
  )
})

export default Step1
