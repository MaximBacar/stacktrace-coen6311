import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Section from './Section'

const MAX_PX = 512 // client-side pre-downscale before sending

function resizeAndEncode(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
        const w = Math.round(img.width  * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width  = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PhotoSection({ initials, avatarB64, onAvatarChange }) {
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please choose an image under 5 MB.')
      return
    }
    const b64 = await resizeAndEncode(file)
    onAvatarChange(b64)
    e.target.value = ''
  }

  return (
    <Section title="Photo" description="This will be displayed on your profile and in the sidebar.">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarImage src={avatarB64 || ''} />
            <AvatarFallback className="rounded-xl text-base">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera size={16} strokeWidth={1.5} className="text-white" />
          </button>
        </div>
        <div>
          <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => inputRef.current?.click()}>
            Upload photo
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or WebP · max 5 MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>
    </Section>
  )
}
