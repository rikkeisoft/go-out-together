import { memo, useEffect, useState } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import TextField from 'components/common/TextField'
import SelectBox from 'components/common/SelectBox'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import TextArea from 'components/common/TextArea'
import List from 'components/common/List'
import MapBox from 'components/common/MapBox'
import SmallTitle from 'components/common/SmallTitle'

const schema = yup.object().shape({
  title: yup.string().required('Nhập vào tiêu đề'),
  content: yup.string().required('Nhập vào nội dung'),
  timeLimit: yup.string().required('Chọn giới hạn thời gian vote'),
  addresses: yup.array().min(1, 'Chọn địa chỉ'),
})

const Step2 = memo(({ formData, setFormData, prevStep, nextStep }) => {
  const [showMap, setShowMap] = useState(false)
  const [listDataLocation, setListDataLocation] = useState(null)
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const onSubmit = (data) => {
    setFormData(Object.assign({}, formData, data))
    nextStep()
  }

  useEffect(() => {
    let addresses = methods.watch('addresses')
    if (listDataLocation) {
      listDataLocation.forEach((item) => {
        addresses.push(item.place_name)
      })
      methods.setValue('addresses', addresses, { shouldValidate: true })
    }
  }, [listDataLocation])

  const renderListLocation = () => {
    if (methods.getValues('addresses')) {
      if (methods.getValues('addresses').length >= 5) {
        return (
          <p className="text-red-500 mb-5">Chỉ giới hạn nhập tối đa 5 địa điểm!</p>
        )
      }
      else {
        return (
          <div className="py-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setShowMap(true)
              }}
            >
              Thêm địa điểm từ bản đồ
            </Button>
          </div>
        )
      }
    }
    else {
      return (
        <div className="py-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setShowMap(true)
            }}
          >
            Thêm địa điểm từ bản đồ
          </Button>
        </div>
      )
    }
  }

  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SmallTitle>Nhanh tay điền thông tin và bắt đầu thôi!</SmallTitle>
      {
        showMap && <MapBox
          data={(data) => {
            setListDataLocation(data)
          }
          }
          show={() => {
            setShowMap(false)
          }} />
      }

      {
        showMap === true ? null :
          <FormCard>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Field>
                  <Label htmlFor="title">Tiêu đề:</Label>
                  <TextField id="title" name="title" />
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="title"
                    render={({ message }) => <ErrorText>{message}</ErrorText>}
                  />
                </Field>

                <Field>
                  <Label htmlFor="content">Nội dung:</Label>
                  <TextArea id="content" name="content" />
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="content"
                    render={({ message }) => <ErrorText>{message}</ErrorText>}
                  />
                </Field>

                <Field>
                  <Label htmlFor="timeLimit">Giới hạn thời gian vote:</Label>
                  <SelectBox
                    id="timeLimit"
                    name="timeLimit"
                    data={[
                      {
                        label: '10 phút',
                        value: 10,
                      },
                      {
                        label: '15 phút',
                        value: 15,
                      },
                      {
                        label: '20 phút',
                        value: 20,
                      },
                    ]}
                  />
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="timeLimit"
                    render={({ message }) => <ErrorText>{message}</ErrorText>}
                  />
                </Field>

                <Field>
                  <Label htmlFor="addresses">Danh sách địa điểm ăn chơi:</Label>

                  {renderListLocation()}

                  <List name="addresses" />

                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="addresses"
                    render={({ message }) => <ErrorText>{message}</ErrorText>}
                  />
                </Field>

                <ButtonGroup>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      prevStep()
                    }}
                  >
                    Trước đó
                  </Button>

                  <Button type="submit" variant="primary">
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

Step2.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
