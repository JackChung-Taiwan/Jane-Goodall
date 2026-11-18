import type { ThemeConfig } from './types';
import {janeGoodall} from './jane-goodall';
const registry: Record<string,ThemeConfig>={ [janeGoodall.id]:janeGoodall };
export function getTheme(id:string|null):ThemeConfig {return (id && registry[id]) || janeGoodall;}
export const themes = Object.values(registry);
// To add a subject: implement an independent theme config and register it here.
// Unique scenes/experiments can be added to the scene factory without rewriting tasks/UI.

import {installResearch} from '../interactions/Research';
import type {App} from '../core/App';
import type {Experience} from '../core/types';
const experiences=new Map<string,(app:App)=>Experience>([['jane-goodall',installResearch]]);
export function registerTheme(theme:ThemeConfig,install:(app:App)=>Experience){registry[theme.id]=theme;experiences.set(theme.id,install);}
export function getExperience(theme:ThemeConfig){const install=experiences.get(theme.id);if(!install)throw new Error('主題互動尚未註冊');return install;}
