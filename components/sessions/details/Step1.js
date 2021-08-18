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
import { joinSession } from 'api/users'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import TextField from 'components/common/TextField'
import AddressField from 'components/common/AddressField'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'
import router from 'next/router'
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

const Step1 = memo(({ sid, formData, setFormData, nextStep }) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  const joinSessionMutation = useMutation(joinSession)

  const defaultValues = Object.assign({}, formData, {
    name: cookies.username,
  })

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  })

  const onSubmit = (data) => {
    setFormData(Object.assign({}, formData, data))
    joinSessionMutation.mutate({
      sid: sid,
      uid: cookies.uid,
      name: data.name,
      address: data.address,
    })
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
    if (joinSessionMutation.isSuccess) {
      if (joinSessionMutation.data.messageCode === messageCodes.SUCCESS) {
        router.push(`${urls.SESSIONS}/${sid}/2`)
        nextStep()
      } else {
        alert(joinSessionMutation.data.message)
      }
    }
  }, [joinSessionMutation.isSuccess])

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {showMap ? (
        <MapBox
          isOneLocaion={true}
          data={(data) => {
            console.log(data)
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
      <LoadingOverlay isOpen={joinSessionMutation.isLoading} message="Đang xử lí..." />
    </>
  )
})

Step1.propTypes = {
  sid: PropTypes.string,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  nextStep: PropTypes.func,
}

Step1.defaultProps = {}

export default Step1
