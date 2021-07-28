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

const schema = yup.object().shape({
  name: yup.string().required('Nhập vào tên'),
  address: yup.string().required('Nhập vào địa điểm'),
})

const Step1 = memo(({ formData, setFormData, nextStep }) => {
  const [cookies, setCookie] = useCookies(['cookie-name'])

  let obj = {}
  if (!_.isNil(cookies?.username)) {
    obj.name = cookies.username
  }

  if (!_.isNil(cookies?.address)) {
    obj.address = cookies.address
  }

  const defaultValues = Object.assign({}, formData, obj)

  const [showMap, setShowMap] = useState(false)
  const [locationUser, setLocationUser] = useState(null)
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

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        showMap && <MapBox isOneLocaion={true}
          data={(data) => {
            setLocationUser(data)
          }}
          show={() => {
            setShowMap(false)
          }} />
      }
      {
        showMap === true ? null :
          <FormCard>
            <FormProvider {...methods}>
              {
                locationUser && methods.setValue('address', locationUser)
              }
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
      }
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