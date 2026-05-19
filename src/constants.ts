export const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Female/Soft' },
  { id: '29vD33N1HAbCDqEEUXHO', name: 'Drew', description: 'Male/News' },
  { id: '2EiwWubcwB8SgLzSgn69', name: 'Clyde', description: 'Male/Deep' },
] as const;

export type VoiceId = typeof VOICES[number]['id'];
