import type { ThemeConfig } from './types';
import {janeGoodall} from './jane-goodall';
const registry: Record<string,ThemeConfig>={ [janeGoodall.id]:janeGoodall };
export function getTheme(id:string|null):ThemeConfig {return (id && registry[id]) || janeGoodall;}
export const themes = Object.values(registry);
// To add a subject: implement an independent theme config and register it here.
// Unique scenes/experiments can be added to the scene factory without rewriting tasks/UI.
