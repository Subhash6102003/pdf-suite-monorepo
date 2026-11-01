import Link from 'next/link'

export default function ToolCard({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link href={href} className="group flex flex-col p-6 bg-surface border border-white/10 rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all duration-200 hover:-translate-y-1">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm flex-1">{description}</p>
      <div className="mt-4 text-primary font-medium text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        Try it →
      </div>
    </Link>
  )
}