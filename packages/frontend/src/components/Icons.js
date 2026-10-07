import React from 'react';

const Icon = ({ path }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d={path} />
  </svg>
);

export const CheckIcon = () => <Icon path="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />;

export const EditIcon = () => (
  <Icon path="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z" />
);

export const DeleteIcon = () => (
  <Icon path="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
);

export const WarningIcon = () => <Icon path="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" />;
