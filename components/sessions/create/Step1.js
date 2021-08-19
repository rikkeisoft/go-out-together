import { memo, useState, useEffect } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useCookies } from 'react-cookie'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import { useMutation } from 'react-query'
import messageCodes from 'consts/messageCodes'
import { updateSessionCreator } from 'api/users'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import TextField from 'components/common/TextField'
import AddressField from 'components/common/AddressField'
import ErrorText from 'components/common/ErrorText'
import Button from 'components/common/Button'
import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'
import { useRouter } from 'next/router'
import urls from 'consts/urls'

const schema = yup.object().shape({
  name: yup.string().required('Nhập vào tên'),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step1 = memo(({ formData, setFormData }) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const router = useRouter()

  const updateSessionCreatorMutation = useMutation(updateSessionCreator)

  const defaultValues = Object.assign({}, formData, {
    name: cookies.username,
  })

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  })

  const onSubmit = (data) => {
    setFormData(Object.assign({}, formData, data))
    updateSessionCreatorMutation.mutate({
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
    if (updateSessionCreatorMutation.isSuccess) {
      if (updateSessionCreatorMutation.data.messageCode === messageCodes.SUCCESS) {
        sessionStorage.removeItem('voted')
        sessionStorage.getItem('sid') && sessionStorage.removeItem('sid')
        router.push(`${urls.SESSIONS_CREATE}/2`)
      } else {
        alert(updateSessionCreatorMutation.data.message)
      }
    }
  }, [updateSessionCreatorMutation.isSuccess])

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {showMap ? (
        <MapBox
          isOneLocaion={true}
          data={(data) => setUserLocation(data)}
          show={() => {
            setShowMap(false)
          }}
        />
      ) : (
        <div className="w-full px-3 py-6 md:mt-14 md:w-6/12 md:mt-2/5 md:mx-auto md:px-10 md:py-10 font-bold">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor="name">
                  <p className="mb-2 text-2xl">Tên:</p>
                </Label>
                <TextField id="name" name="name" />
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="name"
                  render={({ message }) => <ErrorText>{message}</ErrorText>}
                />
              </Field>

              <Field>
                <Label htmlFor="address">Địa điểm hiện tại của bạn:</Label>
                <div className="py-2 mb-6">
                  <Button type="button" variant="primary" onClick={() => setShowMap(true)}>
                    <p>Chọn địa điểm trên bản đồ</p>
                  </Button>
                </div>
                <AddressField name="address" />
                {!_.isNil(methods.formState.errors.address) && <ErrorText>Nhập vào địa chỉ</ErrorText>}
              </Field>
              <div className="  mx-auto flex justify-between">
                <Button type="button" variant="primary" onClick={() => router.back()}>
                  Quay lại
                </Button>
                <Button type="submit" variant="primary" onClick={() => {}}>
                  Tiếp theo
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
      <LoadingOverlay isOpen={updateSessionCreatorMutation.isLoading} message="Đang xử lí..." />
    </>
  )
})

Step1.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
}
Step1.defaultProps = {}

export default Step1
