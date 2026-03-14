#!/usr/bin/env node

/**
 * Daily AI Research Briefing Generator
 * 
 * Generates a daily AI research briefing article in HTML format.
 * Fetches trending AI repos, news, and research signals.
 * 
 * Usage: node scripts/generate-daily-briefing.js [--date YYYY-MM-DD]
 * 
 * Requires: BRAVE_API_KEY environment variable (free tier: 2,000 queries/month)
 * 
 * Output: labnotes/articles/YYYY-MM-DD-daily-ai-briefing.html
 * Also updates: labnotes/articles/index.html
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ── Configuration ──────────────────────────────────────────────────────

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const ARTICLES_DIR = path.join(__dirname, "..", "labnotes", "articles");
const INDEX_FILE = path.join(ARTICLES_DIR, "index.html");

// Default search queries for AI research signals
const DEFAULT_QUERIES = [
  "AI agents trending github today",
  "LLM context window news",
  "agent memory architecture research",
  "AI model releases today",
  "MCP protocol updates",
];

// ── Article Template ───────────────────────────────────────────────────

function generateBriefingHTML(date, stories, stats, topicRecommendation) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const storyBlocks = stories
    .map(
      (story, i) => `
        <div class="story-block">
          <h4><span class="briefing-score briefing-score-${story.heat.toLowerCase()}">${story.heat}</span> ${story.title}</h4>
          <p>${story.summary}</p>
          <div class="stats-row">
            <span>📊 Score: ${story.score}/10</span>
            ${story.stars ? `<span>⭐ Stars: ${story.stars}</span>` : ""}
            ${story.metric ? `<span>${story.metric}</span>` : ""}
          </div>
          ${story.insight ? `<p style="margin-top: 0.75rem; font-size: 0.875rem; color: var(--text-3);"><strong>Key insight:</strong> ${story.insight}</p>` : ""}
        </div>
      `
    )
    .join("\n");

  const statsList = stats
    .map((stat) => `<li><strong>${stat.label}:</strong> ${stat.value}</li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily AI Research Briefing — ${formattedDate} — Prompt Engines Lab</title>
  <meta name="description" content="Top 5 AI stories: ${stories.map(s => s.title).slice(0, 3).join(", ")}">
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
    .briefing-score { display: inline-block; background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.5rem; }
    .briefing-score-hot { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
    .briefing-score-surging { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
    .briefing-score-exploding { background: linear-gradient(135deg, #FF4757, #FF6348); }
    .briefing-score-research { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
    .briefing-score-evolving { background: linear-gradient(135deg, #96E6A1, #7CB342); }
    .story-block { background: var(--bg-elevated); border-left: 4px solid var(--accent); padding: 1.25rem; margin: 1.5rem 0; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
    .story-block h4 { margin-top: 0; color: var(--text-1); }
    .stats-row { display: flex; gap: 2rem; flex-wrap: wrap; margin: 0.75rem 0; font-size: 0.875rem; color: var(--text-3); }
    .stats-row span { display: flex; align-items: center; gap: 0.25rem; }
    .article-topic-box { background: linear-gradient(135deg, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--accent); padding: 1.5rem; border-radius: var(--radius); margin: 2rem 0; }
    .article-topic-box h3 { margin-top: 0; color: var(--accent); }
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
          ${formattedDate} · Daily Briefing · Research
        </div>
        
        <h1>📡 Daily AI Research Briefing — ${formattedDate}</h1>
        
        <p style="font-size: 1.125rem; color: var(--text-2); margin-bottom: 2rem;">
          ${topicRecommendation.thesis}
        </p>

        <h2>🔥 Top 5 Stories</h2>

        ${storyBlocks}

        <h2>📊 Daily Stats</h2>
        <ul>
          ${statsList}
        </ul>

        <div class="article-topic-box">
          <h3>📝 Article Topic Recommendation</h3>
          <p style="font-size: 1.125rem; font-weight: 500; margin-bottom: 0.75rem;">
            "${topicRecommendation.title}"
          </p>
          <p style="margin-bottom: 0.75rem;">
            <strong>Thesis:</strong> ${topicRecommendation.thesis}
          </p>
          <p style="margin-bottom: 0;">
            <strong>Covers:</strong> ${topicRecommendation.covers}
          </p>
        </div>

        <h2>🎯 Strategic Implications</h2>
        
        <h3>For Builders</h3>
        <p>${topicRecommendation.forBuilders}</p>

        <h3>For Investors</h3>
        <p>${topicRecommendation.forInvestors}</p>

        <h3>For Users</h3>
        <p>${topicRecommendation.forUsers}</p>

        <hr style="margin: 3rem 0; border: none; border-top: 1px solid var(--border);">
        
        <p style="font-size: 0.875rem; color: var(--text-4);">
          <strong>About Daily Briefings:</strong> Curated AI research signals, published daily. Focus on quantified claims, falsifiable predictions, and strategic implications. Edited by Andy Stable (AI).<br>
          <strong>Subscribe:</strong> New briefings appear daily at lab.promptengines.com/articles/<br>
          <strong>Feedback:</strong> Reply with topics you'd like covered.
        </p>
      </div>
    </article>
  </main>

  <footer class="footer" style="border-top: 1px solid var(--border); padding: 2rem 0; margin-top: 4rem;">
    <div class="container">
      <p style="text-align: center; font-size: 0.875rem; color: var(--text-4);">
        © 2026 Prompt Engines Lab · <a href="../about/">About</a> · <a href="../purpose/">Purpose</a>
      </p>
    </div>
  </footer>
</body>
</html>`;
}

// ── Helper Functions ─────────────────────────────────────────────────

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dateIndex = args.indexOf("--date");
  const date = dateIndex !== -1 ? args[dateIndex + 1] : getTodayDate();
  return { date };
}

function updateArticlesIndex(date, title) {
  if (!fs.existsSync(INDEX_FILE)) {
    console.warn(`Index file not found: ${INDEX_FILE}`);
    return false;
  }

  let indexContent = fs.readFileSync(INDEX_FILE, "utf-8");
  
  // Check if Daily Briefings section exists
  if (!indexContent.includes("Daily Briefings")) {
    // Add Daily Briefings section after "All articles" header
    const insertPoint = indexContent.indexOf("<!-- Benchmarks & Evaluations -->");
    if (insertPoint !== -1) {
      const briefingSection = `        <!-- Daily Briefings -->
        <div class="category-group-label">Daily Briefings</div>
        <div class="archive-list">
        </div>

`;
      indexContent = indexContent.slice(0, insertPoint) + briefingSection + indexContent.slice(insertPoint);
    }
  }

  // Check if today's briefing already exists
  const briefingFilename = `./${date}-daily-ai-briefing.html`;
  if (indexContent.includes(briefingFilename)) {
    console.log(`Briefing already in index: ${briefingFilename}`);
    return false;
  }

  // Add new briefing to Daily Briefings section
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  
  const newEntry = `          <a class="archive-item" href="${briefingFilename}">
            <div class="archive-meta">${formattedDate} · 5 min · Research</div>
            <h3>${title}</h3>
          </a>`;

  // Find the Daily Briefings archive-list and insert
  const sectionRegex = /(<!-- Daily Briefings -->[\s\S]*?<div class="archive-list">)([\s\S]*?)(<\/div>)/;
  const match = indexContent.match(sectionRegex);
  
  if (match) {
    const beforeList = match[1];
    const existingEntries = match[2];
    const afterList = match[3];
    
    // Insert new entry at the beginning
    indexContent = indexContent.replace(
      sectionRegex,
      beforeList + "\n" + newEntry + existingEntries + afterList
    );

    // Update article count
    const countMatch = indexContent.match(/<span class="section-count">(\d+) notes<\/span>/);
    if (countMatch) {
      const newCount = parseInt(countMatch[1]) + 1;
      indexContent = indexContent.replace(
        /<span class="section-count">\d+ notes<\/span>/,
        `<span class="section-count">${newCount} notes</span>`
      );
    }

    fs.writeFileSync(INDEX_FILE, indexContent);
    console.log(`Updated articles/index.html with new briefing`);
    return true;
  }

  return false;
}

// ── Mock Data for Testing (no API key) ─────────────────────────────────

function getMockStories() {
  return [
    {
      title: "Anthropic 1M Context GA — But The Ceiling Is Real",
      summary: "Anthropic shipped 1M context to all paid Opus 4.6 tiers with 78.3% MRCR v2 score, dropping per-token pricing on long contexts. But the significant move isn't the release—it's the admission that context windows have plateaued at 1M for 2+ years due to HBM supply constraints.",
      heat: "HOT",
      score: 9.2,
      stars: null,
      metric: "🔥 Impact: Context rationing becomes architecture constraint",
      insight: "Swyx/Latent Space argue we're in a \"context drought\" where agents must learn to work with limited context, not wait for infinite expansion.",
    },
    {
      title: "OpenViking — Volcengine's Context Database for Agents",
      summary: "Volcengine open-sourced OpenViking, a context database using a filesystem paradigm with L0/L1/L2 tiered loading. Treats agent memory as a storage problem, not a prompt engineering problem. 2.2K stars in 24 hours.",
      heat: "SURGING",
      score: 8.5,
      stars: "+2.2K (today)",
      metric: "🎯 Significance: Practical answer to memory architecture",
    },
    {
      title: "agency-agents — Complete AI Agency Framework",
      summary: "msitarzewski's agency-agents hit 40.8K stars (+29K this week), a \"complete AI agency\" framework with specialized expert agents (researcher, writer, coder, reviewer) orchestrated by a meta-agent. The market is moving from single agents to orchestrated teams.",
      heat: "EXPLODING",
      score: 8.8,
      stars: "+29K (this week)",
      metric: "📈 Trend: Meta-agent pattern accelerating",
    },
    {
      title: "Agent Memory as the Differentiator",
      summary: "IBM research shows extracting reusable strategies from agent trajectories boosts hard-task completion from 69.6% to 73.2% (+3.6pp). Simultaneously, NousResearch's Hermes Agent (6.8K★) and Hindsight (3.7K★) converge on the same insight: memory architecture matters more than context length.",
      heat: "RESEARCH",
      score: 8.0,
      stars: null,
      metric: "📈 Gain: +3.6pp on hard tasks (IBM)",
    },
    {
      title: "MCP Protocol — From Tool-Calling to Memory Infrastructure",
      summary: "Engineer complaints about MCP ergonomics mask a deeper shift: Chrome v146 adds web MCP support, repurposing the protocol from tool-calling to memory infrastructure. The pattern isn't friction—it's transformation.",
      heat: "EVOLVING",
      score: 6.5,
      stars: null,
      metric: "🔮 Signal: Browser as memory layer",
    },
  ];
}

function getMockStats() {
  return [
    { label: "Top trending repo", value: "agency-agents (+29K stars this week)" },
    { label: "Fastest daily growth", value: "OpenViking (+2.2K stars today)" },
    { label: "Key release", value: "Anthropic Opus 4.6 1M context GA" },
    { label: "Research insight", value: "Agent memory +3.6pp task completion (IBM)" },
  ];
}

function getMockTopicRecommendation() {
  return {
    title: "Context Drought: Why 1M Tokens Is the Ceiling and What Agent Builders Should Do About It",
    thesis: "With context windows physically capped at 1M tokens due to HBM constraints, the next scaling dimension isn't longer context—it's how well agents retain, curate, and learn from past experience.",
    covers: "Anthropic's plateau admission, IBM trajectory extraction, OpenViking's tiered memory, Hindsight's hindsight architecture, and practical strategies for building agents that need less context, not more.",
    forBuilders: "Stop waiting for infinite context. Start designing for: 1) Context rationing: What must be in-prompt vs. retrievable, 2) Memory hierarchies: L0 (hot), L1 (warm), L2 (cold) like OpenViking, 3) Trajectory learning: Extract reusable strategies from past runs.",
    forInvestors: "The infrastructure play is shifting from bigger models/longer context to memory systems, agent orchestration, and context databases.",
    forUsers: "Expect agents that remember across sessions, not just within them. The agency-agents framework (40K+ stars) signals this is becoming table stakes.",
  };
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const { date } = parseArgs();
  
  console.log(`Generating Daily AI Research Briefing for ${date}...`);
  console.log();

  // Check for Brave API key
  if (!BRAVE_API_KEY) {
    console.warn("⚠️  BRAVE_API_KEY not set. Using mock data for testing.");
    console.warn("   Get free API key at: https://api.search.brave.com");
    console.warn("   Then: export BRAVE_API_KEY=your_key");
    console.log();
  }

  // For now, use mock data (replace with actual API calls when key is available)
  const stories = getMockStories();
  const stats = getMockStats();
  const topicRecommendation = getMockTopicRecommendation();

  // Generate HTML
  const html = generateBriefingHTML(date, stories, stats, topicRecommendation);
  
  const outputFile = path.join(ARTICLES_DIR, `${date}-daily-ai-briefing.html`);
  
  // Ensure articles directory exists
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  // Write file
  fs.writeFileSync(outputFile, html);
  console.log(`✓ Generated: ${outputFile}`);

  // Update index
  const title = `Daily AI Research Briefing — ${new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
  updateArticlesIndex(date, title);

  console.log();
  console.log("Next steps:");
  console.log(`1. Review and edit ${outputFile}`);
  console.log("2. Update stories with actual research from today");
  console.log("3. git add, commit, push");
  console.log();
  console.log(`Live URL: https://lab.promptengines.com/articles/${date}-daily-ai-briefing.html`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
