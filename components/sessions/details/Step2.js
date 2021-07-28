import { memo, useEffect, useState } from 'react'
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
// import DirectionRoutes from 'components/common/DirectionRoutes'

const schema = yup.object().shape({
  votedAddress: yup.mixed().required('Chọn địa điểm'),
})

const Step2 = memo(({ formData, prevStep, nextStep }) => {
  const [showMap, setShowMap] = useState(false)
  // const [showDirectionRoutes, setShowDirectionRoutes] = useState(false)
  const [listDataLocation, setListDataLocation] = useState(null)

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const [addresses, setAddresses] = useState([
    {
      label: 'Địa điểm 1 (2 người vote)',
      value: 'Địa điểm 1',
      amountVote: 0,
    },
    {
      label: 'Địa điểm 2 (34 người vote)',
      value: 'Địa điểm 2',
    },
    {
      label: 'Địa điểm 3 (34 người vote)',
      value: 'Địa điểm 3',
    },
  ])
  
  const title = 'Đi ăn lẩu'
  const content = 'Đi ăn lẩu ngày nghỉ'
  const members = ['Nguyễn Tiến Báo', 'Bùi Thị Nhàn', 'Nguyễn Văn Trung', 'Đặng Tiến Hùng']

  console.log(formData)

  useEffect(() => {

    // const addAddress = (address) => {
    //   const newAddresses = addresses.slice()
    //   newAddresses.push(address)
    //   setAddresses(newAddresses)
    // }
  }, [listDataLocation])

  const deleteAddress = (index) => {
    const newAddresses = addresses.slice()
    newAddresses.splice(index, 1)
    setAddresses(newAddresses)
  }

  const onSubmit = () => {
    nextStep()
  }

  // const handleShowDirectionRoutes = () => {
  //   setShowMap(true)
  //   if (showDirectionRoutes) {
  //     return (
  //       <DirectionRoutes />
  //     )
  //   }
  // }

  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {
        showMap && <MapBox
          data={(data) => {
            setListDataLocation(data)
          }
          }
          show={() => {
            setShowMap(false)
          }} />
      }

      {
        showMap === true ? null : (
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
                  </Field>

                  <Field>
                    <Label htmlFor="votedAddress">Chọn địa điểm ăn chơi:</Label>
                    <RadioList name="votedAddress" data={addresses} onDelete={deleteAddress} />
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
        )

      }
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
