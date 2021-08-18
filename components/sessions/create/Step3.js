import { memo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Center from 'components/common/Center'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import urls from 'consts/urls'
import CopyableLink from 'components/common/CopyableLink'

const Step3 = memo(({ setFormData }) => {
  const router = useRouter()
  const sid = sessionStorage.getItem('sid')
  sessionStorage.getItem('isAdmin') && sessionStorage.removeItem('isAdmin')
  sessionStorage.getItem('redirectToOldSession') && sessionStorage.removeItem('redirectToOldSession')

  const sharedLink = process.env.NEXT_PUBLIC_BASE_URL + urls.SESSIONS + '/' + sid + '/0'
  return (
    <>
      <Head>
        <title>Bước 3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center>
        <MessageText>
          {' '}
          <p className="mt-10 text-2xl">Chia sẻ link với bạn bè để họ tham gia vote</p>
        </MessageText>
        <CopyableLink
          text={sharedLink}
          onClick={() => {
            router.push(`${urls.SESSIONS}/${sid}/0`)
          }}
        >
          {sharedLink}
        </CopyableLink>
      </Center>
      <div className="mt-6 text-center">
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setFormData()
            router.push(`${urls.SESSIONS_CREATE}/1`)
          }}
        >
          Tạo nhóm mới
        </Button>
      </div>
    </>
  )
})

Step3.propTypes = {
  sid: PropTypes.string,
  setFormData: PropTypes.func,
}

Step3.defaultProps = {}

export default Step3
