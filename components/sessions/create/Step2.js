import { memo, useEffect, useState } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useCookies } from 'react-cookie'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import messageCodes from 'consts/messageCodes'
import { useMutation } from 'react-query'
import { createSession } from 'api/sessions'
import { ToastContainer } from 'react-toastify'
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
import LoadingOverlay from 'components/common/LoadingOverlay'

const schema = yup.object().shape({
  title: yup.string().required('Nhập vào tiêu đề'),
  content: yup.string().required('Nhập vào nội dung'),
  timeLimit: yup.string().required('Chọn giới hạn thời gian vote'),
  addresses: yup
    .array()
    .of(
      yup.object({
        aid: yup.string().required(),
        name: yup.string().required(),
        latitude: yup.number().required(),
        longitude: yup.number().required(),
      }),
    )
    .min(2),
})

const Step2 = memo(({ formData, setFormData, prevStep, nextStep, setSid }) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [listDataLocation, setListDataLocation] = useState(null)
  const createSessionMutation = useMutation(createSession)

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const onSubmit = (data) => {
    setFormData(Object.assign({}, formData, data))
    createSessionMutation.mutate({
      uid: cookies.uid,
      title: data.title,
      content: data.content,
      timeLimit: data.timeLimit,
      addresses: data.addresses,
    })
  }

  useEffect(() => {
    if (listDataLocation) {
      let addresses = [...methods.watch('addresses')]
      listDataLocation.forEach((item) => {
        addresses.push({
          aid: item.id,
          name: item.place_name,
          longitude: item.center[0],
          latitude: item.center[1],
        })
      })
      methods.setValue('addresses', addresses, { shouldValidate: true })
    }
  }, [listDataLocation])

  useEffect(() => {
    if (createSessionMutation.isSuccess) {
      if (createSessionMutation.data.messageCode === messageCodes.SUCCESS) {
        setSid(createSessionMutation.data.data.sid)
        nextStep()
      } else {
        alert(createSessionMutation.data.message)
      }
    }
  }, [createSessionMutation.isSuccess])

  const renderListLocation = () => {
    if (methods.getValues('addresses')) {
      if (methods.getValues('addresses').length >= 5) {
        return <p className="text-red-500 mb-5">Chỉ giới hạn nhập tối đa 5 địa điểm!</p>
      } else {
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
    } else {
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
      {showMap && (
        <MapBox
          data={(data) => {
            setListDataLocation(data)
          }}
          show={() => {
            setShowMap(false)
          }}
        />
      )}

      {showMap === true ? null : (
        <FormCard>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor="title">
                  <p className="text-black-600 font-bold">Tiêu đề:</p>
                </Label>
                <TextField id="title" name="title" />
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="title"
                  render={({ message }) => <ErrorText>{message}</ErrorText>}
                />
              </Field>

              <Field>
                <Label htmlFor="content">
                  {' '}
                  <p  className="text-black-600 font-bold">Nội Dung:</p>
                </Label>
                <TextArea id="content" name="content" />
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="content"
                  render={({ message }) => <ErrorText>{message}</ErrorText>}
                />
              </Field>

              <Field>
                <Label htmlFor="timeLimit">
                  {' '}
                  <p className="mb-2 font-bold">Giới hạn thời gian vote:</p>
                </Label>
                <SelectBox
                  id="timeLimit"
                  name="timeLimit"
                  data={[
                    {
                      label: '1 phút',
                      value: 1,
                    },
                    {
                      label: '2 phút',
                      value: 2,
                    },
                    {
                      label: '5 phút',
                      value: 5,
                    },
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
                <Label htmlFor="addresses">
                  <p className="text-xl font-bold ">Danh sách địa điểm ăn chơi:</p>
                </Label>

                {renderListLocation()}

                <List name="addresses" />

                {!_.isNil(methods.formState.errors.addresses) && <ErrorText>Chọn ít nhất 2 địa điểm</ErrorText>}
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
                  Tạo nhóm
                </Button>
              </ButtonGroup>
            </form>
          </FormProvider>
        </FormCard>
      )}
      <LoadingOverlay isOpen={createSessionMutation.isLoading} message="Đang xử lí..." />
      <ToastContainer />
    </>
  )
})

Step2.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
  setSid: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
