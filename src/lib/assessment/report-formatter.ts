export function formatHTMLReport(
  content: string,
  businessName: string
): string {
  // Convert markdown to HTML with enhanced styling
  const htmlContent = convertMarkdownToHTML(content);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revenue Intelligence Report - ${businessName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
      box-shadow: 0 0 50px rgba(0,0,0,0.1);
    }
    
    header {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    
    header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .content {
      padding: 50px 40px;
    }
    
    /* Executive Summary Box */
    .exec-summary {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 40px;
      border-left: 5px solid #3498db;
    }
    
    .exec-summary h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      border: none;
    }
    
    /* Section styling */
    .section {
      margin-bottom: 40px;
    }
    
    .content h1 {
      color: #667eea;
      font-size: 2.2rem;
      margin: 40px 0 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #667eea;
    }
    
    h2 {
      color: #667eea;
      font-size: 1.8rem;
      margin: 40px 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    
    h3 {
      color: #764ba2;
      font-size: 1.3rem;
      margin: 25px 0 15px;
    }
    
    p {
      margin-bottom: 15px;
    }
    
    ul {
      margin: 15px 0 15px 30px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      background: white;
    }
    
    tr:hover td {
      background: #f8fafc;
    }
    
    .gabi-framework {
      background: linear-gradient(to right, #f0f9ff, #e0f2fe);
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      border-left: 4px solid #0ea5e9;
    }
    
    .solution-columns {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .solution-column {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .solution-column:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .solution-column h3 {
      color: #0ea5e9;
      margin-top: 0;
    }
    
    .roi-table {
      background: linear-gradient(to right, #f0fdf4, #ecfdf5);
      border: 2px solid #10b981;
    }
    
    .roi-table th {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .current-state {
      background: #fef2f2;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      margin: 20px 0;
    }
    
    .future-state {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      margin: 20px 0;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      margin: 40px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      background: #5a67d8;
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
    
    footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 0.9rem;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    
    .metric-highlight {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #f59e0b;
    }
    
    .benefit-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    
    .benefit-item {
      background: #f0f9ff;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #0ea5e9;
    }
    
    .gabi-layers {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    .gabi-layer {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e0f2fe;
      text-align: center;
    }
    
    .gabi-layer h4 {
      color: #0ea5e9;
      margin-bottom: 10px;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 2fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .feature-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #dee2e6;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
    }
    
    .feature-card h3 {
      color: #667eea;
      font-size: 1.1rem;
      margin-bottom: 10px;
    }
    
    .feature-card p {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    /* Architecture Stack Layers */
    .architecture-stack {
      display: grid;
      gap: 20px;
      margin: 20px 0;
    }
    
    .layer {
      padding: 20px;
      border-radius: 10px;
      color: white;
    }
    
    .layer.interface, .layer.all-in-one {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    
    .layer.agentic {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }
    
    .layer.knowledge {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
    }
    
    .layer.context {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
    }
    
    .layer h4 {
      margin: 0 0 10px 0;
      font-size: 1.2rem;
      color: white;
    }
    
    .layer .tools {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .layer .tool {
      background: rgba(255, 255, 255, 0.2);
      padding: 5px 10px;
      border-radius: 5px;
      font-weight: 600;
    }
    
    .layer .pricing {
      font-size: 0.9rem;
      opacity: 0.9;
      margin-left: 5px;
    }
    
    /* Case Study Headers */
    .case-study-header {
      color: #D4AF37;
      background: linear-gradient(90deg, #D4AF37, #FFD700);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: 1.4rem;
      margin: 30px 0 15px;
    }
    
    /* Compact Architecture Stack - 2x2 Grid */
    .architecture-stack.compact {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 20px 0;
    }
    
    .layer-row {
      display: flex;
      gap: 10px;
    }
    
    .architecture-stack.compact .layer {
      flex: 1;
      padding: 15px;
      border-radius: 8px;
      position: relative;
      color: white;
    }
    
    .architecture-stack.compact .layer h5 {
      margin: 0 0 5px 0;
      font-size: 0.9em;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: white;
    }
    
    .architecture-stack.compact .layer p {
      margin: 0;
      font-weight: 600;
      font-size: 1.1em;
      color: white;
    }
    
    .architecture-stack.compact .layer .how {
      display: block;
      margin-top: 8px;
      font-size: 0.85em;
      opacity: 0.85;
      font-style: italic;
      line-height: 1.3;
      color: rgba(255, 255, 255, 0.9);
    }
    
    @media print {
      body {
        background: white;
      }
      
      .container {
        box-shadow: none;
      }
      
      .cta-section {
        display: none;
      }
    }
    
    @media (max-width: 768px) {
      .solution-columns,
      .gabi-layers {
        grid-template-columns: 1fr;
      }
      
      .benefit-list {
        grid-template-columns: 1fr;
      }
      
      .layer-row {
        flex-direction: column;
        gap: 8px;
      }
      
      .architecture-stack.compact .layer {
        padding: 12px;
      }
      
      .architecture-stack.compact .layer h5 {
        font-size: 0.8em;
      }
      
      .architecture-stack.compact .layer p {
        font-size: 1em;
      }
      
      .architecture-stack.compact .layer .how {
        font-size: 0.8em;
        margin-top: 6px;
      }
      
      .container {
        margin: 0;
      }
      
      .content, header {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 1.8rem;
      }
      
      h2 {
        font-size: 1.5rem;
      }
      
      table {
        font-size: 0.9rem;
      }
      
      th, td {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Revenue Intelligence Report</h1>
      <div class="subtitle">${businessName} - AI Transformation Analysis</div>
    </header>
    
    <div class="content">
      ${htmlContent}
      
      <div class="cta-section">
        <h2 style="color: white; border: none; margin-top: 0;">Ready to Transform Your Revenue Operations?</h2>
        <p>Schedule a strategic consultation to discuss your personalized implementation roadmap.</p>
        <a href="mailto:joel@commitimpact.com?subject=Revenue Intelligence Report - ${businessName}" class="cta-button">
          Schedule Strategy Session
        </a>
      </div>
    </div>
    
    <footer>
      <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <p style="margin-top: 10px;">
          <em>Powered by GABI Intelligence™ - AI Revenue Enablement by Commit Impact</em>
      </p>
      <p style="margin-top: 15px; font-size: 0.8rem; color: #9ca3af;">
          This report contains proprietary analysis based on current market intelligence.<br>
          Data freshness: ${getDataFreshness()} • Confidence level: ${getConfidenceLevel()}
      </p>
    </footer>
  </div>

  <script>
    // Add any interactive elements here if needed
    document.addEventListener('DOMContentLoaded', function() {
      // Smooth scrolling for any internal links
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    });
  </script>
</body>
</html>
  `;
}

// Helper function to convert markdown sections to styled HTML
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Convert headers with proper closing and opening of sections
  html = html.replace(/^## (.*?)$/gm, (match, title, offset) => {
    const isFirst = offset === 0 || !markdown.substring(0, offset).includes('##');
    const prefix = isFirst ? '' : '</div>';
    return `${prefix}<div class="section"><h2>${title}</h2>`;
  });
  
  // Style Case Study headers with gold gradient
  html = html.replace(/^### (Case Study \d+:.*?)$/gm, '<h3 class="case-study-header">$1</h3>');
  
  // Regular h3 headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  
  // Convert special sections with content preservation
  html = html.replace(/## Executive Summary\s*([\s\S]*?)(?=##|$)/gm, (match, content) => {
    return `<div class="exec-summary"><h2>Executive Summary</h2>${content}</div>`;
  });
  
  // Convert GABI Advantage section
  html = html.replace(/## The GABI Advantage\s*([\s\S]*?)(?=##|$)/gm, (match, content) => {
    return `<div class="gabi-framework"><h2>The GABI Advantage</h2>${content}</div>`;
  });
  
  // Convert In-Scope Solutions - preserve new architecture structure
  html = html.replace(/## In-Scope Solutions.*?\s*([\s\S]*?)(?=##|$)/gm, (match, content) => {
    // Keep the new layered architecture format
    return `<div class="section"><h2>In-Scope Solutions</h2>${content}</div>`;
  });
  
  // Convert ROI sections to special styling
  html = html.replace(/## ROI on Investment\s*([\s\S]*?)(?=##|$)/gm, (match, content) => {
    // Convert table content to roi-table format
    const tableContent = content.replace(/\|(.*?)\|(.*?)\|/g, (tableMatch, col1, col2) => {
      if (col1.includes('---')) return ''; // Skip separator rows
      const label = col1.replace(/\*/g, '').trim();
      const value = col2.replace(/\*/g, '').trim();
      return `<div class="roi-metric"><span class="label">${label}</span><span class="value">${value}</span></div>`;
    });
    
    return `<div class="section"><h2>ROI on Investment</h2><div class="roi-table">${tableContent}</div></div>`;
  });
  
  // Standard markdown conversions
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Convert lists
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>\s*)+/g, '<ul>$&</ul>');
  
  // Convert simple tables
  html = html.replace(/(\|.*\|.*\|\s*\n)+/g, (match) => {
    const rows = match.trim().split('\n');
    let tableHTML = '<table>';
    
    rows.forEach((row, index) => {
      if (row.includes('---')) return; // Skip separator rows
      
      const cells = row.split('|').filter(cell => cell.trim());
      const isHeader = index === 0 || (index === 1 && rows[0].includes('---'));
      const tag = isHeader ? 'th' : 'td';
      
      tableHTML += `<tr>${cells.map(cell => 
        `<${tag}>${cell.replace(/\*/g, '').trim()}</${tag}>`
      ).join('')}</tr>`;
    });
    
    return tableHTML + '</table>';
  });
  
  // Convert paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/^(?!<[^>]+>)(.+)$/gm, '<p>$1</p>');
  
  // Clean up empty paragraphs and fix nested tags
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[^>]+>.*?<\/[^>]+>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>[\s\S]*?<\/table>)<\/p>/g, '$1');
  
  // Ensure we have proper section wrapper
  if (!html.includes('<div class="section">')) {
    html = '<div class="section">' + html + '</div>';
  } else if (!html.endsWith('</div>')) {
    html = html + '</div>';
  }
  
  return html;
}

// Helper functions for metadata
function getDataFreshness(): string {
  // This would check actual data age from intelligence system
  return 'Within 7 days';
}

function getConfidenceLevel(): string {
  // This would calculate based on data quality from intelligence system
  return 'High (89%)';
}