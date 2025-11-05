import { createContext } from 'react';
import { InnerApps } from './appsData';
import type { AppInterface } from './appsData';

export { InnerApps };
export type { AppInterface };

export const AppsContext = createContext<AppInterface[] | undefined>(undefined);
export const AppsProvider = AppsContext.Provider;
export const AppsConsumer = AppsContext.Consumer;
