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
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'

const schema = yup.object().shape({
  name: yup.string().required('Nhập vào tên'),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step1 = memo(({ formData, setFormData, nextStep }) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

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
        nextStep()
      } else {
        alert(updateSessionCreatorMutation.data.message)
      }
    }
  }, [updateSessionCreatorMutation.isSuccess])

  // console.log(userLocation)

  // call API

  // useEffect(() => {
  //   if (userLocation) {
  //     const adminInfo = {
  //       uid: uid(),
  //       name: formData.name,
  //       address: {
  //         aid: userLocation.id,
  //         name: userLocation.place_name,
  //         latitude: userLocation.geometry.coordinates[0],
  //         longitude: userLocation.geometry.coordinates[1],
  //       },
  //     }
  //     console.log(adminInfo)

  //     const sendAminInfo = async () => {
  //       try {
  //         const response = await sessionsCreate.createInfoAdmin(adminInfo)
  //         console.log(response)
  //       } catch (error) {
  //         console.log('error', error)
  //       }
  //     }
  //     sendAminInfo()
  //   }
  // }, [formData])

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
        <div className=" mt-14 w-6/12 mt-2/5 mx-auto px-10 py-10 font-bold">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor="name">
                  <p className="mb-2">Tên:</p>
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
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setShowMap(true)
                    }}
                  >
                    <p>Chọn địa điểm trên bản đồ</p>
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
        </div>
      )}
      <LoadingOverlay isOpen={updateSessionCreatorMutation.isLoading} message="Đang xử lí..." />
    </>
  )
})

Step1.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  nextStep: PropTypes.func,
}

Step1.defaultProps = {}

export default Step1
