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
import DetailIcon from 'components/icons/DetailIcon'
// import Popup from 'components/common/Popup'
import { useRouter } from 'next/router'

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
  const [dataOldSessions, setDataOldSessions] = useState([])
  // // const [openPopup, setOpenPopup] = useState(false)
  // const [idDetail, setIdDetail] = useState('')

  const updateSessionCreatorMutation = useMutation(updateSessionCreator)

  const defaultValues = Object.assign({}, formData, {
    name: cookies.username,
  })
  const uid = cookies.uid
  const { data: oldSessions, isLoading } = useQuery([queryKeys.GET_OLD, { uid }], () => getOldSessions({ uid }), {
    retry: 1,
  })

  useEffect(() => {
    if (!isLoading) {
      oldSessions?.data?.sort((a, b) => b.id - a.id)
      setDataOldSessions(oldSessions)
    }
  }, [uid, isLoading])

  console.log('dataOldSessions', dataOldSessions)
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
  const router = useRouter()

  // let itemDetail = {}
  // if (idDetail) {
  //   const findIdex = oldSessions?.data.findIndex((item) => item.id === idDetail)
  //   if (findIdex > -1) {
  //     itemDetail = oldSessions?.data[findIdex]
  //   }
  // }

  return (
    <>
      <Head>
        <title>Bước 1</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isToggleView ? (
        <>
          <div className="flex justify-center text-xl font-bold">Thông tin các nhóm đã tham gia</div>
          <div className="md:w-8/12 mt-8 mx-auto border-gray-200">
            <table className="min-w-full break-all bg-white border-r text-center table-auto">
              <thead className="bg-gray-800 text-white ">
                <tr className=" sm:table-row  ">
                  <th className="w-2/6   py-3 px-4 uppercase font-semibold text-sm border-r">ID Nhóm</th>
                  <th className="w-3/6  py-3 px-4 uppercase font-semibold text-sm border-r">Tiêu đề</th>
                  <th className="w-1/6  py-3 px-4 uppercase font-semibold text-sm border-r"></th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="flex justify-center items-center py-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dataOldSessions?.data?.length !== 0 &&
                  dataOldSessions?.data?.map((item, index)  => (
                    <tr className=" sm:table-row border" key={index}>
                      <td className="p-3 border-r"> {item.sid}</td>
                      <td className="p-3 border-r"> {item.title}</td>
                      <td className="p-3 border-r">
                        <span
                          title="Chi tiết"
                          className="cursor-pointer"
                          onClick={() => {
                            router.replace(`/sessions/${item.sid}`)
                            // setIdDetail(item.id)
                            // setOpenPopup(true)
                          }}
                        >
                          <DetailIcon />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <ButtonGroup>
              <Button type="submit" variant="primary" onClick={() => setIsToggleView(!isToggleView)}>
                Tạo nhóm
              </Button>
            </ButtonGroup>
          </div>
        </>
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
                <ButtonGroup>
                  <Button type="button" variant="primary" onClick={() => setIsToggleView(!isToggleView)}>
                    {isToggleView ? 'Tạo nhóm' : 'Quay lại'}
                  </Button>
                </ButtonGroup>
                {!isToggleView ? (
                  <ButtonGroup>
                    <Button type="submit" variant="primary" onClick={() => {}}>
                      Tiếp theo
                    </Button>
                  </ButtonGroup>
                ) : null}
              </div>
            </form>
          </FormProvider>
        </div>
      )}
      {/* {idDetail ? (
        <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
          <div className="bg-black text-white  font-bold text-center py-2 mb-2">Thông tin của sessions</div>
          <div>
            <p>
              <span className="font-bold mr-2">Tiêu đề:</span>
              {itemDetail.title}
            </p>
            <p>
              <span className="font-bold mr-2">Nội dung:</span>
              {itemDetail.content}
            </p>
            <p>
              <span className="font-bold mr-2">ID Nhóm:</span>
              {itemDetail.sid}
            </p>
            <p>
              <span className="font-bold mr-2">Kết quả vote:</span>
              {itemDetail.result || '---'}
            </p>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="dark" type="button" onClick={() => setOpenPopup(false)}>
              Đóng
            </Button>
          </div>
        </Popup>
      ) : null} */}
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
