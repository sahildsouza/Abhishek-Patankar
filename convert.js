const fs = require('fs');

function convertHtmlToJsx(html, componentName) {
  let jsx = html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--/g, '{/*')
    .replace(/-->/g, '*/}')
    .replace(/<img([^>]*[^/])>/g, '<img$1 />')
    .replace(/<input([^>]*[^/])>/g, '<input$1 />')
    .replace(/<link([^>]*[^/])>/g, '<link$1 />')
    .replace(/<meta([^>]*[^/])>/g, '<meta$1 />')
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    .replace(/style="([^"]*)"/g, (match, p1) => {
      const styleObj = p1.split(';').reduce((acc, style) => {
        const [key, value] = style.split(':').map(s => s.trim());
        if (key && value) {
          const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
          acc.push(`${camelKey}: '${value}'`);
        }
        return acc;
      }, []);
      return `style={{ ${styleObj.join(', ')} }}`;
    });

  return `import React, { useState, useEffect } from 'react';\nimport { supabase } from './supabaseClient';\n\nexport default function ${componentName}() {\n  return (\n    <>\n${jsx}\n    </>\n  );\n}\n`;
}

try {
  const regHtml = fs.readFileSync('src/registration.html', 'utf8');
  fs.writeFileSync('src/Registration.tsx', convertHtmlToJsx(regHtml, 'Registration'));

  const adminHtml = fs.readFileSync('src/admin.html', 'utf8');
  fs.writeFileSync('src/Admin.tsx', convertHtmlToJsx(adminHtml, 'Admin'));
  console.log('Successfully converted HTML to JSX');
} catch (e) {
  console.error(e);
}
