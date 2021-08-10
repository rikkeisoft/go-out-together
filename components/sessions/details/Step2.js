import { memo, useEffect, useState } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import _ from 'lodash'
import { useCookies } from 'react-cookie'
import Countdown from 'react-countdown'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import AddressVoter from 'components/common/AddressVoter'
// import { ErrorMessage } from '@hookform/error-message'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  getAllAddresses,
  getSessionDetails,
  updateSessionAddresses,
  deleteSessionAddress,
  voteSession,
} from 'api/sessions'

import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import MemberList from 'components/common/MemberList'
import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'
import DirectionRoutes from 'components/common/DirectionRoutes'
import socketIOClient from 'socket.io-client'

// const socket = socketIOClient(process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : process.env.NEXT_PUBLIC_SOCKET_IO_URL)
const socket = socketIOClient('http://localhost:8080')

const schema = yup.object().shape({
  votedAddress: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step2 = memo(({ sid, prevStep, nextStep }) => {
  const [cookies] = useCookies(['uid'])
  const [showMap, setShowMap] = useState(false)
  const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  const [voteAddress, setVoteAddress] = useState(null)
  const [locations, setLocations] = useState({
    userLocation: {},
    listUserLocation: [],
  })

  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation((address) => updateSessionAddresses(address), {
    onSuccess: () => socket.emit('add_location'),
  })
  const { mutateAsync: deleteAsync } = useMutation((info) => deleteSessionAddress(info), {
    onSuccess: () => socket.emit('delete_location'),
  })
  const { data: addressData } = useQuery([queryKeys.GET_ADDRESS, { sid }], () => getAllAddresses({ sid }), { retry: 1 })

  useEffect(() => {
    if (addressData && addressData?.data.length !== 0) {
      const newListUserLocations = addressData?.data.map((location) => ({
        userId: location.userId,
        name: location.username,
        address: location.name,
        coordinates: [location.longitude, location.latitude],
      }))

      const userLocation = addressData?.data.find((location) => location.userId === cookies.uid)
      const newUserLocation = {
        userId: userLocation.userId,
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

  const voteSessionMutation = useMutation(voteSession, {
    onSuccess: () => {
      socket.emit('vote')
      nextStep()
    },
    onError: (error) => alert(error.message),
  })

  const methods = useForm({
    resolver: yupResolver(schema),
  })

  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid }], () => getSessionDetails({ sid }))

  // socketio
  useEffect(() => {
    // new user come
    socket.emit('new_user_coming')

    return socket.off('new_user_coming')
  }, [])

  useEffect(() => {
    // get noti user come
    socket.on('refetch_sesion_detail', () => {
      queryClient.invalidateQueries(queryKeys.GET_ADDRESS)
      queryClient.invalidateQueries(queryKeys.CHECK_SESSION)
    })

    // get noti add new locations
    socket.on('refetch_add_location', () => queryClient.invalidateQueries(queryKeys.CHECK_SESSION))

    // get noti delete location
    socket.on('refetch_delete_location', () => queryClient.invalidateQueries(queryKeys.CHECK_SESSION))

    // get noti voted location
    socket.on('refetch_vote', () => queryClient.invalidateQueries(queryKeys.CHECK_SESSION))

    return socket.offAny()
  })

  const onSubmit = (data) => {
    console.log(data)
    voteSessionMutation.mutate({
      sid: sid,
      uid: cookies.uid,
      address: data.votedAddress,
    })
  }

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

  return (
    <>
    
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {showMap && (
        <MapBox
          listAddress={data.data.addresses}
          data={(data) => {
            handleOnAddLocation(data)
          }}
          show={() => {
            setShowMap(false)
          }}
        />
      )}
      <LoadingOverlay isOpen={isLoading} message="Đang lấy thông tin session..." />

      {!showMap && isSuccess && data.messageCode === messageCodes.SUCCESS && (
        <>
        <div className="italic ml-16">
          <MessageText>
            Vote sẽ kết thúc sau: 
            <span className="text-red-500 ">
            <Countdown
              date={new Date(data.data.expireTime)}
              onComplete={() => {
                alert('Rất tiếc , đã hết thời gian vote')
                nextStep()
              }}
            />
            </span>
          </MessageText>
          <MessageText>Tiêu đề: {data.data.title}</MessageText>
          <MessageText>Nội dung: {data.data.content}</MessageText>
          <MessageText>
            <p>Các thành viên đang tham gia:</p> <MemberList members={data.data.members} />
          </MessageText>
          {showDirectionRoutes && (
            
            <DirectionRoutes 
              currentLocation={locations.userLocation}
              listUserLocation={locations.listUserLocation}
              destination={{
                id: voteAddress.id,
                name: 'Destination',
                address: voteAddress.name,
                coordinates: [voteAddress.longitude, voteAddress.latitude],
              }}
              showMap={() => {
                setShowDirectionRoutes(false)
              }}
            />
         
          )}
          </div>
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
                      }}
                    >
                      Thêm địa điểm
                    </Button>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="votedAddress ">Chọn địa điểm ăn chơi:</Label>
                  <AddressVoter
                    name="votedAddress"
                    data={data.data.addresses}
                    onClick={(item) => {
                      setVoteAddress(item)
                      setShowDirectionRoutes(true)
                    }}
                    onDelete={deleteAddress}
                  />
                    <LoadingOverlay isOpen={isLoadingAdress} message="Đang Xóa địa điểm vote" />
                  {!_.isNil(methods.formState.errors.votedAddress) && <ErrorText>Chọn địa chỉ để vote</ErrorText>}
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
                  <LoadingOverlay isOpen={voteSessionMutation.isLoading} message="Đang xử lí..." />
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
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
