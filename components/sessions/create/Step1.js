import { memo, useState } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useCookies } from 'react-cookie'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import TextField from 'components/common/TextField'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MapBox from 'components/common/MapBox'
// import sessionsCreate from 'api/sessionsCreate'
// import { uid } from 'uid'

const schema = yup.object().shape({
  name: yup.string().required('Nhập vào tên'),
  address: yup.string().required('Nhập vào địa điểm'),
})

const Step1 = memo(({ formData, setFormData, nextStep }) => {
  const [cookies, setCookie] = useCookies(['cookie-name'])
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  let obj = {}
  if (!_.isNil(cookies?.username)) {
    obj.name = cookies.username
  }

  if (!_.isNil(cookies?.address)) {
    obj.address = cookies.address
  }

  const defaultValues = Object.assign({}, formData, obj)

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  })

  const onSubmit = (data) => {
    setCookie('name', data.name)
    setCookie('address', data.address)
    setFormData(Object.assign({}, formData, data))
    nextStep()
  }

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
      {showMap && (
        <MapBox
          isOneLocaion={true}
          data={(data) => {
            setUserLocation(data)
          }}
          show={() => {
            setShowMap(false)
          }}
        />
      )}
      {showMap === true ? null : (
        <FormCard>
          <FormProvider {...methods}>
            {userLocation && methods.setValue('address', userLocation.place_name)}
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
                <TextField id="address" name="address" readOnly={true} />
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="address"
                  render={({ message }) => <ErrorText>{message}</ErrorText>}
                />
              </Field>

              <ButtonGroup>
                <Button type="submit" variant="primary" onClick={() => { }}>
                  Tiếp theo
                </Button>
              </ButtonGroup>
            </form>
          </FormProvider>
        </FormCard>
      )}
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
