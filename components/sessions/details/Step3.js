import { memo } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import Center from 'components/common/Center'
import MessageText from 'components/common/MessageText'

const Step3 = memo(({ voteResult }) => {
  return (
    <>
      <Head>
        <title>Bước 3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center>
        <MessageText>Địa chỉ được vote nhiều nhất là {voteResult}</MessageText>
      </Center>
    </>
  )
})

Step3.propTypes = {
  voteResult: PropTypes.string,
}

Step3.defaultProps = {}

export default Step3
