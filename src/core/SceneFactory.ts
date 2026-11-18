import type {ThemeConfig} from '../themes/types';
import {ForestScene} from '../scene/ForestScene';
import type {SceneWorld} from './types';
export type {SceneWorld} from './types';
type Builder=(canvas:HTMLCanvasElement,theme:ThemeConfig)=>SceneWorld;
const builders=new Map<string,Builder>([['forest',(canvas,theme)=>new ForestScene(canvas,theme.zones)]]);
export function registerScene(type:string,builder:Builder){builders.set(type,builder);}
export function createScene(canvas:HTMLCanvasElement,theme:ThemeConfig){
 const build=builders.get(theme.sceneType);
 if(!build)throw new Error('此場景尚未註冊：'+theme.sceneType);
 return build(canvas,theme);
}
