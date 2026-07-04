/**
 * MenuItem.jsx
 *
 * Props:
 *   id          string   — unique id (FocusManager için)
 *   label       string
 *   icon        string   — emoji veya karakter
 *   screen      string   — navigate edilecek ekran adı
 *   active      boolean  — şu an görüntülenen ekran mı
 *   locked      boolean  — grace/expired'da kilitli mi
 *   badge       string|null — badge metni ('⚠ 2s', 'Pro' vb.)
 *   badgeVariant 'grace'|'normal'
 *   focused     boolean  — FocusManager'dan gelen fokus
 *   onClick     (screen, locked) => void
 */

import React from 'react';

function LockIcon() {
  return (
    <svg
      className="menu-item__lock"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export default function MenuItem(props) {
  var id           = props.id;
  var label        = props.label;
  var icon         = props.icon || '•';
  var screen       = props.screen;
  var active       = props.active || false;
  var locked       = props.locked || false;
  var badge        = props.badge || null;
  var badgeVariant = props.badgeVariant || 'normal';
  var focused      = props.focused || false;
  var onClick      = props.onClick;

  var classNames = ['menu-item'];
  if (active)  classNames.push('menu-item--active');
  if (locked)  classNames.push('menu-item--locked');

  function handleClick() {
    if (onClick) onClick(screen, locked);
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // OK/Enter
      e.preventDefault();
      if (onClick) onClick(screen, locked);
    }
  }

  return (
    <button
      id={id}
      className={classNames.join(' ')}
      data-focusable="true"
      data-focused={focused ? 'true' : undefined}
      data-screen={screen}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={active ? 'page' : undefined}
      aria-label={label + (locked ? ', kilitli' : '') + (badge ? ', ' + badge : '')}
      tabIndex={0}
    >
      <span className="menu-item__icon" aria-hidden="true">{icon}</span>
      <span className="menu-item__label">{label}</span>
      {locked && <LockIcon />}
      {badge && !locked && (
        <span className={'menu-item__badge menu-item__badge--' + badgeVariant}>
          {badge}
        </span>
      )}
    </button>
  );
}
