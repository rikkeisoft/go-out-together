import { memo, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Center from '../../common/Center'
import Button from '../../common/Button'
import MessageText from '../../common/MessageText'
import urls from 'consts/urls'
import CopyableLink from '../../common/CopyableLink'
import FacebookShare from '../../common/FacebookShare'

interface Step3Props {
  formData: { title?: string }
  setFormData: (params?: unknown) => unknown
}

const Step3 = memo(({ formData, setFormData }: Step3Props) => {
  const router = useRouter()
  const sid = sessionStorage.getItem('sid')
  const sharedLink = process.env.NEXT_PUBLIC_BASE_URL + urls.SESSIONS + '/' + sid + '/0'

  useEffect(() => {
    sessionStorage.getItem('isAdmin') && sessionStorage.removeItem('isAdmin')
    sessionStorage.getItem('redirectToOldSession') && sessionStorage.removeItem('redirectToOldSession')
  }, [])

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

export default Step3
