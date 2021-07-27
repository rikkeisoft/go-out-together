import { memo } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import Center from 'components/common/Center'
import MessageText from 'components/common/MessageText'

const Step3 = memo(() => {
  return (
    <>
      <Head>
        <title>Bước 3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center>
        <MessageText>Địa chỉ được vote nhiều nhất là Địa điểm 1 ( 25 người vote)</MessageText>
      </Center>
    </>
  )
})

Step3.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  backwardStep: PropTypes.func,
}

Step3.defaultProps = {}

export default Step3
