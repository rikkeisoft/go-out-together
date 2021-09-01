import { getSessionResult } from 'api/sessions'
import messageCodes from 'consts/messageCodes'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import _ from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { memo } from 'react'
import Countdown from 'react-countdown'
import { useQuery } from 'react-query'
import Button from '../../common/Button'
import Center from '../../common/Center'
import LoadingOverlay from '../../common/LoadingOverlay'
import MessageText from '../../common/MessageText'

interface Step3Props {
  sid: string
  setFormData: (props?: any) => unknown
}

const Step3 = memo(({ sid, setFormData }: Step3Props) => {
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
                <p key={address.aid} className="text-red-500">
                  {address.name} ({data.data.voters} người vote)
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

export default Step3
