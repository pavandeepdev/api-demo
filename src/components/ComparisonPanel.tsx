import type { ReactNode } from 'react';

interface ComparisonPanelProps {
    leftTitle: string;
    leftContent: ReactNode;
    rightTitle: string;
    rightContent: ReactNode;
}

/**
 * ComparisonPanel Component
 * 
 * Side-by-side comparison layout for showing differences
 * between two approaches (e.g., useEffect vs TanStack Query)
 */
export function ComparisonPanel({
    leftTitle,
    leftContent,
    rightTitle,
    rightContent,
}: ComparisonPanelProps) {
    return (
        <div className="comparison-container">
            <div className="comparison-panel left-panel">
                <h3 className="panel-title">{leftTitle}</h3>
                <div className="panel-content">{leftContent}</div>
            </div>

            <div className="comparison-divider">
                <span className="vs-badge">VS</span>
            </div>

            <div className="comparison-panel right-panel">
                <h3 className="panel-title">{rightTitle}</h3>
                <div className="panel-content">{rightContent}</div>
            </div>
        </div>
    );
}
