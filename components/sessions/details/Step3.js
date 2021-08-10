import { memo } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useQuery } from 'react-query'
import Countdown from 'react-countdown'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { getSessionResult } from 'api/sessions'
import Center from 'components/common/Center'
import MessageText from 'components/common/MessageText'
import LoadingOverlay from 'components/common/LoadingOverlay'

const Step3 = memo(({ sid }) => {
  const { isLoading, isSuccess, data, refetch } = useQuery([queryKeys.GET_SESSION_RESULT, { sid }], () =>
    getSessionResult({ sid }),
  )
  let resultElement = <></>
  if (isSuccess && data.messageCode === messageCodes.SUCCESS) {
    if (data.data?.expireTime) {
      resultElement = (
        <Center>
          <MessageText>
            Vui lòng đợi kết quả sau:
            <Countdown
              date={new Date(data.data.expireTime)}
              onComplete={() => {
                setTimeout(() => {
                  refetch()
                }, 800)
              }}
            />
          </MessageText>
        </Center>
      )
    } else {
      if (_.isNil(data.data.addresses)) {
        resultElement = (
          <Center>
            <MessageText>Không có địa điểm nào được vote</MessageText>
          </Center>
        )
      } else {
        resultElement = (
          <Center>
            <MessageText>
              Địa điểm được vote nhiều nhất là
              {data.data.addresses.map((address) => (
                <p key={address[0].aid}>
                  {address[0].name} ({data.data.voters} người vote)
                </p>
              ))}
            </MessageText>
          </Center>
        )
      }
    }
  }
  return (
    <>
      <Head>
        <title>Bước 3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoadingOverlay isOpen={isLoading} message="Đang lấy thông tin session..." />
      {resultElement}
    </>
  )
})

Step3.propTypes = {
  sid: PropTypes.string,
}

Step3.defaultProps = {}

export default Step3
