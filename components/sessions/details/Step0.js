import { memo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'react-query'
import queryKeys from 'consts/queryKeys'
import messageCodes from 'consts/messageCodes'
import { checkSession } from 'api/sessions'
import LoadingOverlay from 'components/common/LoadingOverlay'

const Step0 = memo(({ sid, uid, setStep }) => {
  const { isLoading, isSuccess, data } = useQuery([queryKeys.CHECK_SESSION, { sid, uid }], () =>
    checkSession({ sid, uid }),
  )

  useEffect(() => {
    if (isSuccess) {
      if (data.messageCode === messageCodes.SUCCESS) {
        if (data.data.voted) {
          setStep(3)
          return
        }

        if (data.data.isCreator) {
          setStep(2)
        } else {
          setStep(1)
        }
      } else {
        alert(data.messsage)
      }
    }
  }, [isSuccess])

  return <LoadingOverlay isOpen={isLoading} message="Đang kiểm tra thông tin người dùng..." />
})

Step0.propTypes = {
  sid: PropTypes.string,
  uid: PropTypes.string,
  setStep: PropTypes.func,
}

Step0.defaultProps = {}

export default Step0
