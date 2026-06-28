import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

const outDir = join(process.cwd(), "public", "devpost")
mkdirSync(outDir, { recursive: true })

const iconRoot =
  "/tmp/leadrelay-aws-icons/pkg/Architecture-Service-Icons_04302026"

const icons = {
  aurora: `${iconRoot}/Arch_Databases/64/Arch_Amazon-Aurora_64.svg`,
  iam: `${iconRoot}/Arch_Security-Identity/64/Arch_AWS-Identity-and-Access-Management_64.svg`,
  sqs: `${iconRoot}/Arch_Application-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg`,
  s3: `${iconRoot}/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg`,
  rds: `${iconRoot}/Arch_Databases/64/Arch_Amazon-RDS_64.svg`,
  cloudwatch: `${iconRoot}/Arch_Management-Tools/64/Arch_Amazon-CloudWatch_64.svg`,
}

function dataUri(path) {
  const svg = readFileSync(path, "utf8")
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function wrap(text, max = 25) {
  const lines = []
  for (const rawLine of String(text).split("\n")) {
    const words = rawLine.split(" ")
    let current = ""
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (next.length > max && current) {
        lines.push(current)
        current = word
      } else {
        current = next
      }
    }
    if (current) lines.push(current)
  }
  return lines
}

const parts = []
function push(markup) {
  parts.push(markup)
}

function arrow(x1, y1, x2, y2, label = "", dashed = false) {
  push(`<path d="M ${x1} ${y1} L ${x2} ${y2}" class="arrow${dashed ? " dashed" : ""}"/>`)
  if (label) {
    const lx = (x1 + x2) / 2
    const ly = (y1 + y2) / 2 - 8
    push(`<text x="${lx}" y="${ly}" text-anchor="middle" class="edge-label">${esc(label)}</text>`)
  }
}

function curvedArrow(path, label = "", labelX = 0, labelY = 0, dashed = false) {
  push(`<path d="${path}" class="arrow${dashed ? " dashed" : ""}"/>`)
  if (label) {
    push(`<text x="${labelX}" y="${labelY}" text-anchor="middle" class="edge-label">${esc(label)}</text>`)
  }
}

function box({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  icon,
  accent = "#635BFF",
  fill = "#FFFFFF",
  stroke = "#D9DEE8",
  dashed = false,
  tag,
  tagPlacement = "bottom-right",
}) {
  push(`<g>`)
  push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="2"${
      dashed ? ' stroke-dasharray="8 8"' : ""
    }/>`,
  )
  push(`<rect x="${x}" y="${y}" width="7" height="${h}" rx="3.5" fill="${accent}"/>`)
  if (icon) {
    push(`<image href="${dataUri(icon)}" x="${x + 18}" y="${y + 20}" width="54" height="54"/>`)
  } else {
    push(`<circle cx="${x + 45}" cy="${y + 47}" r="27" fill="${accent}" opacity="0.12"/>`)
    push(`<circle cx="${x + 45}" cy="${y + 47}" r="12" fill="${accent}"/>`)
  }
  const tx = x + 90
  push(`<text x="${tx}" y="${y + 34}" class="box-title">${esc(title)}</text>`)
  wrap(subtitle, 30).slice(0, 3).forEach((line, index) => {
    push(`<text x="${tx}" y="${y + 58 + index * 19}" class="box-subtitle">${esc(line)}</text>`)
  })
  if (tag) {
    const tagWidth = tag.length > 7 ? 76 : 68
    const tagX = tagPlacement === "icon-bottom" ? x + 18 : x + w - tagWidth - 18
    const tagY = y + h - 38
    push(
      `<rect x="${tagX}" y="${tagY}" width="${tagWidth}" height="24" rx="12" fill="${accent}" opacity="0.12"/>`,
    )
    push(`<text x="${tagX + tagWidth / 2}" y="${tagY + 17}" text-anchor="middle" class="tag" fill="${accent}">${esc(tag)}</text>`)
  }
  push(`</g>`)
}

function smallBox({ x, y, w, h, title, subtitle, icon, accent = "#FF9900", future = false }) {
  box({
    x,
    y,
    w,
    h,
    title,
    subtitle,
    icon,
    accent,
    fill: future ? "#FFF8EE" : "#FFFFFF",
    stroke: future ? "#F4B35C" : "#D9DEE8",
    dashed: future,
    tag: future ? "Future" : undefined,
  })
}

function pillar(x, label, text) {
  push(`<g>`)
  push(`<rect x="${x}" y="1056" width="294" height="100" rx="18" fill="#F8FAFC" stroke="#D9DEE8"/>`)
  push(`<text x="${x + 18}" y="1092" class="pillar-title">${esc(label)}</text>`)
  wrap(text, 33).slice(0, 3).forEach((line, i) => {
    push(`<text x="${x + 18}" y="${1116 + i * 17}" class="pillar-text">${esc(line)}</text>`)
  })
  push(`</g>`)
}

push(`<?xml version="1.0" encoding="UTF-8"?>`)
push(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200" viewBox="0 0 1800 1200">`)
push(`<defs>
  <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
    <path d="M2,2 L10,6 L2,10 Z" fill="#475569"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.09"/>
  </filter>
  <style>
    text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
    .title{font-size:42px;font-weight:700;fill:#0F172A}
    .subtitle{font-size:18px;font-weight:400;fill:#64748B}
    .section{font-size:17px;font-weight:700;fill:#334155;text-transform:uppercase;letter-spacing:.08em}
    .box-title{font-size:21px;font-weight:700;fill:#111827}
    .box-subtitle{font-size:15px;font-weight:400;fill:#64748B}
    .tag{font-size:12px;font-weight:700}
    .edge-label{font-size:12px;font-weight:700;fill:#64748B}
    .arrow{fill:none;stroke:#475569;stroke-width:2.6;marker-end:url(#arrow)}
    .dashed{stroke-dasharray:7 7}
    .pillar-title{font-size:16px;font-weight:700;fill:#0F172A}
    .pillar-text{font-size:13px;font-weight:400;fill:#64748B}
    .label{font-size:15px;font-weight:700;fill:#334155}
  </style>
</defs>`)
push(`<rect width="1800" height="1200" fill="#F6F8FB"/>`)
push(`<text x="72" y="76" class="title">LeadRelay AI Architecture</text>`)
push(`<text x="72" y="110" class="subtitle">v0-generated full-stack B2B revenue intelligence app on Vercel with Amazon Aurora PostgreSQL persistence</text>`)
push(`<text x="1728" y="74" text-anchor="end" class="label">Reference Architecture</text>`)
push(`<text x="1728" y="101" text-anchor="end" class="subtitle">Current implementation and planned platform evolution</text>`)

push(`<rect x="54" y="150" width="1110" height="790" rx="28" fill="#FFFFFF" stroke="#D9DEE8" filter="url(#shadow)"/>`)
push(`<text x="82" y="190" class="section">Current implementation</text>`)

push(`<rect x="1200" y="150" width="540" height="790" rx="28" fill="#FFFDF7" stroke="#F4B35C" stroke-dasharray="10 9" filter="url(#shadow)"/>`)
push(`<text x="1228" y="190" class="section">Future roadmap</text>`)

push(`<rect x="730" y="322" width="390" height="430" rx="24" fill="#F8FBFF" stroke="#7AA7E8" stroke-width="2" stroke-dasharray="10 7"/>`)
push(`<text x="760" y="356" class="section">AWS</text>`)

box({
  x: 96,
  y: 235,
  w: 260,
  h: 118,
  title: "Users",
  subtitle: "Agency operators and growth teams using web browsers",
  accent: "#334155",
})
box({
  x: 430,
  y: 235,
  w: 260,
  h: 118,
  title: "Vercel Edge CDN",
  subtitle: "Static assets, caching, TLS, global delivery",
  accent: "#111827",
})
box({
  x: 96,
  y: 430,
  w: 260,
  h: 118,
  title: "v0-generated UI",
  subtitle: "Lead discovery dashboard and detail pages",
  accent: "#635BFF",
})
box({
  x: 430,
  y: 430,
  w: 260,
  h: 118,
  title: "Next.js App Router",
  subtitle: "Server components, pages, route handlers",
  accent: "#111827",
})
box({
  x: 430,
  y: 625,
  w: 260,
  h: 118,
  title: "Next.js API routes",
  subtitle: "/api/search, leads, campaigns, AI outreach",
  accent: "#0EA5E9",
})
box({
  x: 805,
  y: 420,
  w: 260,
  h: 118,
  title: "Prisma ORM",
  subtitle: "Typed access to Lead, SearchRun, Campaign models",
  accent: "#2D3748",
})
smallBox({
  x: 805,
  y: 585,
  w: 260,
  h: 118,
  title: "Aurora PostgreSQL",
  subtitle: "System of record for leads, analyses, campaigns, and market intelligence",
  icon: icons.aurora,
  accent: "#527FFF",
})
smallBox({
  x: 805,
  y: 260,
  w: 260,
  h: 118,
  title: "IAM DB Auth",
  subtitle: "Short-lived AWS auth tokens for database access",
  icon: icons.iam,
  accent: "#DD344C",
})
box({
  x: 96,
  y: 795,
  w: 260,
  h: 118,
  title: "Google Places API",
  subtitle: "Optional live local business discovery",
  accent: "#4285F4",
  dashed: true,
  tag: "Optional",
})
box({
  x: 430,
  y: 795,
  w: 300,
  h: 118,
  title: "AI Inference Provider",
  subtitle: "Current: OpenAI\nFuture: AWS Bedrock support\nAI analysis and outreach copy",
  accent: "#10A37F",
  dashed: true,
  tag: "Optional",
  tagPlacement: "icon-bottom",
})

smallBox({
  x: 1240,
  y: 245,
  w: 430,
  h: 104,
  title: "Amazon SQS",
  subtitle: "Background lead enrichment and crawl jobs",
  icon: icons.sqs,
  future: true,
})
smallBox({
  x: 1240,
  y: 375,
  w: 430,
  h: 104,
  title: "Amazon S3",
  subtitle: "CSV exports, PDF reports, screenshots",
  icon: icons.s3,
  future: true,
})
smallBox({
  x: 1240,
  y: 505,
  w: 430,
  h: 104,
  title: "Amazon RDS Proxy",
  subtitle: "Connection pooling for Vercel serverless workloads",
  icon: icons.rds,
  future: true,
})
smallBox({
  x: 1240,
  y: 635,
  w: 430,
  h: 104,
  title: "Amazon CloudWatch",
  subtitle: "Metrics, logs, alarms, operational visibility",
  icon: icons.cloudwatch,
  future: true,
})
box({
  x: 1240,
  y: 765,
  w: 430,
  h: 104,
  title: "CRM integrations",
  subtitle: "HubSpot, Salesforce, Airtable, Google Sheets",
  accent: "#7C3AED",
  fill: "#FFF8EE",
  stroke: "#F4B35C",
  dashed: true,
  tag: "Future",
})

arrow(356, 294, 430, 294, "HTTPS")
arrow(560, 353, 560, 430, "render")
arrow(356, 489, 430, 489, "UI")
arrow(560, 548, 560, 625, "fetch")
arrow(690, 684, 805, 489, "business logic")
arrow(935, 538, 935, 585, "SQL")
arrow(935, 420, 935, 378, "tokens")
curvedArrow("M 690 684 C 730 790, 720 855, 356 855", "optional search", 514, 762, true)
curvedArrow("M 690 684 C 765 835, 760 855, 690 855", "optional AI", 716, 782, true)
arrow(1065, 642, 1240, 557, "future pool", true)
arrow(1065, 642, 1240, 297, "async jobs", true)
arrow(1065, 642, 1240, 427, "exports", true)
arrow(1065, 642, 1240, 687, "logs", true)
arrow(690, 684, 1240, 817, "sync", true)

push(`<rect x="54" y="982" width="1686" height="188" rx="28" fill="#FFFFFF" stroke="#D9DEE8" filter="url(#shadow)"/>`)
push(`<text x="82" y="1023" class="section">AWS Well-Architected principles</text>`)
pillar(82, "Operational Excellence", "Platform health monitoring, repeatable Prisma migrations, operational visibility")
pillar(410, "Security", "IAM database auth, no static DB password, least-privilege policy")
pillar(738, "Reliability", "Aurora PostgreSQL persistence with resilient local data fallback and error handling")
pillar(1066, "Performance Efficiency", "Vercel Edge delivery, Prisma queries, future RDS Proxy")
pillar(1394, "Cost Optimization", "Serverless-first architecture, optional external APIs, cost-efficient Aurora deployment")

push(`<text x="72" y="1190" class="subtitle">AWS service icons are from the official AWS Architecture Icons package (${esc(basename(iconRoot))}).</text>`)
push(`</svg>`)

const svg = parts.join("\n")
writeFileSync(join(outDir, "leadrelay-ai-architecture.svg"), svg)
writeFileSync(join(outDir, "leadrelay-architecture.svg"), svg)
console.log(join(outDir, "leadrelay-ai-architecture.svg"))
console.log(join(outDir, "leadrelay-architecture.svg"))
