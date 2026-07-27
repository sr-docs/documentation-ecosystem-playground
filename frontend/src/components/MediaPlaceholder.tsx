import { useState } from 'react'
import { mediaUrl } from '../utils/media'

interface StageMediaProps {
  src: string
  label: string
}

const IMAGE_EXTENSIONS = ['.gif', '.png', '.jpg', '.jpeg', '.webp']

export default function StageMedia({ src, label }: StageMediaProps) {
  const [failed, setFailed] = useState(false)
  const resolvedSrc = mediaUrl(src)
  const isImage = IMAGE_EXTENSIONS.some((ext) => src.toLowerCase().endsWith(ext))

  if (failed) {
    return (
      <div className="media-placeholder">
        <p className="media-placeholder-label">{label}</p>
        <p className="media-placeholder-hint">
          Add a file at <code>/{src}</code> to show media here.
        </p>
      </div>
    )
  }

  if (isImage) {
    return (
      <img
        className="stage-media"
        src={resolvedSrc}
        alt={label}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <video className="stage-media" src={resolvedSrc} controls onError={() => setFailed(true)}>
      Your browser doesn't support embedded video.
    </video>
  )
}
