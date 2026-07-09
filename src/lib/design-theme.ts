import { defineTheme } from '@astryxdesign/core/theme';
import { neutralIconRegistry } from '@astryxdesign/theme-neutral';

export const designTheme = defineTheme({
  name: 'lessence',
  tokens: {
    '--color-accent': '#C9A96E',
    '--color-accent-muted': '#D4BC8233',
    '--color-on-accent': '#1A1A1A',
    '--color-neutral': 'rgba(0, 0, 0, 0.08)',
    '--color-background-surface': '#FFFFFF',
    '--color-background-body': '#F5F5F5',
    '--color-background-card': '#FFFFFF',
    '--color-background-popover': '#FFFFFF',
    '--color-overlay': 'rgba(0, 0, 0, 0.4)',
    '--color-text-primary': '#1A1A1A',
    '--color-text-secondary': '#666666',
    '--color-text-disabled': '#999999',
    '--color-text-accent': '#C9A96E',
    '--color-icon-accent': '#C9A96E',
    '--color-icon-primary': '#1A1A1A',
    '--color-icon-secondary': '#666666',
    '--color-border': '#E8E8E8',
    '--color-border-emphasized': '#D4BC82',
    '--color-track': '#E8E8E8',
    '--color-skeleton': '#E8E8E8',
    '--color-shadow': 'rgba(0, 0, 0, 0.08)',
    '--color-tint-hover': 'black',
    '--font-family-body': 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
    '--font-family-heading': 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
  },
  components: {
    button: {
      'variant:primary': {
        ':hover': {
          backgroundColor: '#B8944F',
        },
      },
    },
  },
  icons: neutralIconRegistry,
});
