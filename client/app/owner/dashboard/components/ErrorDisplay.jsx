import React from 'react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
      {error}
    </div>
  );
};

export default ErrorDisplay; 