import { memo, useEffect, useState } from 'react'
import Head from 'next/head'
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
import FormCard from '../..//common/FormCard'
import Field from '../..//common/Field'
import Label from '../..//common/Label'
import TextField from '../..//common/TextField'
import SelectBox from '../..//common/SelectBox'
import ErrorText from '../..//common/ErrorText'
import ButtonGroup from '../..//common/ButtonGroup'
import Button from '../..//common/Button'
import TextArea from '../..//common/TextArea'
import List from '../..//common/List'
import MapBox from '../..//common/MapBox'
import SmallTitle from '../..//common/SmallTitle'
import LoadingOverlay from '../..//common/LoadingOverlay'
import router from 'next/router'
import urls from 'consts/urls'
import { Address, CreateSessionParams } from 'lib/interfaces'

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

interface StepProps {
  formData: {}
  setFormData: (props?: CreateSessionParams) => unknown
}

const Step2 = memo(({ formData, setFormData }: StepProps) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [listDataLocation, setListDataLocation] = useState(null)
  const { isSuccess, isLoading, data, mutateAsync } = useMutation(createSession)
  const sid = sessionStorage.getItem('sid')

  const methods = useForm<CreateSessionParams>({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const onSubmit = async (data: CreateSessionParams) => {
    setFormData(Object.assign({}, formData, data))
    if (sessionStorage.getItem('sid')) {
      router.push(`${urls.SESSIONS_CREATE}/3`)
    } else {
      await mutateAsync({
        uid: cookies.uid,
        title: data.title,
        content: data.content,
        timeLimit: data.timeLimit,
        addresses: data.addresses,
      })
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('checkOldSession')) sessionStorage.removeItem('checkOldSession')
    if (sessionStorage.getItem('redirectToOldSession')) sessionStorage.removeItem('redirectToOldSession')
  }, [])

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
    if (isSuccess) {
      if (data.messageCode === messageCodes.SUCCESS) {
        sessionStorage.setItem('sid', data.data.sid)
        router.push(`${urls.SESSIONS_CREATE}/3`)
      } else {
        alert(data.message)
      }
    }
  }, [isSuccess])

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
                  <p className="mb-2 text-black-600 font-bold">Tiêu đề:</p>
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
                  <p className="mb-2 text-black-600 font-bold">Nội Dung:</p>
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
                    {
                      label: '1 tiếng',
                      value: 60,
                    },
                    {
                      label: '2 tiếng',
                      value: 120,
                    },
                    {
                      label: '1 ngày',
                      value: 1440,
                    },
                    {
                      label: '2 ngày',
                      value: 2880,
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
                    router.back()
                  }}
                >
                  Trước đó
                </Button>

                <Button type="submit" variant="primary">
                  {sid ? 'Tiếp theo' : 'Tạo nhóm'}
                </Button>
              </ButtonGroup>
            </form>
          </FormProvider>
        </FormCard>
      )}
      <LoadingOverlay isOpen={isLoading} message="Đang xử lí..." />
      <ToastContainer />
    </>
  )
})

export default Step2
