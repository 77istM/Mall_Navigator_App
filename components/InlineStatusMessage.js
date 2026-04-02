import React from 'react';
import StatusBanner from './StatusBanner';

const InlineStatusMessage = ({ status, fallbackVariant = 'info', title, compact = true }) => {
  if (!status?.message) {
    return null;
  }

  return (
    <StatusBanner
      compact={compact}
      variant={status.tone || fallbackVariant}
      title={title}
      message={status.message}
    />
  );
};

export default InlineStatusMessage;
