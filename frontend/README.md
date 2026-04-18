# Frontend - German Language Learning App

React + Vite-based SPA frontend for the German Language Learning Application. Provides intuitive UI for vocabulary management, flashcard study sessions, quizzes, and progress tracking.

## Stack

- **React**: 18+
- **Build Tool**: Vite 5+
- **Testing**: Vitest, @testing-library/react
- **Styling**: CSS Modules/Plain CSS
- **Linting**: ESLint
- **HTTP Client**: Native fetch API
- **State Management**: React hooks + Context API

## Quick Start

### 1. Setup Environment

```bash
cd frontend

# Create .env file from template
cp .env.example .env

# Edit .env with your settings:
# VITE_API_URL=http://localhost:8000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev

# Frontend will be available at: http://localhost:5173
# Vite provides HMR (Hot Module Replacement) by default
```

### 4. Build for Production

```bash
npm run build

# Output in dist/ directory
npm run preview  # Test production build locally
```

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx            # App entry point
│   ├── App.jsx             # Root component
│   ├── App.css             # Root styles
│   ├── index.css          # Global styles
│   ├── components/
│   │   ├── Navigation.jsx  # Main navigation
│   │   ├── Navigation.css
│   │   ├── Words/
│   │   │   ├── WordForm.jsx       # Add word form
│   │   │   ├── WordForm.css
│   │   │   ├── WordList.jsx       # Display words
│   │   │   └── WordList.css
│   │   ├── Flashcards/
│   │   │   ├── FlashcardStudy.jsx # Study session
│   │   │   └── FlashcardStudy.css
│   │   └── Quiz/
│   │       ├── QuizComponent.jsx  # Quiz interface
│   │       ├── QuizComponent.css
│   │       ├── Statistics.jsx     # Progress display
│   │       └── Statistics.css
│   ├── pages/
│   │   ├── Vocabulary.jsx  # Vocabulary page (Words)
│   │   └── Vocabulary.css
│   ├── services/
│   │   ├── vocabulary.js   # Words API calls
│   │   └── quiz.js         # Flashcards & Quiz API calls
│   └── assets/            # Images, icons, etc.
├── tests/
│   ├── flashcards.test.js
│   ├── quiz.test.js
│   ├── words.test.js
│   ├── e2e/
│   │   └── full-user-flow.spec.js  # Playwright E2E tests
│   └── llm/
│       └── generate_tests.py  # LLM-based test generation
├── public/                # Static assets
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
├── package.json
└── README.md
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Build
npm run build        # Build for production
npm run preview      # Preview production build locally

# Testing
npm test             # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Linting
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors

# E2E Testing (requires Playwright)
npx playwright test frontend/tests/e2e/
```

## Features

### 1. Vocabulary Management

- ✓ Add new German words with meanings
- ✓ View all vocabulary with practice statistics
- ✓ Edit existing words
- ✓ Delete words from database
- ✓ Track times practiced and accuracy

### 2. Flashcard Study

- ✓ Select words for flashcard study
- ✓ Auto-generate flashcards from vocabulary
- ✓ Flip cards to reveal answers
- ✓ Mark words as known/unknown
- ✓ Progress tracking per word

### 3. Quiz System

- ✓ Multiple-choice quiz questions
- ✓ Configurable number of questions
- ✓ Real-time scoring
- ✓ Quiz result display
- ✓ Performance feedback

### 4. Progress Tracking

- ✓ View overall progress statistics
- ✓ Per-word accuracy tracking
- ✓ Practice history
- ✓ Motivational feedback

## Component Documentation

### Navigation Component

Main navigation component that manages page routing between:

- Vocabulary
- Flashcards
- Quiz
- Statistics

```jsx
import { Navigation } from './components/Navigation';

function App() {
  return <Navigation />;
}
```

### Vocabulary Components

**WordForm**: Form to add new words

```jsx
<WordForm onWordAdded={refreshList} />
```

**WordList**: Displays all vocabulary

```jsx
<WordList refresh={shouldRefresh} />
```

### Flashcard Component

```jsx
<FlashcardStudy />
```

- Select mode: Choose words for study
- Study mode: Flip through flashcards
- Track progress for each word

### Quiz Component

```jsx
<QuizComponent />
```

- Start screen: Select number of questions
- Quiz mode: Answer multiple-choice questions
- Results screen: View score and performance

### Statistics Component

```jsx
<Statistics />
```

- Overall progress dashboard
- Per-word statistics
- Quiz performance history

## API Integration

The frontend communicates with the backend API via the `services/` modules:

### vocabulary.js

```javascript
import { vocabularyService } from './services/vocabulary';

// Create word
await vocabularyService.createWord('Apfel', 'Apple');

// Get all words
const { data } = await vocabularyService.getAllWords();

// Update word
await vocabularyService.updateWord(wordId, { meaning: 'New meaning' });

// Delete word
await vocabularyService.deleteWord(wordId);
```

### quiz.js

```javascript
import { quizService, flashcardService } from './services/quiz';

// Create quiz
const { data } = await quizService.createQuiz(10);

// Submit quiz results
await quizService.submitQuiz(quizId, score);

// Get flashcards
const { data } = await flashcardService.getAllFlashcards();

// Mark flashcard known
await flashcardService.markFlashcardKnown(flashcardId);
```

## Styling

Component styles use CSS Modules for scoping:

```css
/* Component.css */
.component-class {
  /* styles */
}

.component-class-nested {
  /* nested styles */
}
```

Global styles in `index.css` for:

- Reset/normalization
- Typography
- Color scheme
- Spacing scales

## Accessibility

All components follow WCAG 2.1 guidelines:

- ✓ Semantic HTML (`<nav>`, `<main>`, etc.)
- ✓ ARIA labels for buttons and interactive elements
- ✓ Proper form labels with `htmlFor`
- ✓ Keyboard navigation support
- ✓ Focus management
- ✓ Status announcements for dynamic content

### Keyboard Navigation

- Tab: Move between elements
- Enter/Space: Activate buttons
- Escape: Close modals/dialogs (when implemented)

## Testing

### Unit Tests

```bash
npm test  # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

Test files follow the `.test.js` naming convention:

- `components/Words/WordForm.test.js`
- `components/Quiz/QuizComponent.test.js`
- `services/vocabulary.test.js`

### E2E Tests

```bash
# Install Playwright (one-time setup)
npm install -D @playwright/test

# Run E2E tests
npx playwright test frontend/tests/e2e/

# Run specific test
npx playwright test frontend/tests/e2e/full-user-flow.spec.js

# Debug mode
npx playwright test --debug
```

### Generate Tests with LLM

```bash
# Requires Ollama running locally
python frontend/tests/llm/generate_tests.py --model llama2 --output tests/unit/
```

## Performance

See [PERFORMANCE.md](PERFORMANCE.md) for:

- Performance benchmarks and goals
- Bundle size analysis
- Optimization techniques
- Lighthouse scores
- Recommendations for production

Current metrics:

- Bundle size: ~150KB (gzipped ~48KB)
- First Contentful Paint: <1.5s
- Time to Interactive: <2.5s

## Development Workflow

### 1. Create a Component

```bash
# New component file
touch src/components/MyComponent/MyComponent.jsx
touch src/components/MyComponent/MyComponent.css
```

### 2. Implement Component

```jsx
import './MyComponent.css';

export const MyComponent = () => {
  return <div className="my-component">{/* component content */}</div>;
};
```

### 3. Add Tests

```javascript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### 4. Update Styles

```css
/* MyComponent.css */
.my-component {
  /* styles */
}
```

## Debugging

### Vite DevTools

1. Open browser console (F12)
2. Check Vite DevTools tab for component info

### React DevTools

1. Install React DevTools browser extension
2. Inspect components and hooks
3. Profile component performance

### Network Tab

1. Check API calls in Network tab
2. Verify request/response format
3. Check for CORS issues

## Troubleshooting

### Port 5173 Already in Use

```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>

# Or specify different port
npm run dev -- --port 3000
```

### API Not Found (404)

```bash
# Check VITE_API_URL in .env
# Should be: http://localhost:8000

# Verify backend is running
curl http://localhost:8000/docs

# Check CORS headers in browser console
```

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf dist node_modules/.vite

# Try build again
npm run build
```

## Environment Variables

Configuration via `.env.example`:

```env
# API endpoint
VITE_API_URL=http://localhost:8000

# Development
VITE_DEBUG=true
```

**Note**: Only variables prefixed with `VITE_` are exposed to the client.

## Production Deployment

```bash
# Build for production
npm run build

# The dist/ directory is ready to deploy:
# - Upload to static hosting (Netlify, Vercel, etc.)
# - Or serve with Nginx/Apache
# - Or use as SPA with backend serving

# Example: Nginx configuration
location / {
  root /path/to/dist;
  try_files $uri /index.html;  # SPA routing
}
```

## Security

See [SECURITY.md](../SECURITY.md) for:

- Environment variable security
- XSS prevention
- API security
- Dependency audit
- OWASP considerations

## Contributing

- Use functional components with hooks
- Write tests for new features
- Follow ESLint rules
- Update documentation
- Test on multiple browsers

## License

See LICENSE file in project root.
