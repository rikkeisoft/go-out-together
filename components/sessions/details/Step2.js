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

const schema = yup.object().shape({
  votedAddress: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step2 = memo(({ sid, prevStep, nextStep }) => {
  const voteSessionMutation = useMutation(voteSession)
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
    onSuccess: () => queryClient.invalidateQueries(queryKeys.SESSION_DETAIL),
  })
  const { mutateAsync: deleteAsync } = useMutation((info) => deleteSessionAddress(info), {
    onSuccess: () => queryClient.invalidateQueries(queryKeys.SESSION_DETAIL),
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

  const methods = useForm({
    resolver: yupResolver(schema),
  })

  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid }], () => getSessionDetails({ sid }))

  const onSubmit = (data) => {
    console.log(data)
    voteSessionMutation.mutate({
      sid: sid,
      uid: cookies.uid,
      address: data.votedAddress,
    })
  }

  useEffect(() => {
    if (voteSessionMutation.isSuccess) {
      if (voteSessionMutation.data.messageCode === messageCodes.SUCCESS) {
        nextStep()
      } else {
        alert(voteSessionMutation.data.message)
      }
    }
  }, [voteSessionMutation.isSuccess])

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
          <MessageText>
            Vote sẽ kết thúc sau:
            <Countdown
              date={new Date(data.data.expireTime)}
              onComplete={() => {
                alert('Rất tiếc , đã hết thời gian vote')
                nextStep()
              }}
            />
          </MessageText>
          <MessageText>Tiêu đề: {data.data.title}</MessageText>
          <MessageText>Nội dung: {data.data.content}</MessageText>
          <MessageText>
            Các thành viên đang tham gia: <MemberList members={data.data.members} />
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
                  <Label htmlFor="votedAddress">Chọn địa điểm ăn chơi:</Label>
                  <AddressVoter
                    name="votedAddress"
                    data={data.data.addresses}
                    onClick={(item) => {
                      setVoteAddress(item)
                      setShowDirectionRoutes(true)
                    }}
                    onDelete={deleteAddress}
                  />
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
