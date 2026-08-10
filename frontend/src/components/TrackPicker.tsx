import { TRACKS } from '../data/tracks'

interface TrackPickerProps {
  selectedTrackId: string
  onSelect: (id: string) => void
  label?: string
}

export function TrackPicker({ selectedTrackId, onSelect, label }: TrackPickerProps) {
  return (
    <div 
      className="checkbox-list" 
      role="radiogroup" 
      aria-label={label || 'Select a track'}
    >
      {TRACKS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={selectedTrackId === t.id}
          className={`checkbox-row ${selectedTrackId === t.id ? 'checkbox-row-active' : ''}`}
          onClick={() => onSelect(t.id)}
        >
          <span className="checkbox-row-text">
            <span className="checkbox-row-title">{t.title}</span>
            <span className="checkbox-row-description">{t.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
