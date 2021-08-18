import { memo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { checkSession } from 'api/sessions'
import LoadingOverlay from 'components/common/LoadingOverlay'
import router from 'next/router'
import urls from 'consts/urls'

const Step0 = memo(({ sid, uid, setStep }) => {
  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid, uid }], () =>
    checkSession({ sid, uid }),
  )

  if (sessionStorage.getItem('isAdmin')) {
    router.back()
  }

  useEffect(() => {
    if (isSuccess) {
      if (data.messageCode === messageCodes.SUCCESS) {
        if (!data.data.canVote) {
          // if (!data.data.voted) {
          //   alert('Rất tiếc, đã hết thời gian vote')
          // }
          router.push(`${urls.SESSIONS}/${sid}/2`)
          setStep(2)
          return
        }

        if (data.data.voted) {
          router.push(`${urls.SESSIONS}/${sid}/3`)
          setStep(3)
          return
        }

        if (data.data.isCreator) {
          sessionStorage.setItem('isAdmin', 'true')
          router.push(`${urls.SESSIONS}/${sid}/2`)
          setStep(2)
        } else {
          router.push(`${urls.SESSIONS}/${sid}/1`)
          setStep(1)
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
  setStep: PropTypes.func,
}

Step0.defaultProps = {}

export default Step0
