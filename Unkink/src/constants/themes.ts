export interface Theme {
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  highlight: string;
  toggleBg: string;
  modeLabel: string;
}

export const deskTheme: Theme = {
  background: '#2A2A2A',
  cardBg: '#3A3A3A',
  textPrimary: '#F5F5F5',
  textSecondary: '#B8B8B8',
  accent: '#D4D4D4',
  highlight: '#A7A7A7',
  toggleBg: '#4C4C4C',
  modeLabel: 'Desk Mode (Seated)',
};

export const openSpaceTheme: Theme = {
  background: '#EAF6FF',
  cardBg: '#F3FBFF',
  textPrimary: '#153C63',
  textSecondary: '#4E6F8D',
  accent: '#5DB8FF',
  highlight: '#9BD7FF',
  toggleBg: '#D8EEFF',
  modeLabel: 'Open Space Mode (Standing)',
};