const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('useEffectEvent') && (line.includes('from "react"') || line.includes("from 'react'"))) {
      console.log(`Patching import in ${filePath} at line ${i + 1}`);
      // Remove useEffectEvent from the brackets
      let newImport = line.replace(', useEffectEvent', '').replace('useEffectEvent, ', '').replace('useEffectEvent', '');
      
      // Ensure useRef, useInsertionEffect, and useCallback are present in the import
      if (!newImport.includes('useInsertionEffect')) {
        newImport = newImport.replace(' } from "react"', ', useInsertionEffect } from "react"')
                             .replace(" } from 'react'", ", useInsertionEffect } from 'react'");
      }
      if (!newImport.includes('useCallback')) {
        newImport = newImport.replace(' } from "react"', ', useCallback } from "react"')
                             .replace(" } from 'react'", ", useCallback } from 'react'");
      }
      if (!newImport.includes('useRef')) {
        newImport = newImport.replace(' } from "react"', ', useRef } from "react"')
                             .replace(" } from 'react'", ", useRef } from 'react'");
      }

      // Add polyfill after this import
      const polyfill = `
const useEffectEvent = (cb) => {
  const ref = useRef(cb);
  useInsertionEffect(() => {
    ref.current = cb;
  });
  return useCallback((...args) => {
    return ref.current(...args);
  }, []);
};
`;
      lines[i] = newImport + '\n' + polyfill;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Successfully patched: ${filePath}`);
  }
}

function search(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      search(full);
    } else if (f.endsWith('.js')) {
      patchFile(full);
    }
  }
}

search(path.join(__dirname, '..', 'node_modules', 'sanity', 'lib'));
console.log("Sanity files patching complete!");
