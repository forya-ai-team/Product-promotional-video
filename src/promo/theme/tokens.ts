export const tokens = {
  color: {
    background: '#0b0d12',
    surface: '#141821',
    surfaceRaised: '#1b2130',
    text: '#e8eaf0',
    textMuted: '#8b93a7',
    accent: '#d3923c',
    border: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.24)',
  },
  fontFamily: {
    sans: '"Inter", "Segoe UI", "Microsoft YaHei", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
  },
  radius: {
    small: 8,
    medium: 16,
    large: 24,
  },
  spacing: (units: number) => units * 8,
};
