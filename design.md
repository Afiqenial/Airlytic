# Design Style Guide - Water Consumption Visualization Dashboard

## Design Philosophy

### Visual Language
- **Clean & Professional**: Emphasizing clarity and data-driven insights
- **Malaysian Identity**: Incorporating subtle cultural elements through color palette
- **Scientific Precision**: Clear, accurate representations that inspire trust
- **Accessible Design**: Ensuring readability and usability for all users

### Color Palette
- **Primary Blue**: #1e40af (Deep ocean blue - representing water)
- **Secondary Teal**: #0891b2 (Malaysian cultural accent)
- **Accent Orange**: #ea580c (Warm contrast for highlights)
- **Neutral Gray**: #374151 (Text and secondary elements)
- **Background**: #f8fafc (Clean, minimal background)
- **Success Green**: #059669 (Positive trends)
- **Warning Amber**: #d97706 (Attention indicators)

### Typography
- **Display Font**: "Inter" - Modern, clean sans-serif for headings
- **Body Font**: "Inter" - Consistent typography throughout
- **Monospace**: "JetBrains Mono" - For data values and code
- **Font Sizes**: 
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

## Visual Effects & Styling

### Used Libraries
- **ECharts.js**: Primary visualization library for interactive charts
- **Anime.js**: Smooth animations and transitions
- **Splitting.js**: Text animation effects
- **Typed.js**: Typewriter effects for headings
- **p5.js**: Background particle effects
- **Matter.js**: Physics-based interactions
- **Pixi.js**: Advanced visual effects

### Animation & Effects
- **Scroll Animations**: Subtle fade-in effects (opacity 0.9 to 1.0)
- **Hover States**: Gentle scale transforms (1.0 to 1.02)
- **Chart Animations**: Smooth data transitions with 300ms duration
- **Loading States**: Elegant skeleton screens with shimmer effects
- **Background**: Subtle particle system representing water molecules

### Header Effect
- **Hero Background**: Animated gradient flow using CSS and p5.js
- **Typewriter Animation**: Main heading appears with typing effect
- **Floating Elements**: Subtle geometric shapes representing data points
- **Color Cycling**: Gentle color transitions in accent elements

### Chart Styling
- **Consistent Color Scheme**: Maximum 4 colors per visualization
- **Subtle Shadows**: Soft drop shadows for depth (0 4px 6px rgba(0,0,0,0.1))
- **Rounded Corners**: 8px border radius for modern appearance
- **Interactive States**: Clear hover feedback with color transitions
- **Responsive Design**: Adaptive layouts for all screen sizes

### Layout Principles
- **Grid System**: 12-column responsive grid
- **White Space**: Generous padding and margins (minimum 16px)
- **Visual Hierarchy**: Clear information architecture
- **Consistent Spacing**: 8px base unit system
- **Mobile First**: Responsive design starting from 320px width

### Interactive Elements
- **Buttons**: Rounded corners, subtle shadows, hover animations
- **Dropdowns**: Clean, minimal styling with smooth transitions
- **Sliders**: Custom styling with Malaysian blue accent
- **Tooltips**: Dark background with white text, rounded corners
- **Modals**: Backdrop blur effect with centered content

### Accessibility Features
- **High Contrast**: 4.5:1 minimum contrast ratio
- **Focus Indicators**: Clear keyboard navigation
- **Screen Reader**: Proper ARIA labels and descriptions
- **Color Blind**: Pattern and texture alternatives to color
- **Font Scaling**: Responsive text sizing

## Brand Integration
- **Logo Placement**: Top-left corner, consistent sizing
- **Watermark**: Subtle "Interactive Data Visualization" text
- **Footer**: Minimal copyright and attribution information
- **Loading States**: Branded loading animations
- **Error States**: Friendly, on-brand error messages