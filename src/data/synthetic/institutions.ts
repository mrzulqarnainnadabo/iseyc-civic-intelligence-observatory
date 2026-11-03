import type { Institution } from '../types';

const NOTE = 'Illustrative assignment for the demonstration build. Legal basis (enabling Act or instrument) is not attached and must be added and reviewed before any real publication.';
export const INSTITUTIONS: Institution[] = [
  { id: 'fme', name: 'Federal Ministry of Education', tier: 'federal', sectors: ['education'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'ubec', name: 'Universal Basic Education Commission (UBEC)', tier: 'federal', sectors: ['education'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'subeb', name: 'State Universal Basic Education Board (SUBEB)', tier: 'state', sectors: ['education'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'fmohsw', name: 'Federal Ministry of Health and Social Welfare', tier: 'federal', sectors: ['health'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'state-moh', name: 'State Ministry of Health', tier: 'state', sectors: ['health'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'fmwrs', name: 'Federal Ministry of Water Resources and Sanitation', tier: 'federal', sectors: ['water-sanitation'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'state-water', name: 'State water agency (name varies by state)', tier: 'state', sectors: ['water-sanitation'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'fmw', name: 'Federal Ministry of Works', tier: 'federal', sectors: ['infrastructure'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'state-works', name: 'State ministry responsible for works (name varies by state)', tier: 'state', sectors: ['infrastructure'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'nerc', name: 'Nigerian Electricity Regulatory Commission (NERC)', tier: 'federal', sectors: ['infrastructure'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'police', name: 'Nigeria Police Force', tier: 'federal', sectors: ['security'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'fmle', name: 'Federal Ministry of Labour and Employment', tier: 'federal', sectors: ['employment'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'bpp', name: 'Bureau of Public Procurement (BPP)', tier: 'federal', sectors: ['public-finance', 'governance'], responsibilityBasis: 'unverified', basisNote: NOTE },
  { id: 'lga', name: 'Local government council', tier: 'local', sectors: ['education', 'health', 'water-sanitation', 'infrastructure', 'governance'], responsibilityBasis: 'unverified', basisNote: NOTE },
];
