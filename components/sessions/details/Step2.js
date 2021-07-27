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

const schema = yup.object().shape({
  votedAddress: yup.mixed().required('Chọn địa điểm'),
})

const Step2 = memo(({ formData, prevStep, nextStep }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const [addresses, setAddresses] = useState([
    {
      label: 'Địa điểm 1 (2 người vote)',
      value: 'Địa điểm 1',
    },
    {
      label: 'Địa điểm 2 (34 người vote)',
      value: 'Địa điểm 2',
    },
    {
      label: 'Địa điểm 3 (34 người vote)',
      value: 'Địa điểm 3',
    },
    {
      label: 'Địa điểm 4 (4 người vote)',
      value: 'Địa điểm 4',
    },
  ])

  const addAddress = (address) => {
    const newAddresses = addresses.slice()
    newAddresses.push(address)
    setAddresses(newAddresses)
  }

  const deleteAddress = (index) => {
    const newAddresses = addresses.slice()
    newAddresses.splice(index, 1)
    setAddresses(newAddresses)
  }

  const onSubmit = (data) => {
    // setFormData(Object.assign({}, formData, data));
    nextStep()
  }

  const title = 'Đi ăn lẩu'
  const content = 'Đi ăn lẩu ngày nghỉ'
  const members = ['Nguyễn Văn Sơn', 'Châu Nhuận Phát', 'Tiêu Viêm']

  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                  addAddress({
                    label: 'Tòa nhà sông Đà (0 người vote)',
                    value: 'Tòa nhà sông Đà',
                  })
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
})

Step2.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  prevStep: PropTypes.func,
  nextStep: PropTypes.func,
}

Step2.defaultProps = {}

export default Step2
