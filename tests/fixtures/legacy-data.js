// Datos SINTÉTICOS con la forma de un backup de la versión vieja (antes del esquema 2):
// sesiones con strings "12-10-8", sin uid ni updatedAt, una de fútbol y una de Tabata.
// Nunca poner acá datos reales de un usuario.

module.exports = {
    workouts: [
        {
            id: 1753300000000, date: '2026-07-24', routine: 'A1', mood: 3, notes: '',
            exercises: [
                { name: 'Press de pecho', reps: '12-10-8', weight: '50-55-60', pause: '90-90-120', note: 'subir peso' },
                { name: 'Jalón al pecho', reps: '12-12-12', weight: '40', pause: '90s', note: '' }
            ],
            startTime: '2026-07-24T20:00:00.000Z', endTime: '2026-07-24T21:00:00.000Z', duration: 60, volume: 3990, prs: []
        },
        {
            id: 1753900000000, date: '2026-07-31', routine: 'FUT', mood: 4, notes: '',
            exercises: [{ name: 'Partido de fútbol', reps: 'alta', weight: '60', pause: '', note: '' }]
        },
        { id: 1754000000000, date: '2026-08-01', type: 'tabata', duration: 4, blocks: [{ name: 'Burpees', workSec: 20, restSec: 10, rounds: 8, roundsCompleted: 8, completed: true }] }
    ],
    bodyMetrics: [
        { date: '2026-07-21', weight: 75.4, fat: 8.7, muscle: 71, water: 60.8, waist: 85 },
        { date: '2026-08-21', weight: 75, fat: null, muscle: null, water: null, waist: null }
    ],
    customRoutines: { A1: ['Press de pecho', 'Jalón al pecho'] }
};
