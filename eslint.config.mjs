import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ),
  {
    plugins: {
      'simple-import-sort': (await import('eslint-plugin-simple-import-sort'))
        .default,
    },
    rules: {
      'simple-import-sort/imports': 'error',
    },
    ignores: ['public/charting_library/**'],
  },
];

export default eslintConfig;
