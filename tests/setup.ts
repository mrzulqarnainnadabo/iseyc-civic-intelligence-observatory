import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// globals are disabled, so Testing Library's automatic cleanup does not run: do it explicitly.
afterEach(() => cleanup());
