const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Header is everything up to </nav>
const headerMatch = html.match(/([\s\S]*?<\/nav>)/);
const header = headerMatch ? headerMatch[1] : '';

const demoMatch = html.match(/(<section id="demo"[\s\S]*?<\/section>)/);
const demo = demoMatch ? demoMatch[1] : '';

const footerMatch = html.match(/(<!-- Footer -->[\s\S]*?<\/html>)/);
const footer = footerMatch ? footerMatch[1] : '';

let res = header + '\n' + demo + '\n' + footer;
res = res.replace(/href="assets\//g, 'href="../assets/')
         .replace(/src="assets\//g, 'src="../assets/')
         .replace(/href="\/assets\//g, 'href="../assets/')
         .replace(/src="http/g, 'src="http')
         .replace('</body>', '    <script src="start.js"></script>\n</body>');

fs.writeFileSync('start/index.html', res);
