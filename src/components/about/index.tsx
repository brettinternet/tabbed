import { Link } from 'components/link'

export const About: React.FC = () => {
  return (
    <div className="space-y-4">
      <p>
        <Link href="https://github.com/brettinternet/tabbed">Source</Link>
      </p>
      <p>
        Made with ❤️ by <Link href="https://brett.cloud">Brett</Link>.
      </p>
    </div>
  )
}
