import { DAYS, TIMES } from './constants'

export default function WeekGrid({ renderCell, onMouseDown, onMouseEnter, onMouseUp }) {
  return (
    <div
      className="overflow-auto flex-1 min-h-0 rounded-xl border select-none"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        className="grid min-w-[540px]"
        style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
      >
        {/* Day headers */}
        <div className="sticky top-0 z-10 bg-background border-b h-9" />
        {DAYS.map(day => (
          <div key={day}
            className="sticky top-0 z-10 bg-background border-b border-l h-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Time rows */}
        {TIMES.map(time => (
          <div key={time} className="contents">
            <div className="border-b flex items-center justify-end pr-2 text-[11px] text-muted-foreground h-8">
              {time}
            </div>
            {DAYS.map(day => (
              <div
                key={`${day}-${time}`}
                onMouseDown={() => onMouseDown?.(day, time)}
                onMouseEnter={() => onMouseEnter?.(day, time)}
                className="border-b border-l h-8 relative"
              >
                {renderCell?.(day, time)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
