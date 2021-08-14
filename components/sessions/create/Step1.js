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
import { getOldSessions } from 'api/sessions'
import queryKeys from 'consts/queryKeys'
import { useQuery } from 'react-query'
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
  const [isToggleView, setIsToggleView] = useState(true)
  const [isModalView, setIsModalView] = useState(true)

  const updateSessionCreatorMutation = useMutation(updateSessionCreator)

  const defaultValues = Object.assign({}, formData, {
    name: cookies.username,
  })
  const uid = cookies.uid
  const { data: oldSessions } = useQuery([queryKeys.GET_OLD, { uid }], () => getOldSessions({ uid }), { retry: 1 })
  console.log(oldSessions)

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

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isModalView ? (
        isToggleView ? (
          <div className=" mt-14 w-4/6 bg-white mt-2/5 mx-auto px-10 py-10 rounded-xl font-bold">
            {oldSessions?.data.length !== 0 &&
              oldSessions?.data.map((item) => (
                <tr key={item.uid}>
                  <td> Link group tham gia:{item.sid}</td>
                  <td> Tiêu đề:{item.title}</td>
                  <td> Nội dung:{item.content}</td>
                  <td> Kết quả vote: {item.result}</td>
                </tr>
              ))}
          </div>
        ) : showMap ? (
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
          <div className="w-full px-3 py-6 md:mt-14 md:w-6/12 md:mt-2/5 md:mx-auto md:px-10 md:py-10 font-bold">
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
          //  <LoadingOverlay isOpen={updateSessionCreatorMutation.isLoading} message="Đang xử lí..." />
        )
      ) : (
        <div className=" mt-14 w-4/6 bg-white rounded-xl mt-2/5 mx-auto px-10 py-10 ">
          <p className="font-bold">Danh sách các session đã tham gia: </p>
          <table className=" mx-auto border-collapse border border-black mt-4 ">
            <thead>
              <tr>
                <th className="border border-black w-1/2">Group ID</th>
                <th className="border border-black w-1/2 ">Title</th>
              </tr>
            </thead>
            <tbody>
              {oldSessions?.data.length !== 0 &&
                oldSessions?.data.map((item) => (
                  <tr key={item.uid}>
                    <td className="border border-black w-10 text-center"> {item.sid}</td>
                    <td className="border border-black w-10 text-center"> {item.title}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <div className=" mt-4 mx-auto w-4/6 flex justify-between">
        <Button type="button" variant="primary" onClick={() => setIsModalView(!isModalView)}>
          {isModalView ? 'List' : 'Chi tiết'}
        </Button>
        {isToggleView ? (
          <Button type="button" variant="primary" onClick={() => setIsToggleView(!isToggleView)}>
            <p>Tạo session mới</p>
          </Button>
        ) : null}
      </div>
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
