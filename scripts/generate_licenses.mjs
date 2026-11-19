// Writes public/legal/licenses.html with the licence of every package that
// ships inside the app, plus the font licences. Runs before every build.
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const tree = JSON.parse(execSync('npm ls --omit=dev --all --json', { encoding: 'utf8', maxBuffer: 1 << 26 }))
const seen = new Map()
const walk = (deps = {}) => {
  for (const [name, info] of Object.entries(deps)) {
    if (!info.version || seen.has(name)) continue
    seen.set(name, info.version)
    walk(info.dependencies)
  }
}
walk(tree.dependencies)

const entries = [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, version]) => {
  const dir = path.join('node_modules', name)
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
  const licenseFile = fs.readdirSync(dir).find((f) => /^(licen[sc]e|copying)(\.|$)/i.test(f))
  const text = licenseFile ? fs.readFileSync(path.join(dir, licenseFile), 'utf8') : ''
  const license = typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? 'See package'
  return { name, version, license, text }
})

const sections = entries
  .map(({ name, version, license, text }) => `<section><h2>${escape(name)} ${escape(version)}</h2><p class="lic">${escape(license)}</p>${text ? `<pre>${escape(text.trim())}</pre>` : ''}</section>`)
  .join('\n')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Third-party licences · Boulder Quest</title>
<link rel="stylesheet" href="legal.css">
</head>
<body>
<main>
<h1>Third-party licences</h1>
<p>Boulder Quest is built with the open-source software listed below. Each package keeps its own licence, reproduced here as the licences require. The fonts Bricolage Grotesque and Figtree are used under the SIL Open Font License 1.1, included in their package entries. The logo, sounds, card texts and game design belong to Boulder Quest; the two sound effects were synthesised for the game.</p>
${sections}
</main>
</body>
</html>
`

fs.mkdirSync('public/legal', { recursive: true })
fs.writeFileSync('public/legal/licenses.html', html)
console.log(`Wrote public/legal/licenses.html (${entries.length} packages)`)
