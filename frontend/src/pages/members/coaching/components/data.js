export const COACHES = [
  {
    id: 'c1',
    name: 'Marcus Delacroix',
    specialty: 'Strength & Conditioning',
    bio: 'Former competitive powerlifter, 11 years coaching athletes from beginners to nationals.',
    rating: 4.9, sessions: 312, price: 65,
    tags: ['Powerlifting', 'Hypertrophy', 'Programming'],
    avatar: 'https://picsum.photos/seed/delacroix/80/80',
    slots: { Mon: ['08:00','09:30','11:00','16:00'], Tue: ['07:30','10:00','14:00'], Wed: ['08:00','13:00','17:30'], Thu: ['09:00','11:30','15:00','18:00'], Fri: ['07:00','09:00','12:30'] },
  },
  {
    id: 'c2',
    name: 'Petra Vanholt',
    specialty: 'Sports Nutrition & Performance',
    bio: 'Registered dietitian specialising in body recomposition and endurance fueling strategies.',
    rating: 4.8, sessions: 204, price: 55,
    tags: ['Nutrition', 'Endurance', 'Recomposition'],
    avatar: 'https://picsum.photos/seed/vanholt/80/80',
    slots: { Mon: ['10:00','14:00','16:30'], Wed: ['09:00','13:00'], Fri: ['08:30','11:00','15:00'] },
  },
  {
    id: 'c3',
    name: 'Yuki Tanaka',
    specialty: 'Mobility & Recovery',
    bio: 'Certified physical therapist and movement coach. Specialises in injury prevention and athletic longevity.',
    rating: 5.0, sessions: 178, price: 70,
    tags: ['Mobility', 'Recovery', 'Injury prevention'],
    avatar: 'https://picsum.photos/seed/tanaka/80/80',
    slots: { Tue: ['08:00','10:30','13:00'], Thu: ['08:30','11:00','14:30','17:00'], Sat: ['09:00','11:00'] },
  },
  {
    id: 'c4',
    name: 'Cristian Ferreira',
    specialty: 'HIIT & Endurance',
    bio: 'Triathlon coach and functional fitness specialist. Runs group and 1-on-1 programs for all levels.',
    rating: 4.7, sessions: 389, price: 50,
    tags: ['HIIT', 'Running', 'Functional'],
    avatar: 'https://picsum.photos/seed/ferreira/80/80',
    slots: { Mon: ['06:00','07:30','17:00','18:30'], Wed: ['06:00','07:30','18:00'], Fri: ['06:30','08:00','17:30'], Sat: ['08:00','10:00'] },
  },
  {
    id: 'c5',
    name: 'Amara Osei',
    specialty: 'Olympic Lifting',
    bio: 'National-level weightlifter and coach. Breaks down the snatch and clean & jerk into approachable progressions.',
    rating: 4.9, sessions: 143, price: 80,
    tags: ['Olympic lifting', 'Technique', 'Strength'],
    avatar: 'https://picsum.photos/seed/osei/80/80',
    slots: { Tue: ['09:00','11:00','15:00'], Thu: ['09:30','12:00','16:00'], Sat: ['10:00','12:00'] },
  },
]

export const INITIAL_SESSIONS = [
  { id: 's1', coachId: 'c1', coachName: 'Marcus Delacroix', specialty: 'Strength & Conditioning', day: 'Tomorrow', time: '09:00', duration: 60, avatar: 'https://picsum.photos/seed/delacroix/80/80' },
  { id: 's2', coachId: 'c3', coachName: 'Yuki Tanaka',       specialty: 'Mobility & Recovery',     day: 'Thu',      time: '14:30', duration: 45, avatar: 'https://picsum.photos/seed/tanaka/80/80'    },
]

export const DURATIONS = [30, 45, 60]