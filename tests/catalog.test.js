const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');

const app = loadApp();

test('el grupo probable coincide con el catálogo en todos sus ejercicios', () => {
    const groups = app('MUSCLE_GROUPS');
    const guess = app('guessMuscleGroup');
    const wrong = [];
    Object.entries(groups).forEach(([group, def]) => {
        def.exercises.forEach(name => { if (guess(name) !== group) wrong.push(`${name}: ${guess(name)} (es ${group})`); });
    });
    assert.deepEqual(wrong, []);
});

test('adivina el grupo de ejercicios en inglés (Hevy, Strong)', () => {
    const guess = app('guessMuscleGroup');
    const cases = {
        'Bench Press (Barbell)': 'Pecho', 'Incline Bench Press (Dumbbell)': 'Pecho', 'Chest Fly': 'Pecho', 'Chest Dip': 'Pecho',
        'Lat Pulldown (Cable)': 'Espalda', 'Seated Cable Row': 'Espalda', 'Pull Up': 'Espalda', 'Bent Over Row (Barbell)': 'Espalda',
        'Overhead Press (Barbell)': 'Hombros', 'Lateral Raise (Dumbbell)': 'Hombros', 'Upright Row': 'Hombros',
        'Bicep Curl (Dumbbell)': 'Bíceps', 'Hammer Curl': 'Bíceps', 'Preacher Curl': 'Bíceps',
        'Triceps Pushdown': 'Tríceps', 'Skullcrusher': 'Tríceps', 'Bench Dip': 'Tríceps', 'Triceps Dip': 'Tríceps',
        'Squat (Barbell)': 'Cuádriceps', 'Leg Press': 'Cuádriceps', 'Leg Extension (Machine)': 'Cuádriceps', 'Walking Lunge': 'Cuádriceps',
        'Lying Leg Curl (Machine)': 'Isquios', 'Romanian Deadlift (Barbell)': 'Isquios', 'Deadlift (Barbell)': 'Isquios',
        'Hip Thrust (Barbell)': 'Glúteos', 'Glute Bridge': 'Glúteos', 'Hip Abduction (Machine)': 'Glúteos',
        'Standing Calf Raise': 'Gemelos', 'Seated Calf Raise': 'Gemelos',
        'Plank': 'Core', 'Cable Crunch': 'Core', 'Hanging Leg Raise': 'Core', 'Russian Twist': 'Core',
        'Running': 'Cardio / Otro', 'Rowing Machine': 'Cardio / Otro', 'Cycling': 'Cardio / Otro', 'Saltar la soga': 'Cardio / Otro',
        // "con soga" es el agarre de polea, no saltar la soga
        'Pullover con soga': 'Espalda', 'Extensión de tríceps con soga': 'Tríceps', 'Face pull con soga': 'Espalda'
    };
    Object.entries(cases).forEach(([name, group]) => assert.equal(guess(name), group, name));
    assert.equal(guess('Movimiento raro'), null);
    assert.equal(guess(''), null);
});

test('"Piernas" elegido a mano pasa a cuádriceps o isquios según el ejercicio', () => {
    const split = app('splitLegacyLegGroup');
    assert.equal(split('Sentadilla búlgarra'), 'Cuádriceps');
    assert.equal(split('Curl femoral unilateral'), 'Isquios');
    assert.equal(split('Peso muerto rumano'), 'Isquios');
    assert.equal(split('Gemelos en máquina'), 'Gemelos');
    assert.equal(split('Ejercicio inventado'), 'Cuádriceps');
});
