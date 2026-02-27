import Link from 'next/link'

export default function Forbidden() {
  return (
    <div>
      <h2>Access Denied</h2>
      <p>You don not have permission to access this resource.</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}