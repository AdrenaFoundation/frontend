import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language="javascript"
      style={vscDarkPlus}
      customStyle={{
        padding: 0,
        margin: 0,
        borderRadius: 0,
        background: 'transparent',
        border: 'none',
        borderBlock: 'none',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
