import { createDemoAdapter } from './demoAdapter';
import type { ObservatoryAdapter } from '../data/types';

/** Live HTTP adapter is never selected by default. */
export function selectAdapter(): ObservatoryAdapter {
  return createDemoAdapter();
}

export { createDemoAdapter } from './demoAdapter';
export { createHttpAdapter, NotConfiguredError, ContractError } from './httpAdapter';
export type { HttpAdapterConfig, HttpEndpoints } from './httpAdapter';
