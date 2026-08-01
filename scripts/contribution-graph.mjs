// Renders the public contribution calendar for a GitHub account as an SVG, in
// GitHub's own palette, in both dark and light variants.
//
//   node scripts/contribution-graph.mjs [username]
//
// Output: assets/contributions-dark.svg, assets/contributions-light.svg
// No dependencies. Reads the same public fragment the profile page uses.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const USER = process.argv[2] ?? 'filip-jovanov-h4h'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')

const CELL = 11
const GAP = 3
const STEP = CELL + GAP
const PAD = 8
const LEFT = 30 // weekday labels
const TOP = 20 // month labels
const FOOT = 26 // caption

const THEMES = {
  light: {
    bg: 'none',
    levels: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    text: '#57606a',
    strong: '#1f2328',
  },
  dark: {
    bg: 'none',
    levels: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    text: '#8b949e',
    strong: '#e6edf3',
  },
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

async function fetchCalendar(user) {
  const res = await fetch(`https://github.com/users/${user}/contributions`, {
    headers: { 'user-agent': 'Mozilla/5.0 (profile-readme contribution graph)' },
  })
  if (!res.ok) throw new Error(`contributions fetch failed: ${res.status}`)
  const html = await res.text()

  const days = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g)].map(
    (m) => ({ date: m[1], level: Number(m[2]) }),
  )
  // Some markup orders the attributes the other way round.
  if (!days.length) {
    days.push(
      ...[...html.matchAll(/data-level="(\d)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g)].map((m) => ({
        date: m[2],
        level: Number(m[1]),
      })),
    )
  }
  if (!days.length) throw new Error('no contribution cells found; markup may have changed')

  const totalMatch = html.match(/([\d,]+)\s+contributions?/i)
  const total = totalMatch ? totalMatch[1] : null

  days.sort((a, b) => (a.date < b.date ? -1 : 1))
  return { days, total }
}

function render({ days, total }, themeName) {
  const t = THEMES[themeName]
  const first = new Date(days[0].date + 'T00:00:00Z')
  // Grid starts on the Sunday of the first week.
  const start = new Date(first)
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())

  const col = (d) => Math.floor((d - start) / (7 * 86400000))
  const weeks = col(new Date(days[days.length - 1].date + 'T00:00:00Z')) + 1

  const W = LEFT + weeks * STEP + PAD
  const H = TOP + 7 * STEP + FOOT

  const parts = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${total ?? ''} contributions by @${USER} in the last year">`,
  )
  parts.push(
    `<style>text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;font-size:9px;fill:${t.text}}.c{font-size:11px}.s{fill:${t.strong}}</style>`,
  )

  // Month labels, placed at the first column of each month.
  let lastMonth = -1
  for (const d of days) {
    const dt = new Date(d.date + 'T00:00:00Z')
    if (dt.getUTCMonth() !== lastMonth && dt.getUTCDate() <= 7) {
      lastMonth = dt.getUTCMonth()
      const x = LEFT + col(dt) * STEP
      if (x < W - 24) parts.push(`<text x="${x}" y="${TOP - 7}">${MONTHS[lastMonth]}</text>`)
    }
  }

  // Weekday labels.
  for (const [row, label] of [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']]) {
    parts.push(`<text x="0" y="${TOP + row * STEP + CELL - 1}">${label}</text>`)
  }

  // Cells.
  for (const d of days) {
    const dt = new Date(d.date + 'T00:00:00Z')
    const x = LEFT + col(dt) * STEP
    const y = TOP + dt.getUTCDay() * STEP
    parts.push(
      `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" ry="2" fill="${t.levels[d.level]}"><title>${d.date}</title></rect>`,
    )
  }

  // Caption and legend.
  const capY = TOP + 7 * STEP + 17
  if (total) {
    parts.push(
      `<text class="c s" x="0" y="${capY}">${total} contributions in the last year</text>`,
    )
  }
  const legendW = 5 * STEP + 80
  let lx = W - legendW
  parts.push(`<text x="${lx}" y="${capY}">Less</text>`)
  lx += 26
  for (const c of t.levels) {
    parts.push(
      `<rect x="${lx}" y="${capY - 9}" width="${CELL}" height="${CELL}" rx="2" ry="2" fill="${c}"/>`,
    )
    lx += STEP
  }
  parts.push(`<text x="${lx + 2}" y="${capY}">More</text>`)

  parts.push('</svg>')
  return parts.join('')
}

const data = await fetchCalendar(USER)
mkdirSync(OUT, { recursive: true })
for (const theme of Object.keys(THEMES)) {
  const svg = render(data, theme)
  writeFileSync(join(OUT, `contributions-${theme}.svg`), svg)
  console.log(`assets/contributions-${theme}.svg  ${svg.length} bytes`)
}
console.log(`${data.days.length} days, total "${data.total}", user @${USER}`)
