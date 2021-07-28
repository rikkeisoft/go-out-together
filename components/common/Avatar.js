import Image from 'next/image'

export default function Avatar({ imgURL, username }) {
  return <Image src={imgURL} alt={username} width={50} height={50} className="rounded-full cursor-pointer" />
}
