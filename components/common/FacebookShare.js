import { FacebookIcon, FacebookShareButton } from 'react-share'
import PropTypes from 'prop-types'

function FacebookShare({ sharedLink, title, memberCount }) {
  const message =
    memberCount === 0 ? 'Chưa có thành viên nào tham gia' : `Đã có ${memberCount} thành viên đang tham gia`
  return (
    <FacebookShareButton url={sharedLink} quote={`Tiêu đề: ${title} | ${message}`}>
      <div className="flex items-center">
        <span className="mr-2 text-xl font-semibold">Chia sẻ qua Facebook:</span>
        <FacebookIcon size={64} round={true} />
      </div>
    </FacebookShareButton>
  )
}

FacebookShare.propTypes = {
  sharedLink: PropTypes.string.isRequired,
  title: PropTypes.string,
  memberCount: PropTypes.number,
}

FacebookShare.defaultProps = {
  sharedLink: '',
  title: 'Cùng vote địa điểm nào',
  memberCount: 0,
}

export default FacebookShare
