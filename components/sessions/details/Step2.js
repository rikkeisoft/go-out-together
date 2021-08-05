import {
  memo,
  useEffect,
  // useState
} from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import _ from 'lodash'
import { useCookies } from 'react-cookie'
import { useQuery, useMutation } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { getSessionDetails, voteSession } from 'api/sessions'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import AddressVoter from 'components/common/AddressVoter'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import MemberList from 'components/common/MemberList'
// import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'
// import DirectionRoutes from 'components/common/DirectionRoutes'

const schema = yup.object().shape({
  votedAddress: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

const Step2 = memo(({ sid, prevStep, nextStep }) => {
  const [cookies] = useCookies()
  // const [showMap, setShowMap] = useState(false)
  // const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  // const [listDataLocation, setListDataLocation] = useState(null)

  const voteSessionMutation = useMutation(voteSession)

  const methods = useForm({
    resolver: yupResolver(schema),
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

  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid }], () => getSessionDetails({ sid }))

  const deleteAddress = (aid) => {
    console.log(aid)
  }

  const onSubmit = (data) => {
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
  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* {showMap && (
        <MapBox
          data={(data) => {
            setListDataLocation(data)
          }}
          show={() => {
            setShowMap(false)
          }}
        />
      )} */}
      {/* {showDirectionRoutes && (
        <DirectionRoutes
          currentLocation={formData}
          listUserLocation={expListUserLocation}
          destination={votedAddress}
          showMap={() => {
            setShowDirectionRoutes(false)
          }}
        />
      )} */}
      <LoadingOverlay isOpen={isLoading} message="Đang lấy thông tin session..." />

      {isSuccess && data.messageCode === messageCodes.SUCCESS && (
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
                        // setShowMap(true)
                      }}
                    >
                      Thêm địa điểm
                    </Button>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="votedAddress">Chọn địa điểm ăn chơi:</Label>
                  <AddressVoter name="votedAddress" data={data.data.addresses} onDelete={deleteAddress} />
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
