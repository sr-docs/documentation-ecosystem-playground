import { useState, useEffect, type MouseEvent } from 'react'
import { mediaUrl } from '../utils/media'

interface StageMediaProps {
  src: string
  label: string
  /** Optional WebVTT captions track (video only). */
  captionsSrc?: string
  /** Optional visible transcript for silent / screen-reader friendly access. */
  transcript?: string
}

const IMAGE_EXTENSIONS = ['.gif', '.png', '.jpg', '.jpeg', '.webp']

function blockMediaMenu(event: MouseEvent) {
  event.preventDefault()
}

export default function StageMedia({ src, label, captionsSrc, transcript }: StageMediaProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const resolvedSrc = mediaUrl(src)
  const isImage = IMAGE_EXTENSIONS.some((ext) => src.toLowerCase().endsWith(ext))
  const transcriptId = transcript ? `${label.replace(/\s+/g, '-').toLowerCase()}-transcript` : undefined

  if (failed) {
    return (
      <div className="media-placeholder">
        <p className="media-placeholder-label">{label}</p>
        <p className="media-placeholder-hint">
          Add a file at <code>/{src}</code> to show media here.
        </p>
        {transcript && (
          <details className="media-transcript">
            <summary>Transcript</summary>
            <p id={transcriptId}>{transcript}</p>
          </details>
        )}
      </div>
    )
  }

  if (isImage) {
    return (
      <>
        <img
          className="stage-media"
          src={resolvedSrc}
          alt={label}
          draggable={false}
          onContextMenu={blockMediaMenu}
          onError={() => setFailed(true)}
          aria-describedby={transcriptId}
        />
        {transcript && (
          <details className="media-transcript">
            <summary>Image description</summary>
            <p id={transcriptId} className="media-transcript-text">
              {transcript}
            </p>
          </details>
        )}
      </>
    )
  }

  return (
    <>
      <video
        className="stage-media"
        src={resolvedSrc}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        playsInline
        preload="metadata"
        draggable={false}
        onContextMenu={blockMediaMenu}
        onError={() => setFailed(true)}
        aria-label={label}
        aria-describedby={transcriptId}
      >
        {captionsSrc && (
          <track
            kind="captions"
            src={mediaUrl(captionsSrc)}
            srcLang="en"
            label="English"
            default
          />
        )}
        Your browser doesn't support embedded video.
      </video>
      {transcript && (
        <details className="media-transcript">
          <summary>Transcript</summary>
          <p id={transcriptId} className="media-transcript-text">
            {transcript}
          </p>
        </details>
      )}
    </>
  )
}
