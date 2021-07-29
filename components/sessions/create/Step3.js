import { memo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Center from 'components/common/Center'
import FormCard from 'components/common/FormCard'
import Button from 'components/common/Button'
import MessageText from 'components/common/MessageText'
import urls from 'consts/urls'
import ButtonGroup from 'components/common/ButtonGroup'
import CopyableLink from 'components/common/CopyableLink'

const Step3 = memo(({ shareLink, setFormData, backwardStep }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Bước 3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center>
        <MessageText>Chia sẻ link với bạn bè để họ tham gia vote</MessageText>
        <CopyableLink
          text={shareLink}
          onClick={() => {
            router.push(shareLink)
          }}
        >
          {shareLink}
        </CopyableLink>
      </Center>
      <FormCard>
        <ButtonGroup>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              router.push(urls.HOME)
            }}
          >
            Về trang chủ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setFormData()
              backwardStep()
            }}
          >
            Tạo nhóm mới
          </Button>
        </ButtonGroup>
      </FormCard>
    </>
  )
})

Step3.propTypes = {
  shareLink: PropTypes.string,
  setFormData: PropTypes.func,
  backwardStep: PropTypes.func,
}

Step3.defaultProps = {}

export default Step3
