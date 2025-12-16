export const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'de-DE', name: 'German' },
  { code: 'fr-FR', name: 'French' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
];

export const TECHNICAL_DOMAINS = [
  'General Technical',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Civil & Construction',
  'Automotive',
  'Medical Devices',
  'Oil & Gas / Mining',
  'Computer Science / IT',
];

export const MOCK_LOGS_INIT = [
  { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'System initialized. Ready for PDF import.', type: 'info' }
];
