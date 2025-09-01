import React from 'react';

interface TableSelectProps {
  onTableSelect: (table: number) => void;
}

const tables = [1, 2, 3, 4, 5, 6, 7, 8];

const TableSelect: React.FC<TableSelectProps> = ({ onTableSelect }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Choose Your Table</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
        {tables.map(table => (
          <button
            key={table}
            style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '8px', border: '1px solid #007bff', background: '#fff', cursor: 'pointer' }}
            onClick={() => onTableSelect(table)}
          >
            Table {table}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableSelect;
