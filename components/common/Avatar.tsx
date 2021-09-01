interface Props {
  imgURL: string
  username: string
}

export default function Avatar({ imgURL, username }: Props): JSX.Element {
  return (
    <img src={imgURL} title={username} alt={username} className='rounded-full cursor-pointer object-cover w-16 h-16' />
  )
}
