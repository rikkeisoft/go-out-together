import { FacebookIcon, FacebookShareButton } from 'react-share'

interface FacebookShareProps {
  sharedLink: string
  title?: string
  memberCount?: number
}

function FacebookShare({
  sharedLink,
  title = 'Cùng vote địa điểm nào',
  memberCount = 0,
}: FacebookShareProps): JSX.Element {
  const message =
    memberCount === 0 ? 'Chưa có thành viên nào tham gia' : `Đã có ${memberCount} thành viên đang tham gia`
  return (
    <FacebookShareButton url={sharedLink} quote={`Chủ đề: ${title} | ${message}`}>
      <div className='flex items-center'>
        <span className='mr-2 text-xl font-semibold'>Chia sẻ qua Facebook:</span>
        <FacebookIcon size={64} round={true} />
      </div>
    </FacebookShareButton>
  )
}

export default FacebookShare
