import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Section from './Section'

export default function PhotoSection({ initials }) {
  return (
    <Section title="Photo" description="This will be displayed on your profile and in the sidebar.">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarImage src="" />
            <AvatarFallback className="rounded-xl text-base">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera size={16} strokeWidth={1.5} className="text-white" />
          </button>
        </div>
        <div>
          <Button type="button" variant="outline" size="sm" className="text-xs h-8">
            Upload photo
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or WebP · max 2 MB</p>
        </div>
      </div>
    </Section>
  )
}
