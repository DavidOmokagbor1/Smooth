# EASY App - Design Guidelines

## Design Approach
**Style**: Modern glassmorphism with supportive, magical personality inspired by productivity apps like Notion and motion.dev, combined with the delight of Duolingo's gamification.

## Visual Design System

### Color Palette
- **Primary**: #7C3AED (soft purple)
- **Secondary**: #60A5FA (calming blue)
- **Accent**: #34D399 (gentle green)
- **Background**: Linear gradient from #F0F9FF to #EDE9FE
- **Glass Panels**: rgba(255, 255, 255, 0.7) with backdrop-blur

### Typography
- **Font Families**: 'Inter' for UI text, 'Nunito' for headings
- **Sizes**: 16px base, 24px headings, 14px secondary text
- **Line Height**: 1.6 for optimal readability

### Spacing System
Use Tailwind spacing units: **2, 4, 6, 8, 12, 16, 24** for consistent rhythm.

## Layout Structure

### Header
- "EASY" logo with animated voice wave icon (left)
- User avatar/mood indicator (circular, 40px)
- Settings gear icon (minimal, top-right)
- Height: 16 units, glassmorphic background

### Main Voice Input Area
- **Large Circular Microphone Button**: 120px diameter, centered
- Pulsing glow animation during recording
- Real-time transcription display below button (max-w-2xl)
- Secondary text input: "Or type here..." (subtle, below transcription)
- AI Response Card: Glassmorphic card with rounded corners (24px), typing animation

### Task Display Board
**Desktop**: Three equal-width columns
- ✅ **Do Now** (max 3 items) - Purple accent
- 🕒 **Do Later** (max 5 items) - Blue accent  
- ✨ **Optional** (unlimited) - Green accent

**Mobile**: Swipeable horizontal cards

**Task Cards**:
- Border radius: 16px
- Padding: 4-6 units
- Shadow: 0 10px 40px rgba(124, 58, 237, 0.1)
- Drag handles, quick complete checkbox, dismiss icon
- Gentle breathing animation (subtle scale pulse)

### Footer
- Rotating encouragement messages (14px, centered)
- Daily progress indicator: "You've completed X tasks today! 🎉"
- Virtual pet display area (64px animated creature)

## Component Specifications

### Buttons
- **Primary CTA**: Rounded-full, py-3 px-8, hover scale(1.02)
- **Microphone**: Circular, gradient fill, drop shadow, active pulse
- **Glass Buttons**: Blurred background when on images/gradients

### Cards
- Border radius: 24px (2xl) for major cards, 16px for task items
- Transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: Subtle lift with increased shadow

### Animations
- **Task Completion**: Confetti burst particle effect
- **AI Thinking**: Floating bubbles or dots
- **Card Interactions**: Gentle breathing (scale 1.0 to 1.02)
- **Voice Input**: Concentric ripple waves from mic button
- **Virtual Pet**: Idle animations, celebration bounces

## Gamification Visual Elements

### XP & Streaks Display
- Compact card in header or sidebar
- Progress bar with gradient fill
- Streak counter with 🔥 icon
- Achievement badges (circular, 48px, unlock animation)

### Virtual Pet Companion
- 64px animated SVG or Lottie character
- Position: Bottom-right corner, floating
- States: Idle, happy (task complete), sleeping, celebrating

## Dynamic Themes (Time-based)
- **Dawn**: Soft orange (#FFA500) to pink (#FFB6C1) gradient
- **Day**: Default bright blues and whites
- **Dusk**: Purple (#9333EA) to gold (#F59E0B) gradient
- **Night**: Dark mode with #1F2937 background, star particles

## Personality Mode Visual Indicators
Each AI personality has subtle UI adjustments:
- **Zen Master**: Lotus icon, meditation blue tones
- **Best Friend**: Casual speech bubble icon, warm colors
- **Coach**: Whistle icon, energetic orange accents

## Accessibility Features
- High contrast mode toggle
- Dyslexia-friendly font option (OpenDyslexic)
- ADHD mode: Reduced animations, larger touch targets (minimum 44px)
- Keyboard navigation with visible focus states
- Screen reader optimized labels

## Images
**No large hero image needed** - the app is a task management interface focused on the voice interaction centerpiece (microphone button) and task board.

Minimal imagery:
- User avatar (circular, 40px)
- Virtual pet mascot (animated SVG/Lottie)
- Achievement badge icons (48px circular)
- Personality mode icons (24px)

## Interaction Principles
- **Supportive, never punishing**: Celebrate progress, gently encourage
- **Magical micro-interactions**: Delightful but not distracting
- **Voice-first**: Keyboard/touch as secondary, always accessible
- **Minimal cognitive load**: Clear hierarchy, max 3 "Do Now" tasks visible
- **Instant feedback**: Every action acknowledged (subtle sound + animation)