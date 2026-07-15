/**
 * SearchBar.jsx — Arama kutusu (UI shell)
 *
 * Bu fazda arama fonksiyonu implemente EDİLMEZ.
 * Sadece görsel placeholder.
 *
 * Props:
 *   placeholder  string  — placeholder metni
 *   isFocused    boolean — fokuslu mu
 */

import React from 'react';
import './SearchBar.scss';

export default function SearchBar(props) {
  var placeholder = props.placeholder || 'Search...';
  var isFocused   = props.isFocused || false;

  var barClass = 'search-bar';
  if (isFocused) barClass = barClass + ' search-bar--focused';

  return (
    <div className={barClass} data-focusable="true" data-focused={isFocused ? 'true' : undefined} tabIndex={-1}>
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <span className="search-bar__text">{placeholder}</span>
    </div>
  );
}
