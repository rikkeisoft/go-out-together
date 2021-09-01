import { yupResolver } from '@hookform/resolvers/yup'
import {
  deleteSessionAddress,
  getAllAddresses,
  getSessionDetails,
  getSessionResult,
  updateSessionAddresses,
  voteSession,
} from 'api/sessions'
import messageCodes from 'consts/messageCodes'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import { Address, Location } from 'lib/interfaces'
import { SocketContext } from 'lib/SocketContext'
import _ from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import Countdown from 'react-countdown'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as yup from 'yup'
import bgList from '../../../consts/backgroundList.json'
import AddressVoter from '../../common/AddressVoter'
import Button from '../../common/Button'
import ButtonGroup from '../../common/ButtonGroup'
import Center from '../../common/Center'
import DirectionRoutes from '../../common/DirectionRoutes'
import ErrorText from '../../common/ErrorText'
import FacebookShare from '../../common/FacebookShare'
import Field from '../../common/Field'
import Label from '../../common/Label'
import LoadingOverlay from '../../common/LoadingOverlay'
import MemberList from '../../common/MemberList'
import MessageText from '../../common/MessageText'
import Popup from '../../common/Popup'

const MapBox = lazy(() => import('../../common/MapBox'))

const schema = yup.object().shape({
  votedAddress: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

interface Step2Props {
  sid: string
  onChangeBg: (newBgClassname: string) => void
}

interface FormProps {
  votedAddress: Address
}

const Step2 = memo(({ sid, onChangeBg }: Step2Props) => {
  const { socket } = useContext(SocketContext)
  const [cookies] = useCookies()
  const [openSelectBgPopup, setOpenSelectBgPopup] = useState(false)
  const [backgroundList, setBackgroundList] = useState(bgList)
  const [showMap, setShowMap] = useState(false)
  const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  const [voteAddress, setVoteAddress] = useState(null)
  const [locations, setLocations] = useState({
    userLocation: {},
    listUserLocation: [],
  })
  // get vote result
  const sharedLink = process.env.NEXT_PUBLIC_BASE_URL + urls.SESSIONS + '/' + sid + '/0'
  const { data: voteResult } = useQuery([queryKeys.GET_SESSION_RESULT, { sid }], () => getSessionResult({ sid }))

  // add new locations to session
  const queryClient = useQueryClient()
  const { isLoading: isLoadingList, mutateAsync } = useMutation(updateSessionAddresses, {
    onSuccess: () => {
      socket.emit('new_user_coming', sid)
      socket.emit('add_location', sid)
    },
  })
  // delete a location
  const { isLoading: isLoadingAdress, mutateAsync: deleteAsync } = useMutation(deleteSessionAddress, {
    onSuccess: () => {
      socket.emit('new_user_coming', sid)
      socket.emit('delete_location', sid)
    },
  })
  // get all users's address
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
      socket.emit('new_user_coming', sid)
      socket.emit('vote')
      router.push(`${urls.SESSIONS}/${sid}/3`)
    },
    onError: () => alert('An error happen...'),
  })

  const methods = useForm({
    resolver: yupResolver(schema),
  })

  // get all session's detail
  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid }], () => getSessionDetails({ sid }))
  const isSessionNotExpired = new Date(data?.data?.expireTime).getTime() > new Date().getTime()

  // socketio
  useEffect(() => {
    // new user come
    if (sid) {
      socket.emit('new_user_coming', sid)
    }
    return () => {
      socket.off('new_user_coming')
    }
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

    // get new bgclassname
    socket.on('change_new_bg_image', (newBgClassname) => onChangeBg(newBgClassname))

    return () => {
      socket.offAny()
    }
  })

  const onSubmit = (data: FormProps) => {
    const prevVotedAddress: Address = JSON.parse(localStorage.getItem('votedAddress'))
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

  const handleOnAddLocation = async (newLocations: Location[]) => {
    if (newLocations.length === 0) return
    const newData = newLocations.map((location) => ({
      aid: location.id,
      name: location.place_name,
      longitude: location.center[0],
      latitude: location.center[1],
      uuid: cookies.uid,
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

  const deleteAddress = async (addressId: number) => {
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
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {showMap && (
        <Suspense fallback={<div>Loading...</div>}>
          <MapBox
            listAddress={data.data.addresses}
            data={(data: Location[]) => {
              handleOnAddLocation(data)
            }}
            show={() => {
              setShowMap(false)
            }}
          />
        </Suspense>
      )}
      <LoadingOverlay isOpen={isLoading} message='Đang lấy thông tin session...' />
      {!isSessionNotExpired ? (
        <Center>
          <MessageText>
            <p className='mt-3'>Địa điểm được vote nhiều nhất</p>
            {(voteResult?.data?.addresses?.length !== 0 &&
              voteResult?.data?.addresses?.map((address) => (
                <p key={address.aid} className='text-red-500 mt-2'>
                  {address.name} ({voteResult.data.voters} người vote)
                </p>
              ))) ||
              '---'}
          </MessageText>
        </Center>
      ) : null}
      {!showMap && isSuccess && data.messageCode === messageCodes.SUCCESS && (
        <div className='p-1 md:mx-auto w-full md:w-5/6 md:mt-10 transition duration-500'>
          <div className='flex flex-col lg:flex-row lg:justify-between border-b-2 border-fuchsia-600  pt-6'>
            <div>
              <MessageText>Tiêu đề: {data.data.title}</MessageText>
              <MessageText>Nội dung: {data.data.content}</MessageText>
            </div>
            <div>
              {isSessionNotExpired ? (
                <MessageText>
                  Vote sẽ kết thúc sau:
                  <span className='text-red-500 ml-1'>
                    <Countdown
                      date={new Date(data.data.expireTime)}
                      onComplete={() => {
                        alert('Rất tiếc , đã hết thời gian vote')
                        localStorage.removeItem('votedAddress')
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
          {isSessionNotExpired ? (
            <div className='mt-2 flex flex-col md:flex-row items-center justify-between'>
              <FacebookShare sharedLink={sharedLink} title={data.data.title} memberCount={data.data.members.length} />
              <Button type='button' variant='primary' onClick={() => setOpenSelectBgPopup(true)}>
                Đổi ảnh nền
              </Button>
            </div>
          ) : null}

          <div className='px-1 pt-4'>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {data.data.addresses.length >= 5 ? (
                  <p className='text-red-500 text-xl'>Chỉ giới hạn tối đa 5 địa điểm!</p>
                ) : (
                  isSessionNotExpired && (
                    <Button
                      type='button'
                      variant='primary'
                      onClick={() => {
                        setShowMap(true)
                      }}
                    >
                      Thêm địa điểm
                    </Button>
                  )
                )}
                <LoadingOverlay isOpen={isLoadingList} message='Đang thêm địa điểm...' />
                <Field>
                  <Label htmlFor='votedAddress'>
                    {isSessionNotExpired ? (
                      <p className='text-xl text-black-600 font-bold my-4'>Chọn địa điểm ăn chơi:</p>
                    ) : (
                      <p className='text-xl text-black-600 font-bold my-4'>Các địa điểm ăn chơi:</p>
                    )}
                  </Label>
                  <AddressVoter
                    name='votedAddress'
                    showDelete={isSessionNotExpired}
                    data={data.data.addresses}
                    onOpenModalMap={(item) => {
                      setVoteAddress(item)
                      setShowDirectionRoutes(true)
                    }}
                    onClick={(item) => setVoteAddress(item)}
                    onDelete={deleteAddress}
                  />
                  <LoadingOverlay isOpen={isLoadingAdress} message='Đang xóa địa điểm...' />
                  {!_.isNil(methods.formState.errors.votedAddress) && isSessionNotExpired && (
                    <ErrorText>
                      {' '}
                      <p className='font-bold'>Chọn địa chỉ để vote</p>
                    </ErrorText>
                  )}
                </Field>
                {new Date(data.data.expireTime).getTime() > new Date().getTime() ? (
                  <ButtonGroup>
                    <Button
                      type='button'
                      variant='danger'
                      onClick={() => {
                        router.back()
                      }}
                    >
                      Trước đó
                    </Button>
                    <Button type='submit' variant='primary'>
                      Vote ngay
                    </Button>
                    <LoadingOverlay isOpen={voteSessionMutation.isLoading} message='Đang xử lí...' />
                  </ButtonGroup>
                ) : (
                  <Button
                    type='button'
                    variant='danger'
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
      <Popup isOpen={openSelectBgPopup} onRequestClose={() => setOpenSelectBgPopup(false)}>
        <div>
          <h2 className='mb-4 text-xl font-bold'>Hãy chọn một hình bên dưới:</h2>
          <div className='px-4 h-96 overflow-y-auto flex flex-col md:flex-row md:items-center md:justify-between md:flex-wrap'>
            {backgroundList.map((bg) => (
              <p key={bg.imgSrc} className='w-full md:w-4/12 mb-4 flex items-center justify-center'>
                <img
                  src={bg.imgSrc}
                  alt='bg'
                  className={
                    bg.selected
                      ? 'w-full h-full md:w-3/5 md:h-64 border-4 border-blue-600 cursor-pointer'
                      : 'w-full h-full md:w-3/5 md:h-64 cursor-pointer hover:border-4 hover:border-blue-600'
                  }
                  onClick={() => {
                    const index = backgroundList.findIndex((ele) => ele.bgClassname === bg.bgClassname)
                    const newBackgroundList = backgroundList.map((ele) => ({ ...ele, selected: false }))
                    setBackgroundList([
                      ...newBackgroundList.slice(0, index),
                      { ...newBackgroundList[index], selected: true },
                      ...newBackgroundList.slice(index + 1),
                    ])
                  }}
                />
              </p>
            ))}
          </div>
          <div className='mt-4 flex items-center justify-around'>
            <Button type='button' variant='danger' onClick={() => setOpenSelectBgPopup(false)}>
              Hủy
            </Button>
            <Button
              type='button'
              variant='primary'
              onClick={() => {
                const selectedBg = backgroundList.find((ele) => ele.selected === true)
                onChangeBg(`${selectedBg.bgClassname} bg`)
                setOpenSelectBgPopup(false)
              }}
            >
              Xong
            </Button>
          </div>
        </div>
      </Popup>
    </>
  )
})

export default Step2
