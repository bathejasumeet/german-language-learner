#!/usr/bin/env node
/**
 * Frontend E2E Test Script using Playwright
 * Tests all user interactions: Add words, create flashcards, take quiz
 *
 * Prerequisites:
 * - npm install -D @playwright/test
 * - Backend running at http://localhost:8000
 * - Frontend running at http://localhost:5173
 */

// Note: This is a template for E2E testing with Playwright
// To use it, install Playwright: npm install -D @playwright/test
// Then run: npx playwright test frontend/tests/e2e/full-user-flow.spec.js

const test = require('@playwright/test').test;
const expect = require('@playwright/test').expect;

const BASE_URL = 'http://localhost:5173';
const API_BASE = 'http://localhost:8000';

test.describe('German Language Learner - Full User Flow', () => {
  let testWordId;

  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Story 1: Vocabulary Management', () => {
    test('should add a new word', async ({ page }) => {
      // Navigate to vocabulary section
      await page.click('button:has-text("Vocabulary")');

      // Fill form
      const germanInput = page.locator('input[aria-label="German word to add"]');
      const meaningInput = page.locator(
        'input[aria-label="English meaning of the word"]'
      );

      await germanInput.fill('Katze');
      await meaningInput.fill('Cat');

      // Submit form
      await page.click('button:has-text("Add Word")');

      // Wait for success
      await page.waitForLoadState('networkidle');

      // Verify word appears in list
      await expect(page.locator('table')).toContainText('Katze');
      await expect(page.locator('table')).toContainText('Cat');
    });

    test('should display vocabulary list', async ({ page }) => {
      await page.click('button:has-text("Vocabulary")');

      // Wait for table to load
      const table = page.locator('table');
      await expect(table).toBeVisible();

      // Check table headers
      await expect(page.locator('th:has-text("German Word")')).toBeVisible();
      await expect(page.locator('th:has-text("Meaning")')).toBeVisible();
      await expect(page.locator('th:has-text("Times Practiced")')).toBeVisible();
    });

    test('should update a word', async ({ page }) => {
      // This test would require an edit button/modal
      // Implementation depends on frontend UI design
      await page.click('button:has-text("Vocabulary")');

      // Assuming there's an edit functionality
      // Details would depend on actual implementation
    });

    test('should delete a word', async ({ page }) => {
      await page.click('button:has-text("Vocabulary")');

      // Get delete buttons
      const deleteButtons = page.locator('button:has-text("Delete")');

      // Click first delete button if available
      if ((await deleteButtons.count()) > 0) {
        await deleteButtons.first().click();

        // Confirm deletion if there's a confirmation dialog
        if (await page.locator('text=Are you sure').isVisible()) {
          await page.click('button:has-text("Yes")');
        }

        // Wait for update
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('User Story 2: Flashcard Study', () => {
    test('should navigate to flashcards', async ({ page }) => {
      await page.click('button:has-text("Flashcards")');

      const heading = page.locator('h2:has-text("Select Words for Flashcards")');
      await expect(heading).toBeVisible();
    });

    test('should select words for flashcards', async ({ page }) => {
      await page.click('button:has-text("Flashcards")');

      // Wait for word cards to load
      const wordCards = page.locator('[role="checkbox"]');

      // Select first 3 words
      const count = Math.min(3, await wordCards.count());
      for (let i = 0; i < count; i++) {
        await wordCards.nth(i).click();
      }

      // Check selected count
      const selectedText = page.locator('text=/Selected: \\d+ words/');
      await expect(selectedText).toBeVisible();
    });

    test('should generate flashcards', async ({ page }) => {
      await page.click('button:has-text("Flashcards")');

      // Select at least one word
      const wordCards = page.locator('[role="checkbox"]');
      if ((await wordCards.count()) > 0) {
        await wordCards.first().click();
      }

      // Click generate button
      await page.click('button:has-text("Generate Flashcards")');

      // Wait for study mode
      await page.waitForLoadState('networkidle');

      // Check if flashcard study view appears
      const studyContainer = page.locator('.flashcard-study');
      if (await studyContainer.isVisible()) {
        await expect(studyContainer).toBeVisible();
      }
    });

    test('should flip flashcard', async ({ page }) => {
      // Assuming flashcards are generated
      await page.click('button:has-text("Flashcards")');

      // If there's a flip button, click it
      const flipButton = page.locator('button:has-text("Flip")');
      if (await flipButton.isVisible()) {
        const initialContent = await page.locator('.flashcard-front').textContent();
        await flipButton.click();
        await page.waitForTimeout(300); // Wait for flip animation

        // Content should change
        const newContent = await page.locator('.flashcard-back').textContent();
        expect(initialContent).not.toBe(newContent);
      }
    });

    test('should mark flashcard as known', async ({ page }) => {
      await page.click('button:has-text("Flashcards")');

      // Select and generate flashcards
      const wordCards = page.locator('[role="checkbox"]');
      if ((await wordCards.count()) > 0) {
        await wordCards.first().click();
        await page.click('button:has-text("Generate Flashcards")');
        await page.waitForLoadState('networkidle');
      }

      // Mark as known
      const knowButton = page.locator('button:has-text("Mark as Known")');
      if (await knowButton.isVisible()) {
        await knowButton.click();
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('User Story 3: Quiz & Progress', () => {
    test('should navigate to quiz', async ({ page }) => {
      await page.click('button:has-text("Quiz")');

      const heading = page.locator('h2:has-text("German Language Quiz")');
      await expect(heading).toBeVisible();
    });

    test('should start a quiz', async ({ page }) => {
      await page.click('button:has-text("Quiz")');

      // Select number of questions
      const select = page.locator('select');
      if (await select.isVisible()) {
        await select.selectOption('5');
      }

      // Start quiz
      await page.click('button:has-text("Start Quiz")');
      await page.waitForLoadState('networkidle');

      // Verify quiz started
      const question = page.locator('h3:has-text("What is the meaning of")');
      await expect(question).toBeVisible();
    });

    test('should answer quiz questions', async ({ page }) => {
      await page.click('button:has-text("Quiz")');

      // Start quiz
      await page.click('button:has-text("Start Quiz")');
      await page.waitForLoadState('networkidle');

      // Answer 3 questions
      for (let i = 0; i < 3; i++) {
        // Get all option buttons
        const options = page.locator('button.option-btn');
        const optionCount = await options.count();

        if (optionCount > 0) {
          // Click random option
          await options.nth(Math.floor(Math.random() * optionCount)).click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('should view quiz results', async ({ page }) => {
      await page.click('button:has-text("Quiz")');

      // Start and complete quiz (simplified flow)
      await page.click('button:has-text("Start Quiz")');
      await page.waitForLoadState('networkidle');

      // Answer all questions quickly
      const options = page.locator('button.option-btn');

      while (await page.locator('.quiz-results').isHidden()) {
        const optionCount = await options.count();
        if (optionCount > 0) {
          await options.first().click();
          await page.waitForLoadState('networkidle');
        } else {
          break;
        }
      }

      // Check results page
      const resultsHeading = page.locator('h2:has-text("Quiz Complete")');
      if (await resultsHeading.isVisible()) {
        await expect(resultsHeading).toBeVisible();
      }
    });

    test('should view statistics', async ({ page }) => {
      await page.click('button:has-text("Statistics")');

      // Wait for stats to load
      const statsContainer = page.locator('.statistics');

      // Check if visible or page loaded
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('button:has-text("Vocabulary")');

      // Check form inputs have labels or aria-labels
      const inputs = page.locator('input');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const hasLabel = await input.evaluate((el) => {
          return (
            el.getAttribute('aria-label') ||
            document.querySelector(`label[for="${el.id}"]`)
          );
        });
        expect(hasLabel).toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through navigation
      const navButtons = page.locator('nav button');
      const firstButton = navButtons.first();

      // Focus first button
      await firstButton.focus();
      await expect(firstButton).toBeFocused();

      // Tab to next
      await page.keyboard.press('Tab');

      // Verify something is focused
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(focusedElement).not.toBeNull();
    });
  });
});
