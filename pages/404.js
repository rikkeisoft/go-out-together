import Button from 'components/common/Button'
import ArrowLeftIcon from 'components/icons/ArrowLeftIcon'
import urls from 'consts/urls'
import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  const handleGotoHomepage = async () => {
    localStorage.removeItem('redirectURL')
    router.push(urls.HOME)
  }

  return (
    <div className="pt-10 flex flex-col items-center justify-items-center">
      <h1 className="mb-5 font-semibold text-lg">Page you find is not found</h1>
      <Button type="button" variant="primary" onClick={handleGotoHomepage}>
        <ArrowLeftIcon className="w-7" />
        Về trang chủ
      </Button>
    </div>
  )
}
