import { memo, useState } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
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
import DirectionRoutes from 'components/common/DirectionRoutes'

const schema = yup.object().shape({
  votedAddress: yup.mixed().required('Chọn địa điểm'),
})

const Step2 = memo(({ formData, prevStep, nextStep }) => {
  const [showMap, setShowMap] = useState(false)
  const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  const [voteAddress, setVoteAddress] = useState(null)
  const [listDataLocation, setListDataLocation] = useState(null)

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const [addresses, setAddresses] = useState([
    {
      label: 'Địa điểm 1 (0 người vote)',
      value: 'Địa điểm 1',
      amountVote: 0,
    },
    {
      label: 'Địa điểm 2 (44 người vote)',
      value: 'Địa điểm 2',
      amountVote: 4,
    },
    {
      label: 'Địa điểm 3 (2 người vote)',
      value: 'Địa điểm 3',
      amountVote: 2,
    },
    {
      label: 'Địa điểm 2 (44 người vote)',
      value: 'Địa điểm 2',
      amountVote: 4,
    },
  ])

  const expListUserLocation = [
    {
      label: 'Khách sạn Cầu Giấy (0 người vote)',
      value: 'Khách sạn Cầu Giấy',
      amountVote: 0,
      coordinates: [105.8, 21.0333],
    },
    {
      label: 'Đại học Quốc Gia (2 người vote)',
      value: 'Đại học Quốc Gia',
      amountVote: 2,
      coordinates: [105.782214, 21.037867],
    },
    {
      label: 'Bên xe Mỹ Đình (4 người vote)',
      value: 'Bên xe Mỹ Đình',
      amountVote: 4,
      coordinates: [105.777909, 21.028412],
    },
  ]

  console.log(listDataLocation)
  // console.log(voteAddress)

  const title = 'Đi ăn lẩu'
  const content = 'Đi ăn lẩu ngày nghỉ'
  const members = ['Nguyễn Tiến Báo', 'Bùi Thị Nhàn', 'Nguyễn Văn Trung', 'Đặng Tiến Hùng']

  const deleteAddress = (index) => {
    const newAddresses = addresses.slice()
    newAddresses.splice(index, 1)
    setAddresses(newAddresses)
  }

  const onSubmit = () => {
    nextStep()
  }

  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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

      {showDirectionRoutes && (
        <DirectionRoutes
          currentLocation={formData}
          listUserLocation={expListUserLocation}
          destination={voteAddress}
          showMap={() => {
            setShowDirectionRoutes(false)
          }}
        />
      )}

      {(showMap || showDirectionRoutes) === true ? null : (
        <>
          <MessageText>Tiêu đề: {title}</MessageText>
          <MessageText>Nội dung: {content}</MessageText>
          <MessageText>
            Các thành viên đang tham gia: <MemberList members={members} />
          </MessageText>
          <FormCard>
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
          </FormCard>
        </>
      )}
    </>
  )
})

Step2.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
