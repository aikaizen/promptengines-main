/**
 * Prepare Build Stream Data
 * 
 * Fetches commits from the last 24 hours and generates a JSON file
 * that the human writer can use to craft the daily stream article.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getCommits() {
  const since = new Date();
  since.setDate(since.getDate() - 1);
  since.setHours(0, 0, 0, 0);
  
  const sinceStr = since.toISOString();
  
  try {
    const log = execSync(
      `git log --all --since="${sinceStr}" --pretty=format:'%H|%ci|%s|%an|%ae|%D'`,
      { encoding: 'utf-8' }
    );
    
    if (!log.trim()) return [];
    
    return log.trim().split('\n').map(line => {
      const [hash, date, subject, author, email, refs] = line.split('|');
      return {
        hash,
        shortHash: hash.slice(0, 7),
        date,
        subject,
        author,
        email,
        refs,
        type: subject.match(/^(feat|fix|content|refactor|docs|chore|style|test)(\(.+\))?:/)?.[1] || 'other',
        scope: subject.match(/^(?:feat|fix|content|refactor|docs|chore|style|test)\((.+)\):/)?.[1] || null
      };
    });
  } catch (e) {
    console.error('Error fetching commits:', e.message);
    return [];
  }
}

function getStats(commits) {
  const byType = {};
  const byAuthor = {};
  
  commits.forEach(c => {
    byType[c.type] = (byType[c.type] || 0) + 1;
    byAuthor[c.author] = (byAuthor[c.author] || 0) + 1;
  });
  
  return { byType, byAuthor, total: commits.length };
}

function generateData() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  
  const commits = getCommits();
  const stats = getStats(commits);
  
  const data = {
    date: dateStr,
    generatedAt: date.toISOString(),
    commits,
    stats,
    summary: {
      totalCommits: commits.length,
      primaryTypes: Object.entries(stats.byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      activeAuthors: Object.keys(stats.byAuthor)
    }
  };
  
  const outputPath = path.join(
    __dirname, 
    '..', 
    'labnotes', 
    'build-stream', 
    `.data-${dateStr}.json`
  );
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Generated: ${outputPath}`);
  console.log(`Commits: ${commits.length}`);
  console.log(`Types:`, stats.byType);
  
  return data;
}

if (require.main === module) {
  generateData();
}

module.exports = { getCommits, getStats, generateData };
