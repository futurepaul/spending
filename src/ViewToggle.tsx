import React from 'react';

export type ViewType = 'tree' | 'list';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ onViewChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
    }}>
      <button
        onClick={() => onViewChange('tree')}
        aria-label="Tree View"
      >
        tree

      </button>
      <button
        onClick={() => onViewChange('list')}
        aria-label="List View"
      >
        list
      </button>
    </div>
  );
}; 