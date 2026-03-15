import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Search, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchCoaches } from '@/lib/api'

function CoachCard({ coach }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Coach Profile</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-900">{coach.full_name}</h2>
        </div>
        <div className="rounded-full bg-orange-100 p-3 text-orange-700">
          <UserRound className="size-5" />
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-zinc-600">
        {coach.biography}
      </p>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-900">
          <CalendarDays className="size-4 text-orange-600" />
          Availability
        </div>
        <div className="flex flex-wrap gap-2">
          {coach.availability.length > 0 ? coach.availability.map((slot) => (
            <span
              key={`${coach.id}-${slot}`}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
            >
              {slot}
            </span>
          )) : (
            <span className="text-sm text-zinc-500">No availability posted yet.</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function CoachDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const response = await fetchCoaches()
      return response.data
    },
  })

  const coaches = data ?? []
  const filteredCoaches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return coaches
    }

    return coaches.filter((coach) => {
      const haystack = [coach.full_name, coach.biography, ...(coach.availability ?? [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [coaches, searchTerm])

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_55%,#f5f5f4_100%)] px-4 py-10 text-zinc-900 md:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-orange-200 bg-white/85 p-8 shadow-[0_30px_80px_-45px_rgba(234,88,12,0.45)] backdrop-blur md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">Member Directory</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                Browse coaches by profile and schedule fit
              </h1>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                Compare coaching styles and open time slots so you can quickly spot a coach who matches your routine.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full bg-orange-600 hover:bg-orange-700">
                <Link to="/register">Become a coach</Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-8">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 rounded-full border-zinc-200 bg-white pl-11"
              placeholder="Search by coach name, bio, or availability"
            />
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-3xl bg-white/70" />
            ))}
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            We couldn&apos;t load coach profiles right now. Please try again in a moment.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="mt-8 flex items-center justify-between text-sm text-zinc-600">
              <p>{filteredCoaches.length} coach{filteredCoaches.length === 1 ? '' : 'es'} found</p>
              <p>Availability updates appear on each coach card.</p>
            </div>

            {filteredCoaches.length > 0 ? (
              <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCoaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold text-zinc-900">No coaches match that search yet</h2>
                <p className="mt-3 text-sm text-zinc-600">
                  Try another name or schedule term, or invite coaches to publish more availability.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
