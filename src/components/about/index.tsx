import { Link } from 'components/link'

export const About: React.FC = () => {
  return (
    <div className="space-y-4">
      <section>
        <ul className="space-y-2 text-center">
          <li>
            <Link href="https://github.com/brettinternet/tabbed">
              View source
            </Link>
          </li>
          <li>
            Authored by <Link href="https://brett.cloud">Brett</Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
