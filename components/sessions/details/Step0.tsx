import { memo, useEffect } from 'react'
import { useQuery } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { checkSession } from 'api/sessions'
import LoadingOverlay from '../../common/LoadingOverlay'
import router from 'next/router'
import urls from 'consts/urls'

interface Step0Props {
  sid: string
  uid: string
}

const Step0 = memo(({ sid, uid }: Step0Props) => {
  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid, uid }], () =>
    checkSession({ sid, uid }),
  )

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') || sessionStorage.getItem('redirectToOldSession')) {
      router.back()
      return
    }
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
        alert('Sorry, an error is happen...')
      }
    }
  }, [isSuccess])

  return <LoadingOverlay isOpen={isLoading} message="Đang kiểm tra thông tin người dùng..." />
})

export default Step0
