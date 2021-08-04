import { memo } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
// import { useForm, FormProvider } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'
// import * as yup from 'yup'
// import { ErrorMessage } from '@hookform/error-message'
// import { useCookies } from 'react-cookie'
import { useQuery } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { getSessionDetails } from 'api/sessions'
// import FormCard from 'components/common/FormCard'
// import Field from 'components/common/Field'
// import Label from 'components/common/Label'
// import RadioList from 'components/common/RadioList'
// import ErrorText from 'components/common/ErrorText'
// import ButtonGroup from 'components/common/ButtonGroup'
// import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import MemberList from 'components/common/MemberList'
// import MapBox from 'components/common/MapBox'
import LoadingOverlay from 'components/common/LoadingOverlay'
// import DirectionRoutes from 'components/common/DirectionRoutes'

// const schema = yup.object().shape({
//   votedAddress: yup.object({
//     aid: yup.string().required(),
//     name: yup.string().required(),
//     latitude: yup.number().required(),
//     longitude: yup.number().required(),
//   }),
// })

const Step2 = memo(
  ({
    sid,
    // formData, prevStep, nextStep, setVoteResult
  }) => {
    // const [cookies] = useCookies()
    // const [showMap, setShowMap] = useState(false)
    // const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
    // const [voteAddress, setVoteAddress] = useState(null)
    // const [listDataLocation, setListDataLocation] = useState(null)
    // const methods = useForm({
    //   resolver: yupResolver(schema),
    // })

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

    const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION_CREATOR, { sid }], () =>
      getSessionDetails({ sid }),
    )

    // const deleteAddress = (index) => {
    //   const address = addresses[index]
    // }

    // const onSubmit = () => {}
    return (
      <>
        <Head>
          <title>Bước 2</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {/*
      {showMap && (
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
          destination={voteAddress}
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
            {/* <FormCard>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Field>
                  {addresses.length >= 5 ? (
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
                    data={addresses}
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
          </FormCard> */}
          </>
        )}
      </>
    )
  },
)

Step2.propTypes = {
  sid: PropTypes.any,
  formData: PropTypes.object,
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
  setVoteResult: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
