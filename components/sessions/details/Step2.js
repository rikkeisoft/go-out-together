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

import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  getAllAddresses,
  getSessionDetails,
  updateSessionAddresses,
  deleteSessionAddress,
  voteSession,
  getSessionResult,
} from 'api/sessions'
import Center from 'components/common/Center'
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
import Popup from 'components/common/Popup'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import FacebookShare from 'components/common/FacebookShare'

const socket = socketIOClient(process.env.NEXT_PUBLIC_SOCKET_IO_URL)

const schema = yup.object().shape({
  votedAddress: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step2 = memo(({ sid }) => {
  const [cookies] = useCookies()
  const [showMap, setShowMap] = useState(false)
  const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  const [voteAddress, setVoteAddress] = useState(null)
  const [locations, setLocations] = useState({
    userLocation: {},
    listUserLocation: [],
  })
  const sharedLink = process.env.NEXT_PUBLIC_BASE_URL + urls.SESSIONS + '/' + sid + '/0'
  const { data: voteResult } = useQuery([queryKeys.GET_SESSION_RESULT, { sid }], () => getSessionResult({ sid }))

  const queryClient = useQueryClient()
  const { isLoading: isLoadingList, mutateAsync } = useMutation((address) => updateSessionAddresses(address), {
    onSuccess: () => socket.emit('add_location'),
  })
  const { isLoading: isLoadingAdress, mutateAsync: deleteAsync } = useMutation((info) => deleteSessionAddress(info), {
    onSuccess: () => socket.emit('delete_location'),
  })
  const { data: addressData } = useQuery([queryKeys.GET_ADDRESS, { sid }], () => getAllAddresses({ sid }), { retry: 1 })

  useEffect(() => {
    const isSessionExpired = JSON.parse(sessionStorage.getItem('isSessionExpired'))
    let newUserLocation = {}

    if (addressData && addressData?.data.length !== 0) {
      const newListUserLocations = addressData?.data.map((location) => ({
        userId: location.userId,
        name: location.username,
        address: location.name,
        coordinates: [location.longitude, location.latitude],
      }))
      if (!isSessionExpired) {
        const userLocation = addressData?.data.find((location) => location.userId === cookies.uid)
        newUserLocation = {
          userId: userLocation.userId,
          name: userLocation.username,
          address: userLocation.name,
          coordinates: [userLocation.longitude, userLocation.latitude],
        }
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
      router.push(`${urls.SESSIONS}/${sid}/3`)
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
    const prevVotedAddress = JSON.parse(localStorage.getItem('votedAddress'))
    if (prevVotedAddress && prevVotedAddress.id === data.votedAddress.id) {
      router.push(`${urls.SESSIONS}/${sid}/3`)
    } else {
      localStorage.setItem('votedAddress', JSON.stringify(data.votedAddress))
      sessionStorage.setItem('voted', 'true')
      voteSessionMutation.mutate({
        sid: sid,
        uid: cookies.uid,
        aid: data.votedAddress.aid,
      })
    }
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
  const router = useRouter()

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
      {!(new Date(data?.data?.expireTime).getTime() > new Date().getTime()) ? (
        <Center>
          <MessageText>
            <p className="mt-3">Địa điểm được vote nhiều nhất</p>
            {(voteResult?.data?.length !== 0 &&
              voteResult?.data?.addresses?.map((address) => (
                <p key={address[0].aid} className="text-red-500 mt-2">
                  {address[0].name} ({voteResult.data.voters} người vote)
                </p>
              ))) ||
              '---'}
          </MessageText>
        </Center>
      ) : null}
      {!showMap && isSuccess && data.messageCode === messageCodes.SUCCESS && (
        <div className="p-1 md:mx-auto w-full md:w-5/6 md:mt-10 transition duration-500">
          <div className="flex flex-col lg:flex-row lg:justify-between border-b-2 border-fuchsia-600  pt-6">
            <div>
              <MessageText>Tiêu đề: {data.data.title}</MessageText>
              <MessageText>Nội dung: {data.data.content}</MessageText>
            </div>
            <div>
              {new Date(data?.data?.expireTime).getTime() > new Date().getTime() ? (
                <MessageText>
                  Vote sẽ kết thúc sau:
                  <span className="text-red-500 ml-1">
                    <Countdown
                      date={new Date(data.data.expireTime)}
                      onComplete={() => {
                        alert('Rất tiếc , đã hết thời gian vote')
                        router.push(`${urls.SESSIONS}/${sid}/3`)
                      }}
                    />
                  </span>
                </MessageText>
              ) : (
                <MessageText>Session đã kết thúc</MessageText>
              )}
            </div>
            <div>
              <MessageText>
                <p>Các thành viên đang tham gia:</p> <MemberList members={data.data.members} />
              </MessageText>
            </div>
            <Popup isOpen={showDirectionRoutes} onRequestClose={() => setShowDirectionRoutes(false)}>
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
            </Popup>
          </div>
          {new Date(data?.data?.expireTime).getTime() > new Date().getTime() ? (
            <FacebookShare sharedLink={sharedLink} title={data.data.title} memberCount={data.data.members.length} />
          ) : null}

          <div className="px-1 pt-4">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {data.data.addresses.length >= 5 ? (
                  <p className="text-red-500 text-xl">Chỉ giới hạn tối đa 5 địa điểm!</p>
                ) : (
                  new Date(data?.data?.expireTime).getTime() > new Date().getTime() && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        setShowMap(true)
                      }}
                    >
                      Thêm địa điểm
                    </Button>
                  )
                )}
                <LoadingOverlay isOpen={isLoadingList} message="Đang thêm địa điểm..." />
                <Field>
                  <Label htmlFor="votedAddress">
                    {new Date(data?.data?.expireTime).getTime() > new Date().getTime() ? (
                      <p className="text-xl text-black-600 font-bold my-4">Chọn địa điểm ăn chơi:</p>
                    ) : (
                      <p className="text-xl text-black-600 font-bold my-4">Các địa điểm ăn chơi:</p>
                    )}
                  </Label>
                  <AddressVoter
                    name="votedAddress"
                    showDelete={new Date(data?.data?.expireTime).getTime() > new Date().getTime()}
                    data={data.data.addresses}
                    onOpenModalMap={(item) => {
                      setVoteAddress(item)
                      setShowDirectionRoutes(true)
                    }}
                    onClick={(item) => setVoteAddress(item)}
                    onDelete={deleteAddress}
                  />
                  <LoadingOverlay isOpen={isLoadingAdress} message="Đang Xóa địa điểm vote" />
                  {!_.isNil(methods.formState.errors.votedAddress) &&
                    new Date(data?.data?.expireTime).getTime() > new Date().getTime() && (
                      <ErrorText>
                        {' '}
                        <p className="font-bold">Chọn địa chỉ để vote</p>
                      </ErrorText>
                    )}
                </Field>
                {new Date(data.data.expireTime).getTime() > new Date().getTime() ? (
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
                      Tiếp theo
                    </Button>
                    <LoadingOverlay isOpen={voteSessionMutation.isLoading} message="Đang xử lí..." />
                  </ButtonGroup>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      router.back()
                    }}
                  >
                    Quay lại
                  </Button>
                )}
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </>
  )
})

Step2.propTypes = {
  sid: PropTypes.any,
}

Step2.defaultProps = {}

export default Step2
