#!/usr/bin/env node

import { execSync } from 'node:child_process';

const listDifferentCmd =
  'npx prettier --list-different . --ignore-path .prettierignore';

let output = '';

try {
  output = execSync(listDifferentCmd, { encoding: 'utf8' });
} catch (error) {
  if (error.status === 1) {
    output = error.stdout?.toString() ?? '';
  } else {
    throw error;
  }
}

const filesNeedingFormat = output
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (filesNeedingFormat.length === 0) {
  process.exit(0);
}

execSync(
  'npx prettier --write --log-level error . --ignore-path .prettierignore',
  { stdio: 'ignore' },
);

console.log('Prettier formatted:');
filesNeedingFormat.forEach((file) => console.log(`- ${file}`));
