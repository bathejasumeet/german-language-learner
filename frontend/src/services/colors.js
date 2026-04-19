/**
 * Centralized Color Palette Utility
 *
 * This file defines the consistent color scheme for the German Language Learner application.
 * Import colors from this file to ensure UI consistency across all components.
 *
 * Usage:
 *   import { colors } from './colors.js';
 *   <button style={{ backgroundColor: colors.PRIMARY }}>Click me</button>
 */

export const colors = {
  // Primary brand color - used for main actions, headers
  PRIMARY: '#2563eb', // Blue

  // Secondary accent color - used for alternative actions
  SECONDARY: '#8b5cf6', // Purple

  // Success state - used for positive feedback, correct answers
  SUCCESS: '#10b981', // Green

  // Error/danger state - used for incorrect answers, error messages
  ERROR: '#ef4444', // Red

  // Neutral/muted color - used for secondary text, disabled states
  NEUTRAL: '#6b7280', // Gray

  // Background color - used for page backgrounds, light surfaces
  BACKGROUND: '#f9fafb', // Light gray

  // Text color - primary text color for readability
  TEXT: '#111827', // Dark gray/near-black

  // Border color - used for borders, dividers
  BORDER: '#e5e7eb', // Light border gray

  // Warning/caution color
  WARNING: '#f59e0b', // Amber

  // Info color - used for informational messages
  INFO: '#3b82f6', // Light blue
};

/**
 * Color variants for common UI patterns
 * Usage:
 *   <div style={{
 *     backgroundColor: colorVariants.buttonPrimary.background,
 *     color: colorVariants.buttonPrimary.text
 *   }}>
 *     Button
 *   </div>
 */
export const colorVariants = {
  // Button variants
  buttonPrimary: {
    background: colors.PRIMARY,
    text: '#ffffff',
    border: colors.PRIMARY,
    hover: '#1d4ed8',
    disabled: colors.NEUTRAL,
  },

  buttonSecondary: {
    background: colors.SECONDARY,
    text: '#ffffff',
    border: colors.SECONDARY,
    hover: '#7c3aed',
    disabled: colors.NEUTRAL,
  },

  buttonSuccess: {
    background: colors.SUCCESS,
    text: '#ffffff',
    border: colors.SUCCESS,
    hover: '#059669',
    disabled: colors.NEUTRAL,
  },

  buttonDanger: {
    background: colors.ERROR,
    text: '#ffffff',
    border: colors.ERROR,
    hover: '#dc2626',
    disabled: colors.NEUTRAL,
  },

  // Input field variants
  input: {
    background: '#ffffff',
    border: colors.BORDER,
    text: colors.TEXT,
    focusBorder: colors.PRIMARY,
    placeholder: colors.NEUTRAL,
  },

  // Card/container variants
  card: {
    background: '#ffffff',
    border: colors.BORDER,
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Feedback/alert variants
  successAlert: {
    background: '#ecfdf5',
    border: colors.SUCCESS,
    text: '#065f46',
  },

  errorAlert: {
    background: '#fef2f2',
    border: colors.ERROR,
    text: '#7f1d1d',
  },

  warningAlert: {
    background: '#fffbeb',
    border: colors.WARNING,
    text: '#78350f',
  },

  infoAlert: {
    background: '#eff6ff',
    border: colors.INFO,
    text: '#0c2d6b',
  },
};

/**
 * Helper function to apply color to an element
 * Usage:
 *   const buttonStyle = getColorStyle('buttonPrimary');
 */
export const getColorStyle = (variantName) => {
  return colorVariants[variantName] || {};
};

export default colors;
