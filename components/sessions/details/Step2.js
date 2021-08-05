import { memo, useEffect, useState } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import { useCookies } from 'react-cookie'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { getAllAddresses, getSessionDetails, updateSessionAddresses, deleteSessionAddress } from 'api/sessions'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import RadioList from 'components/common/RadioList'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import MemberList from 'components/common/MemberList'
import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'
import DirectionRoutes from 'components/common/DirectionRoutes'

const schema = yup.object().shape({
  sessionId: yup.string().required(),
  userId: yup.string().required(),
  votedAddress: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step2 = memo(({ sid, prevStep, setVoteResult }) => {
  const [cookies] = useCookies(['uid'])
  const [showMap, setShowMap] = useState(false)
  const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  const [voteAddress, setVoteAddress] = useState(null)
  const [locations, setLocations] = useState({
    userLocation: {},
    listUserLocation: [],
  })

  const { isLoading, isSuccess, data } = useQuery([queryKeys.SESSION_DETAIL, { sid }], () => getSessionDetails({ sid }))

  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation((address) => updateSessionAddresses(address), {
    onSuccess: () => queryClient.invalidateQueries(queryKeys.SESSION_DETAIL),
  })
  const { mutateAsync: deleteAsync } = useMutation((info) => deleteSessionAddress(info), {
    onSuccess: () => queryClient.invalidateQueries(queryKeys.SESSION_DETAIL),
  })
  const { data: addressData } = useQuery([queryKeys.GET_ADDRESS, { sid }], () => getAllAddresses({ sid }), { retry: 1 })

  useEffect(() => {
    if (addressData && addressData?.data.length !== 0) {
      const newListUserLocations = addressData?.data.map((location) => ({
        name: location.username,
        address: location.name,
        coordinates: [location.longitude, location.latitude],
      }))

      const userLocation = addressData?.data.find((location) => location.userId === cookies.uid)
      const newUserLocation = {
        name: userLocation.username,
        address: userLocation.name,
        coordinates: [userLocation.longitude, userLocation.latitude],
      }
      setLocations({
        userLocation: newUserLocation,
        listUserLocation: newListUserLocations,
      })
    }
  }, [addressData])

  // const defaultValues = Object.assign({}, formData, {
  //   sessionId: sid,
  //   userId: cookies.uid,
  // })
  const methods = useForm({
    resolver: yupResolver(schema),
    // defaultValues: defaultValues,
  })

  // const expListUserLocation = [
  //   {
  //     label: 'Khách sạn Cầu Giấy (0 người vote)',
  //     value: 'Khách sạn Cầu Giấy',
  //     amountVote: 0,
  //     coordinates: [105.8, 21.0333],
  //   },
  //   {
  //     label: 'Đại học Quốc Gia (2 người vote)',
  //     value: 'Đại học Quốc Gia',
  //     amountVote: 2,
  //     coordinates: [105.782214, 21.037867],
  //   },
  // ]

  const handleOnAddLocation = async (newLocations) => {
    const newData = newLocations.map((location) => ({
      aid: location.id,
      name: location.place_name,
      longitude: location.center[0],
      latitude: location.center[1],
    }))

    try {
      await mutateAsync({
        sid,
        addresses: newData,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      await deleteAsync({
        addressId,
        sid,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmit = async () => {
    // setFormData(Object.assign({}, formData, data))
    // joinSessionMutation.mutate({
    //   sid: sid,
    //   uid: cookies.uid,
    //   name: data.name,
    //   address: data.address,
    // })
    setVoteResult('avc')
  }

  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {showMap && (
        <MapBox
          addressCount={data.data.addresses.length}
          data={(data) => {
            handleOnAddLocation(data)
          }}
          show={() => {
            setShowMap(false)
          }}
        />
      )}
      {showDirectionRoutes && (
        <DirectionRoutes
          currentLocation={locations.userLocation}
          listUserLocation={locations.listUserLocation}
          destination={voteAddress}
          showMap={() => {
            setShowDirectionRoutes(false)
          }}
        />
      )}
      <LoadingOverlay isOpen={isLoading} message="Đang lấy thông tin session..." />

      {!showMap && isSuccess && data.messageCode === messageCodes.SUCCESS && (
        <>
          <MessageText>Tiêu đề: {data.data.title}</MessageText>
          <MessageText>Nội dung: {data.data.content}</MessageText>
          <MessageText>
            Các thành viên đang tham gia: <MemberList members={data.data.members} />
          </MessageText>
          <FormCard>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Field>
                  {data.data.addresses.length >= 5 ? (
                    <p className="text-red-500">Chỉ giới hạn tối đa 5 địa điểm!</p>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        setShowMap(true)
                        // addAddress({
                        //   label: 'Tòa nhà sông Đà (0 người vote)',
                        //   value: 'Tòa nhà sông Đà',
                        // })
                      }}
                    >
                      Thêm địa điểm
                    </Button>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="votedAddress">Chọn địa điểm ăn chơi:</Label>
                  <RadioList
                    name="votedAddress"
                    data={data.data.addresses}
                    onClick={(item) => {
                      setVoteAddress(item)
                      setShowDirectionRoutes(true)
                    }}
                    onDelete={deleteAddress}
                  />
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="votedAddress"
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
        </>
      )}
    </>
  )
})

Step2.propTypes = {
  sid: PropTypes.any,
  formData: PropTypes.object,
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
  setVoteResult: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
