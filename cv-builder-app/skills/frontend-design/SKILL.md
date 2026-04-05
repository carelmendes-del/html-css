---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Also trigger when the user mentions design systems, tokens, component libraries, accessibility (a11y), WCAG compliance, or wants to create scalable UI foundations. Generates creative, polished code and UI design that avoids generic AI aesthetics — and is accessible, token-driven, and production-ready.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details, creative choices, accessibility, and scalable design systems.

The user provides frontend requirements: a component, page, application, interface, or design system to build. They may include context about the purpose, audience, or technical constraints.

---

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility needs).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail
- **Accessible by default** — beautiful design and a11y are not in conflict

---

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS custom properties (tokens) for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise. **Always include `prefers-reduced-motion` support.**
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## Accessibility (A11y) — Non-Negotiable

**Beautiful design must be usable by everyone.** Accessibility is not a constraint — it is a mark of craft. Always implement these, regardless of whether the user explicitly asks:

### Semantic Structure
- Use correct HTML5 elements: `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<aside>`
- Heading hierarchy must be logical: one `<h1>`, then `<h2>`, `<h3>` — never skip levels
- Use `<button>` for actions, `<a>` for navigation — never a `<div onClick>`
- Use `<ul>`/`<ol>` for lists, `<table>` (with `<caption>`, `<th scope>`) for tabular data

### Keyboard Navigation
- All interactive elements must be reachable and operable by keyboard
- Tab order must follow the visual reading flow
- Custom components must implement correct ARIA keyboard patterns:
  - Modal: trap focus inside, close on `Escape`, return focus on close
  - Dropdown/Menu: arrow keys to navigate, `Enter`/`Space` to select, `Escape` to close
  - Tabs: arrow keys to switch tabs

### Focus Styles
- **Never** `outline: none` without a custom replacement
- Focus indicators must be clearly visible — contrast ratio ≥ 3:1 against adjacent colors
- Preferred pattern: `outline: 2px solid var(--color-focus); outline-offset: 3px;`
- Use `:focus-visible` to show focus only for keyboard users (not mouse clicks)

### Color & Contrast
- Normal text (< 18px / < 14px bold): contrast ratio **≥ 4.5:1** (WCAG AA)
- Large text (≥ 18px / ≥ 14px bold): contrast ratio **≥ 3:1**
- UI components (borders, icons, inputs): **≥ 3:1** against background
- Never use color alone to convey meaning — pair with icon, text, or pattern

### Images & Media
- All meaningful `<img>` must have descriptive `alt` text
- Decorative images: `alt=""` (empty, so screen readers skip them)
- Icon-only buttons: `aria-label="descriptive action"`

### ARIA — Use Sparingly and Correctly
- First rule of ARIA: don't use ARIA if a native HTML element works
- `aria-label` / `aria-labelledby`: name elements without visible labels
- `aria-live="polite"`: announce dynamic content updates (toasts, form errors)
- `aria-expanded`, `aria-selected`, `aria-checked`: reflect interactive state

### Forms
- Every input must have an associated `<label>` (via `for`/`id` or wrapping)
- Error messages linked via `aria-describedby` and marked with `role="alert"`
- Required fields marked with `aria-required="true"` plus a visible indicator

### Motion Safety
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Design Systems & Tokens

When building a design system, component library, or when the user asks for reusable components, token structure, or brand consistency — follow this approach.

### Token Architecture

**Primitive tokens** — raw values, no semantic meaning:
```css
--primitive-blue-500: #2563eb;
--primitive-gray-900: #0f172a;
--primitive-space-4: 4px;
```

**Semantic tokens** — reference primitives, carry meaning:
```css
:root {
  /* Color */
  --color-bg:            var(--primitive-gray-50);
  --color-surface:       #ffffff;
  --color-primary:       var(--primitive-blue-500);
  --color-primary-hover: var(--primitive-blue-600);
  --color-text:          var(--primitive-gray-900);
  --color-text-muted:    var(--primitive-gray-500);
  --color-border:        var(--primitive-gray-200);
  --color-focus:         var(--primitive-blue-500);
  --color-error:         #dc2626;
  --color-success:       #16a34a;

  /* Spacing */
  --space-xs:  4px;    --space-sm: 8px;    --space-md: 16px;
  --space-lg:  24px;   --space-xl: 32px;   --space-2xl: 48px;

  /* Typography */
  --font-display: /* distinctive display font */;
  --font-body:    /* refined body font */;
  --text-sm: 0.875rem;  --text-base: 1rem;   --text-lg: 1.125rem;
  --text-xl: 1.25rem;   --text-2xl: 1.5rem;  --text-4xl: 2.25rem;
  --leading-tight: 1.2; --leading-normal: 1.5;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);

  /* Motion */
  --duration-fast: 150ms;  --duration-normal: 250ms;  --duration-slow: 400ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f0f13;  --color-surface: #1a1a22;
    --color-text: #e8eaf0;  --color-text-muted: #6b7280;
    --color-border: #2a2a38;
  }
}
```

### Component Token Pattern
Each component uses only semantic tokens — never raw values:
```css
.button-primary {
  background: var(--color-primary);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease-default),
              transform var(--duration-fast) var(--ease-default);
}
.button-primary:hover { background: var(--color-primary-hover); transform: translateY(-1px); }
.button-primary:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 3px; }
```

### Component Variants (React pattern)
```jsx
const variants = {
  primary:   'bg-[var(--color-primary)] text-white',
  secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text)]',
  ghost:     'bg-transparent text-[var(--color-primary)]',
};
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-base', lg: 'px-7 py-3.5 text-lg' };

function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} rounded-[var(--radius-md)] transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2`}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Final Delivery Checklist

**Visual**
- [ ] Aesthetic direction is bold, intentional, and consistent
- [ ] Typography uses distinctive, non-generic fonts
- [ ] Color palette cohesive; never color alone to convey meaning

**Code**
- [ ] CSS uses semantic tokens/variables throughout (no raw values)
- [ ] No placeholder lorem ipsum — realistic content
- [ ] Mobile responsive (320px, 768px, 1280px+)
- [ ] Hover, active states on all interactive elements

**Accessibility**
- [ ] Semantic HTML structure with correct heading hierarchy
- [ ] All images have `alt` text
- [ ] Color contrast ≥ 4.5:1 for body text
- [ ] Full keyboard navigation works
- [ ] Focus styles visible and clear (`:focus-visible`)
- [ ] `prefers-reduced-motion` respected
