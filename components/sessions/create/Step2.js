import { memo } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import _ from 'lodash'
import { ErrorMessage } from '@hookform/error-message'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import TextField from 'components/common/TextField'
import SelectBox from 'components/common/SelectBox'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import TextArea from 'components/common/TextArea'
import List from 'components/common/List'

const schema = yup.object().shape({
  title: yup.string().required('Nhập vào tiêu đề'),
  content: yup.string().required('Nhập vào nội dung'),
  timeLimit: yup.string().required('Chọn giới hạn thời gian vote'),
  addresses: yup.array().min(1, 'Chọn địa chỉ'),
})

const Step2 = memo(({ formData, setFormData, prevStep, nextStep }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const onSubmit = (data) => {
    setFormData(Object.assign({}, formData, data))
    nextStep()
  }

  const addAddress = (address) => {
    let addresses = methods.watch('addresses')
    if (!Array.isArray(addresses)) {
      addresses = []
    }
    addresses.push(address)
    methods.setValue('addresses', addresses, { shouldValidate: true })
  }

  return (
    <>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FormCard>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor="title">Tiêu đề:</Label>
              <TextField id="title" name="title" />
              <ErrorMessage
                errors={methods.formState.errors}
                name="title"
                render={({ message }) => <ErrorText>{message}</ErrorText>}
              />
            </Field>

            <Field>
              <Label htmlFor="content">Nội dung:</Label>
              <TextArea id="content" name="content" />
              <ErrorMessage
                errors={methods.formState.errors}
                name="content"
                render={({ message }) => <ErrorText>{message}</ErrorText>}
              />
            </Field>

            <Field>
              <Label htmlFor="timeLimit">Giới hạn thời gian vote:</Label>
              <SelectBox
                id="timeLimit"
                name="timeLimit"
                data={[
                  {
                    label: '10 phút',
                    value: 10,
                  },
                  {
                    label: '15 phút',
                    value: 15,
                  },
                  {
                    label: '20 phút',
                    value: 20,
                  },
                ]}
              />
              <ErrorMessage
                errors={methods.formState.errors}
                name="timeLimit"
                render={({ message }) => <ErrorText>{message}</ErrorText>}
              />
            </Field>

            <Field>
              <Label htmlFor="addresses">Danh sách địa điểm ăn chơi:</Label>
              <div className="py-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    addAddress('Cầu giấy')
                  }}
                >
                  Thêm địa điểm từ bản đồ
                </Button>
              </div>
              <List name="addresses" />

              <ErrorMessage
                errors={methods.formState.errors}
                name="addresses"
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
