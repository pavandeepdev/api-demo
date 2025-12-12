import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
}

/**
 * CodeBlock Component
 * 
 * Displays code with syntax highlighting and copy functionality.
 * Used throughout demo pages to show code examples.
 */
export function CodeBlock({ code, language = 'typescript', title }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block">
            {title && (
                <div className="code-block-header">
                    <span className="code-block-title">{title}</span>
                    <button onClick={handleCopy} className="copy-button">
                        {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>
            )}
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    borderRadius: title ? '0 0 0.5rem 0.5rem' : '0.5rem',
                    fontSize: '0.9rem',
                    padding: '1.5rem',
                }}
                showLineNumbers={true}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
