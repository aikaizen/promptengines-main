const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// HTML template
const template = (title, desc, date, category, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Prompt Engines Lab</title>
  <meta name="description" content="${desc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <style>
    .article-content { max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem; }
    .article-content h2 { margin-top: 2.5rem; font-size: 1.5rem; }
    .article-content h3 { margin-top: 2rem; font-size: 1.25rem; }
    .article-content p { line-height: 1.7; margin: 1rem 0; }
    .article-content ul, .article-content ol { margin: 1rem 0; padding-left: 1.5rem; }
    .article-content li { margin: 0.5rem 0; }
    .article-content code { font-family: var(--mono); background: var(--bg-elevated); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875rem; }
    .article-content pre { background: var(--bg-elevated); padding: 1rem; border-radius: var(--radius-sm); overflow-x: auto; }
    .article-content pre code { background: none; padding: 0; }
    .article-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    .article-content th, .article-content td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    .article-content th { font-weight: 600; color: var(--text-2); }
    .footnotes { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.875rem; color: var(--text-3); }
    .footnotes ol { padding-left: 1.5rem; }
    .footnotes li { margin: 0.5rem 0; }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="../index.html">Lab<span>Notes</span></a>
      <nav class="nav">
        <a href="../team/">Team</a>
        <a href="../purpose/">Purpose</a>
        <div class="nav-dropdown">
          <span>Labnotes</span>
          <div class="nav-dropdown-menu">
            <a href="../articles/">Articles</a>
            <a href="../signals/">Signals</a>
            <a href="../build-stream/">Build Stream</a>
            <a href="../skills/">Skills</a>
            <a href="../submit/">Submit Article</a>
            <a href="../review/">Review <span style="font-size: 10px; padding: 2px 6px; background: var(--accent-dim); color: var(--accent); border-radius: 4px;">Internal</span></a>
            <a href="../about/">About</a>
          </div>
        </div>
        <a href="https://promptengines.com" target="_blank" rel="noopener noreferrer">PromptEngines.com</a>
      </nav>
    </div>
  </header>

  <main>
    <article class="section" style="padding-top: 2rem;">
      <div class="article-content">
        <div class="article-meta" style="color: var(--text-4); font-size: 0.875rem; margin-bottom: 1.5rem;">
          ${date} · ${category}
        </div>
        
        ${content}
      </div>
    </article>
  </main>

  <footer style="padding: 3rem 1.5rem; border-top: 1px solid var(--border); margin-top: 4rem;">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div style="color: var(--text-3);">
        <span style="font-weight: 600;">Prompt Engines Lab</span> — Experimental notes on building with AI
      </div>
      <div style="display: flex; gap: 1.5rem;">
        <a href="https://promptengines.com" style="color: var(--text-3); text-decoration: none;">PromptEngines.com</a>
        <a href="https://github.com/aikaizen" style="color: var(--text-3); text-decoration: none;">GitHub</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

// Parse frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  
  const fm = match[1];
  const body = match[2];
  const data = {};
  
  fm.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      data[key] = value;
    }
  });
  
  return { data, body };
}

// Process footnotes
function processFootnotes(html) {
  // Find footnote references [^1] and replace with superscript links
  html = html.replace(/\[\^(\d+)\]/g, '<sup><a href="#fn$1" id="ref$1">[$1]</a></sup>');
  
  // Wrap footnote section if present
  if (html.includes('class="footnotes"') || html.includes('[^1]') === false) {
    return html;
  }
  
  return html;
}

// Convert markdown file to HTML
function convertFile(filename) {
  const mdContent = fs.readFileSync(filename, 'utf8');
  const { data, body } = parseFrontmatter(mdContent);
  
  const title = data.title || '';
  const date = data.date || '';
  const category = (data.category || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Generate description from first paragraph
  const firstPara = body.split('\n\n')[0].replace(/[#*\[\]]/g, '').slice(0, 160);
  const desc = firstPara + (firstPara.length >= 160 ? '...' : '');
  
  // Convert markdown to HTML
  let htmlContent = marked(body);
  
  // Process footnotes
  htmlContent = processFootnotes(htmlContent);
  
  // Generate full HTML
  const fullHtml = template(title, desc, date, category, htmlContent);
  
  // Write output
  const outFile = filename.replace('.md', '.html');
  fs.writeFileSync(outFile, fullHtml);
  console.log(`Converted: ${filename} -> ${outFile}`);
}

// Process all March 3 files
const files = [
  '2026-03-03-model-selection-framework.md',
  '2026-03-03-api-provider-framework.md',
  '2026-03-03-just-talk-to-it.md',
  '2026-03-03-just-rebuild-it.md',
  '2026-03-03-zen-and-the-art-of-vibecoding.md'
];

files.forEach(convertFile);
console.log('\nAll conversions complete!');
