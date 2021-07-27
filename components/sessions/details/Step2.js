import { memo } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import MainLayout from 'layouts/MainLayout'
import FormCard from 'components/common/FormCard'
import Field from 'components/common/Field'
import Label from 'components/common/Label'
import SelectBox from 'components/common/SelectBox'
import ErrorText from 'components/common/ErrorText'
import ButtonGroup from 'components/common/ButtonGroup'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import MemberList from 'components/common/MemberList'
import Avatar from 'boring-avatars'

const schema = yup.object().shape({
  addresses: yup.string().required('Chọn địa điểm'),
})

const Step2 = memo(({ formData, prevStep, nextStep }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  })

  const onSubmit = (data) => {
    console.log(data)
    // setFormData(Object.assign({}, formData, data));
    nextStep()
  }

  const title = 'Đi ăn lẩu'
  const content = 'Đi ăn lẩu ngày nghỉ'
  const members = ['nGuyễn Văn  Sơn ', 'pHạm Thị thúy ']

  const getNameUser = (item) => {
    const fisrtLetter = item[0]
    const lastLetter = item[item.trim().lastIndexOf(' ') + 1]
    const processName = fisrtLetter.toUpperCase() + lastLetter.toUpperCase()
    return processName
  }

  return (
    <MainLayout>
      <Head>
        <title>Bước 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MessageText>Tiêu đề: {title}</MessageText>
      <MessageText>Nội dung: {content}</MessageText>
      <MessageText>
        {/* Các thành viên đang tham gia: <MemberList members={members} /> */}
        Các thành viên đang tham gia:
        {
          members.map((item, index) => {
            return (
              <div className="inline-block ml-3" key={index}>
                <Avatar
                  size={40}
                  name="SN"
                  variant="beam"
                  colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                />
                <p className="text-center text-xs">{getNameUser(item)}</p>
              </div>
            )
          })
        }
      </MessageText>
      <FormCard>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Field>
              <Button type="button" variant="primary" onClick={() => { }}>
                Thêm địa điểm
              </Button>
            </Field>

            <Field>
              <Label htmlFor="addresses">Chọn địa điểm ăn chơi:</Label>
              <SelectBox
                id="addresses"
                name="addresses"
                data={[
                  {
                    label: 'Địa điểm 1 (2 người)',
                    value: '1-2',
                  },
                  {
                    label: 'Địa điểm 2 (30 người)',
                    value: '2-30',
                  },
                  {
                    label: 'Địa điểm 3 (2 người)',
                    value: '3-2',
                  },
                ]}
              />
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
    </MainLayout>
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
