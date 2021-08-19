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
import Button from 'components/common/Button'
import { useRouter } from 'next/router'
import urls from 'consts/urls'

const Step3 = memo(({ sid, setFormData }) => {
  const { isLoading, isSuccess, data, refetch } = useQuery([queryKeys.GET_SESSION_RESULT, { sid }], () =>
    getSessionResult({ sid }),
  )
  const votedAddress = JSON.parse(localStorage.getItem('votedAddress'))
  const voted = sessionStorage.getItem('voted')
  const router = useRouter()

  let resultElement = <></>
  if (isSuccess && data.messageCode === messageCodes.SUCCESS) {
    if (data.data?.expireTime) {
      resultElement = (
        <Center>
          {votedAddress && (
            <h4 className="text-xl my-3 font-semibold">
              Bạn đã vote cho địa điểm: <span className="text-2xl font-bold text-red-500">{votedAddress.name}</span>
            </h4>
          )}
          <MessageText>
            Đợi kết quả sau:{' '}
            <span className="text-red-500 text-2xl">
              <Countdown
                date={new Date(data.data.expireTime)}
                onComplete={() => {
                  localStorage.removeItem('votedAddress')
                  refetch()
                }}
              />
            </span>
          </MessageText>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              voted ? router.back() : router.push(`${urls.SESSIONS}/${sid}/2`)
            }}
          >
            Chọn lại
          </Button>
        </Center>
      )
    } else {
      if (_.isNil(data.data.addresses)) {
        resultElement = (
          <Center>
            <MessageText>
              <span className="text-red-500">Không có địa điểm nào được vote</span>
            </MessageText>
          </Center>
        )
      } else {
        resultElement = (
          <Center>
            <MessageText>
              Địa điểm được vote nhiều nhất là
              {data.data.addresses.map((address) => (
                <p key={address[0].aid} className="text-red-500">
                  {address[0].name} ({data.data.voters} người vote)
                </p>
              ))}
            </MessageText>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setFormData()
                sessionStorage.removeItem('redirectURL')
                router.push(`${urls.SESSIONS_CREATE}/1`)
              }}
            >
              Tạo nhóm mới
            </Button>
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
