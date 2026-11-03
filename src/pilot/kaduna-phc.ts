/**
 * 90-day pilot scope — Primary healthcare service delivery, Kaduna State.
 * Configuration only. Does not invent facilities, stats or outcomes.
 */
export const KADUNA_PHC_PILOT = {
  id: 'pilot-kaduna-phc-2026',
  title: 'Primary healthcare service delivery — Kaduna State',
  stateId: 'kaduna',
  stateName: 'Kaduna',
  sectors: ['health'] as const,
  duties: ['Health'] as const,
  questions: [
    'What have community members reported in published records?',
    'What public evidence exists in the source registry for this scope?',
    'What does available evidence establish — and not establish?',
    'What remains unknown?',
    'What should be checked next?',
  ],
  researchThemes: [
    'Access to primary healthcare facilities',
    'Essential medicines availability (public sources only)',
    'Healthcare staffing (public sources only)',
    'Facility functionality (public sources only)',
    'Documented service-delivery commitments (public sources only)',
  ],
  rules: {
    noPrevalenceFromCommunityReports: true,
    noAnnouncementAsImplementation: true,
    noInventedDatasets: true,
    humanReviewRequiredForBriefs: true,
  },
} as const;
