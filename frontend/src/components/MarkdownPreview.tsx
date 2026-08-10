import { useMemo } from 'react'
import DOMPurify from 'dompurify'

// Configure DOMPurify to allow safe elements and attributes
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'pre', 'code',
  'strong', 'em', 'b', 'i',
  'a',
  'blockquote',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class']

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseTableRow(line: string): string[] {
  // Remove leading/trailing pipes and whitespace, then split by pipe
  const trimmed = line.trim()
  // Remove leading pipe if present
  const withoutLeadingPipe = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed
  // Remove trailing pipe if present
  const withoutTrailingPipe = withoutLeadingPipe.endsWith('|') 
    ? withoutLeadingPipe.slice(0, -1) 
    : withoutLeadingPipe
  
  return withoutTrailingPipe.split('|').map((cell) => cell.trim())
}

function isSeparatorRow(line: string): boolean {
  const trimmed = line.trim()
  // Separator row contains only |, -, :, and spaces
  // Must have at least one dash
  return /^[\s|:-]+$/.test(trimmed) && trimmed.includes('-')
}

function renderTableCell(content: string, isHeader: boolean): string {
  // Process inline markdown within cells
  let html = escapeHtml(content)
  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Handle bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  const tag = isHeader ? 'th' : 'td'
  return `<${tag}>${html}</${tag}>`
}

function renderTable(tableMatch: string): string {
  const lines = tableMatch.trim().split('\n').filter(line => line.trim().length > 0)
  
  if (lines.length < 2) return escapeHtml(tableMatch)
  
  // Find the separator row (might be index 1 or later)
  let separatorIndex = -1
  for (let i = 1; i < lines.length; i++) {
    if (isSeparatorRow(lines[i])) {
      separatorIndex = i
      break
    }
  }
  
  if (separatorIndex === -1) return escapeHtml(tableMatch)
  
  // Everything before separator is header, everything after is body
  const headerLines = lines.slice(0, separatorIndex)
  const bodyLines = lines.slice(separatorIndex + 1)
  
  // Build header - typically just one row
  const theadRows = headerLines.map(line => {
    const cells = parseTableRow(line)
    return `<tr>${cells.map(cell => renderTableCell(cell, true)).join('')}</tr>`
  }).join('')
  const theadHtml = `<thead>${theadRows}</thead>`
  
  // Build body
  const tbodyHtml = bodyLines.length > 0
    ? `<tbody>${bodyLines
        .map((line) => {
          const cells = parseTableRow(line)
          return `<tr>${cells.map(cell => renderTableCell(cell, false)).join('')}</tr>`
        })
        .join('')}</tbody>`
    : ''
  
  return `<table class="md-table">${theadHtml}${tbodyHtml}</table>`
}

function findTables(text: string): { tables: string[], placeholders: string[] } {
  const tables: string[] = []
  const lines = text.split('\n')
  const result: string[] = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    
    // Check if this line looks like a table header (contains pipes)
    if (line.trim().startsWith('|') && line.includes('|')) {
      // Look ahead for separator row
      if (i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
        // Found a table! Collect all rows
        const tableLines: string[] = [line, lines[i + 1]]
        i += 2
        
        // Collect body rows (lines that start with |)
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i])
          i++
        }
        
        // Render the table and add placeholder
        tables.push(renderTable(tableLines.join('\n')))
        result.push(`\u0000TABLE${tables.length - 1}\u0000`)
        continue
      }
    }
    
    result.push(line)
    i++
  }
  
  return { tables, placeholders: result }
}

function renderMarkdown(raw: string): string {
  const normalized = raw.replace(/\r\n/g, '\n')
  const codeBlocks: string[] = []

  // Step 1: Extract code blocks BEFORE any processing
  let text = normalized.replace(/```([\s\S]*?)```/g, (_match, code: string) => {
    const escaped = escapeHtml(code.trim())
    codeBlocks.push(`<pre class="md-code-block"><code>${escaped}</code></pre>`)
    return `\u0000CODEBLOCK${codeBlocks.length - 1}\u0000`
  })

  // Step 2: Extract tables BEFORE HTML escaping
  const { tables, placeholders } = findTables(text)
  text = placeholders.join('\n')

  // Step 3: Escape HTML in remaining text
  text = escapeHtml(text)

  // Step 4: Process inline markdown
  
  // Headings
  text = text.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
  text = text.replace(/^##### (.*)$/gm, '<h5>$1</h5>')
  text = text.replace(/^#### (.*)$/gm, '<h4>$1</h4>')
  text = text.replace(/^### (.*)$/gm, '<h3>$1</h3>')
  text = text.replace(/^## (.*)$/gm, '<h2>$1</h2>')
  text = text.replace(/^# (.*)$/gm, '<h1>$1</h1>')

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Links (already escaped, so we need to handle the escaped entities)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  )

  // Unordered lists
  text = text.replace(/^- (.*)$/gm, '<li>$1</li>')
  text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)

  // Ordered lists
  text = text.replace(/^\d+\. (.*)$/gm, '<li>$1</li>')
  text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes('<ul>')) return match
    return `<ol>${match}</ol>`
  })

  // Step 5: Wrap remaining text in paragraphs
  const blockTagPattern = /^<(h1|h2|h3|h4|h5|h6|ul|ol|pre|table)/
  const placeholderPattern = /^\u0000(CODEBLOCK|TABLE)\d+\u0000$/
  
  const paragraphs = text.split(/\n{2,}/).map((block) => {
    const trimmed = block.trim()
    if (!trimmed) {
      return ''
    }
    // Don't wrap block elements or placeholders
    if (blockTagPattern.test(trimmed) || placeholderPattern.test(trimmed)) {
      return trimmed
    }
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
  })
  text = paragraphs.join('\n')

  // Step 6: Restore tables
  text = text.replace(/\u0000TABLE(\d+)\u0000/g, (_match, idx: string) => tables[Number(idx)] || '')

  // Step 7: Restore code blocks
  text = text.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_match, idx: string) => codeBlocks[Number(idx)])

  return text
}

/**
 * Renders markdown content as sanitized HTML.
 * Uses DOMPurify to prevent XSS attacks from user-generated content.
 */
interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const sanitizedHtml = useMemo(() => {
    const rawHtml = renderMarkdown(content)
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    })
  }, [content])

  return (
    <div
      className={`markdown-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
