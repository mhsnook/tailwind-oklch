// Copies the @tailwindcss/browser runtime build into public/ so the REPL page's
// preview iframe can load it (it compiles Tailwind + tailwind-oklch at runtime,
// which is what lets the REPL accept any class with no build-time generation).
// Run automatically by predev/prebuild; the output is gitignored.
import { copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = fileURLToPath(
	new URL('../node_modules/@tailwindcss/browser/dist/index.global.js', import.meta.url)
)
const destDir = fileURLToPath(new URL('../public', import.meta.url))
const dest = fileURLToPath(new URL('../public/tw-browser.js', import.meta.url))

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log('copied @tailwindcss/browser → public/tw-browser.js')
