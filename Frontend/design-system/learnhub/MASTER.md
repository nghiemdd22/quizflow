# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Quizflow (formerly LearnHub)
**Generated:** 2026-06-07 (Updated)
**Category:** Education Platform / Service Landing Page

---

## Global Rules

### 1. Architectural Style: Neo-Brutalism (Pop Style)
The entire project follows a strict **Neo-Brutalist** aesthetic. This means:
- **No soft/blurred drop shadows.** Shadows must be solid colors (usually dark slate/black) without blur (e.g., `box-shadow: 3px 3px 0px #0f172a`).
- **Thick borders.** Interactive elements and containers must have thick dark borders (e.g., `border: 2px solid #0f172a`).
- **High Contrast & Vibrant Colors.** Paired with a soft cream background to make the colors pop.
- **Micro-interactions.** Elements physically "press down" (using `transform: translate`) when clicked, and shadows shrink/disappear to mimic physical buttons.

### 2. Color Palette

All colors are implemented as CSS variables in `index.css` via Tailwind's `@theme`.

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Background | `--color-neo-bg` | `#fff5f4` | Primary app background (cream). Do NOT use generic white for the main background. |
| Border & Shadow | (hardcoded) | `#0f172a` | All borders and hard shadows must use this slate-900 color. |
| Accent Green | `--color-neo-green` | `#22c55e` | Primary CTAs, success states, accents. |
| Accent Blue | `--color-neo-blue` | `#3b82f6` | Links, secondary buttons, highlights. |
| Accent Yellow| `--color-neo-yellow` | `#eab308` | Warnings, star ratings, fun elements. |
| Accent Purple| `--color-neo-purple` | `#a855f7` | Premium features, badges. |
| Accent Coral | `--color-neo-coral` | `#ff7e67` | Logo background, special highlights. |

### 3. Typography

- **Global Font:** `Nunito`
- **Mood:** Friendly, approachable, educational, rounded, modern.
- **Weights used:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black).
- **Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
```

### 4. Icons & Imagery

- **Icon Library:** **Lucide React** (`lucide-react`).
- **Rule:** ❌ **NEVER use text emojis (📖, 💻, 🎯) as icons.** Always import professional SVG icons from `lucide-react` (e.g., `<BookOpen />`, `<Target />`).
- **Logo:** Consists of a Coral circular container with a white `<BookOpen />` icon, next to the "Quizflow" text in ExtraBold weight.

---

## Component Specs (Defined in index.css)

Instead of using utility classes everywhere for borders and shadows, use these pre-defined utility classes.

### Cards (`.neo-card`)
- **Border Radius:** `1.5rem` (24px) - highly rounded corners.
- **Styling:** White or colored background, 2px solid border, 3px hard shadow.
- **Hover variant (`.neo-card-hover`):** Elevates on hover (`transform: translate(-3px, -3px)`) and shadow grows to 6px.

### Buttons (`.neo-btn`)
- **Border Radius:** `0.75rem` (12px) - Squared but slightly rounded corners (Do NOT use fully rounded/pill shapes for buttons).
- **Styling:** 2px solid border, 3px hard shadow. Font weight is always ExtraBold (800).
- **Interaction:**
  - `hover`: Pushes down slightly, shadow reduces to 1.5px.
  - `active`: Pushes down fully, shadow disappears to 0px.

### Badges (`.neo-badge`)
- **Border Radius:** `0.75rem` (12px).
- **Usage:** Inline tags, categories, labels. Small scale version of the button styling.

### Inputs & Forms
- **Border Radius:** `0.5rem` (`rounded-lg`) or `0.75rem` (`rounded-xl`).
- **Styling:** Must have `border-2 border-slate-900`.
- **Focus state:** Must translate slightly and show a hard shadow to indicate focus, removing default outline.

---

## Anti-Patterns (Do NOT Use)

- ❌ **Soft, blurred drop-shadows.** (Never use Tailwind's default `shadow-md`, `shadow-lg` without tweaking them to be hard).
- ❌ **Generic backgrounds.** Do not use plain white `#FFFFFF` or standard grays for the main application background. Stick to `--color-neo-bg`.
- ❌ **Missing borders.** In Neo-brutalism, every distinct interactive element or card *must* have a border.
- ❌ **Fully rounded pills.** Buttons and badges should use `rounded-xl` (0.75rem), not `rounded-full`.
- ❌ **Text Emojis.** Use `lucide-react`.

## Pre-Delivery Checklist for AI
Before delivering any UI code, verify:
- [ ] Are buttons using `.neo-btn`?
- [ ] Are cards using `.neo-card`?
- [ ] Is the border radius for buttons/badges squared-off (`rounded-xl`) and not `rounded-full`?
- [ ] Are icons using `lucide-react`?
- [ ] Does the page background use `bg-neo-bg`?
- [ ] Is the project correctly named "Quizflow"?
