import { memo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { checkSession } from 'api/sessions'
import LoadingOverlay from 'components/common/LoadingOverlay'
import router from 'next/router'
import urls from 'consts/urls'

const Step0 = memo(({ sid, uid }) => {
  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid, uid }], () =>
    checkSession({ sid, uid }),
  )

  if (sessionStorage.getItem('isAdmin') || sessionStorage.getItem('redirectToOldSession')) {
    router.back()
  }

  useEffect(() => {
    if (isSuccess) {
      if (data.messageCode === messageCodes.SUCCESS) {
        if (sessionStorage.getItem('checkOldSession')) {
          sessionStorage.setItem('redirectToOldSession', 'true')
        }
        sessionStorage.setItem('isSessionExpired', JSON.stringify(!data.data.canVote))

        if (!data.data.isCreator && data.data.canVote) {
          router.push(`${urls.SESSIONS}/${sid}/1`)
        } else if (data.data.isCreator || !data.data.canVote || sessionStorage.getItem('voted')) {
          if (data.data.isCreator) {
            sessionStorage.setItem('isAdmin', 'true')
          }
          router.push(`${urls.SESSIONS}/${sid}/2`)
          return
        } else if (data.data.voted) {
          router.push(`${urls.SESSIONS}/${sid}/3`)
          return
        }
      } else {
        alert(data.messsage)
      }
    }
  }, [isSuccess, isLoading])

  return <LoadingOverlay isOpen={isLoading} message="Đang kiểm tra thông tin người dùng..." />
})

Step0.propTypes = {
  sid: PropTypes.string,
  uid: PropTypes.string,
}

Step0.defaultProps = {}

export default Step0
