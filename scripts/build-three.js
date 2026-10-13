// Arma vendor/three-mascot.min.js: solo las partes de three.js que usa la mascota 3D (escena,
// luces, cámara, animaciones y el cargador de modelos .glb), como script clásico que deja
// window.GymThree. Se carga recién al abrir la mascota (no pesa en el arranque de la app).
// Uso: node scripts/build-three.js (después de actualizar three con npm).
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'vendor', 'three-mascot.min.js');
const version = require(path.join(ROOT, 'node_modules', 'three', 'package.json')).version;

const entry = `
import { WebGLRenderer, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, AnimationMixer, Clock, Box3, Vector3, LoopOnce, LoopRepeat, SRGBColorSpace } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
window.GymThree = { WebGLRenderer, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, AnimationMixer, Clock, Box3, Vector3, LoopOnce, LoopRepeat, SRGBColorSpace, GLTFLoader };
`;

esbuild.buildSync({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'js' },
    bundle: true,
    format: 'iife',
    minify: true,
    target: ['chrome90', 'firefox90', 'safari15'],
    legalComments: 'none',
    outfile: OUT,
    banner: { js: `/* three.js r${version.split('.')[1]} (https://threejs.org) · MIT License · Copyright © 2010-2026 three.js authors. Subconjunto armado con scripts/build-three.js */` }
});
console.log(`${path.relative(ROOT, OUT)}: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
