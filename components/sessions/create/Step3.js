import { memo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Center from 'components/common/Center'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import urls from 'consts/urls'
import CopyableLink from 'components/common/CopyableLink'
import FacebookShare from 'components/common/FacebookShare'

const Step3 = memo(({ formData, setFormData }) => {
  const router = useRouter()
  const sid = sessionStorage.getItem('sid')
  sessionStorage.getItem('isAdmin') && sessionStorage.removeItem('isAdmin')
  sessionStorage.getItem('redirectToOldSession') && sessionStorage.removeItem('redirectToOldSession')

  const sharedLink = process.env.NEXT_PUBLIC_BASE_URL + urls.SESSIONS + '/' + sid + '/0'
  // const sharedLink = 'https://rikkeisoft-go-out-together.vercel.app' + urls.SESSIONS + '/' + sid + '/0'

  return (
    <>
      <Head>
        <title>Bước 3</title>
        <link rel="icon" href="/favicon.ico" />
        {/* <meta
          name="description"
          content="Bạn chưa biết làm sao để có thể chọn địa điểm vui chơi cùng bạn bè? Hãy sử dụng ngay Go out together!"
        />
        <meta property="og:description" content="Go out together for entertainment" key="ogdesc" />
        <meta property="og:title" content="Go out together" key="ogtitle" />
        <meta property="og:url" content="https://rikkeisoft-go-out-together.vercel.app" key="ogurl" />
        <meta
          key="ogimage"
          property="og:image"
          content="https://images.unsplash.com/photo-1629659740606-66c36a82cc24?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
        /> */}
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

        <FacebookShare sharedLink={sharedLink} title={formData.title} />
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
