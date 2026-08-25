const fs = require('fs');

function processFile(src, dst, depthStr) {
    let content = fs.readFileSync(src, 'utf-8');
    
    // 1. Add theme.js to head
    const headEnd = content.indexOf('</head>');
    if (headEnd !== -1) {
        const themeScript = `<script src="${depthStr}scripts/theme.js"></script>\n`;
        content = content.slice(0, headEnd) + themeScript + content.slice(headEnd);
    }
        
    // 2. Fix navigation links
    content = content.replace(/href="#"([^>]*>Home<)/g, `href="${depthStr}index.html"$1`);
    content = content.replace(/href="#"([^>]*>Courses<)/g, `href="${depthStr}pages/courses.html"$1`);
    content = content.replace(/href="#"([^>]*>Question Bank<)/g, `href="${depthStr}pages/class-12/question-bank/index.html"$1`);
    content = content.replace(/href="#"([^>]*>About<)/g, `href="${depthStr}about.html"$1`);
    content = content.replace(/href="#"([^>]*>\s*LearnNepal\s*<)/g, `href="${depthStr}index.html"$1`);
    
    // 3. Add theme-toggle class
    content = content.replace('class="material-symbols-outlined text-on-surface-variant cursor-pointer"', 'class="material-symbols-outlined text-on-surface-variant cursor-pointer theme-toggle"');
    content = content.replace('class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"', 'class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors theme-toggle"');
    content = content.replace('class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"', 'class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container theme-toggle"');
    
    fs.writeFileSync(dst, content, 'utf-8');
}

processFile('example/contact_us_learnnepal/code.html', 'contact.html', './');
processFile('example/courses_learnnepal/code.html', 'pages/courses.html', '../');
processFile('example/neb_question_bank/code.html', 'pages/class-12/question-bank/index.html', '../../../');
console.log('Done!');
