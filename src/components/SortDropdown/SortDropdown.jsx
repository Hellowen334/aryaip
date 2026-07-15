/**
 * SortDropdown.jsx — Sıralama dropdown (UI shell)
 *
 * Bu fazda sıralama mantığı implemente EDİLMEZ.
 * Sadece görsel placeholder.
 *
 * Props:
 *   label      string  — görüntülenen metin
 *   isFocused  boolean — fokuslu mu
 */

import React from 'react';
import './SortDropdown.scss';

export default function SortDropdown(props) {
  var label     = props.label || 'Order by number';
  var isFocused = props.isFocused || false;

  var ddClass = 'sort-dropdown';
  if (isFocused) ddClass = ddClass + ' sort-dropdown--focused';

  return (
    <div className={ddClass} data-focusable="true" data-focused={isFocused ? 'true' : undefined} tabIndex={-1}>
      <span className="sort-dropdown__icon" aria-hidden="true">↕</span>
      <span className="sort-dropdown__label">{label}</span>
      <span className="sort-dropdown__arrow" aria-hidden="true">▾</span>
    </div>
  );
}
