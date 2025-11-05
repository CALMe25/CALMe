import { createContext } from 'react';
import { InnerApps, quickActivityOrder } from './appsData';
import type { AppInterface } from './appsData';

export { InnerApps, quickActivityOrder };
export type { AppInterface };

export const AppsContext = createContext<AppInterface[] | undefined>(undefined);
export const AppsProvider = AppsContext.Provider;
export const AppsConsumer = AppsContext.Consumer;
