export type ZoneId = 'camp' | 'observe' | 'tools' | 'protect';
export interface Knowledge { id:string; zone: ZoneId; icon: string; title:string; body:string; action:string; }
export interface Question { id:string; title:string; options: string[]; correct:number; explain:string; hint?:string; }
export interface ZoneInfo { id: ZoneId; short:string; title:string; subtitle:string; x:number; z:number; yaw?:number; accent:string; }
export interface ThemeConfig {
 subtitle:string; palette:{accent:string}; minecraftChallenges:string[];
 completion:{title:string;summary:string;badge:string};
 sceneType:string; station:string; initials:string; spawn:{x:number;z:number;yaw:number}; missions:Record<ZoneId,string>;
 id:string; title:string; englishTitle:string; course:string; heroText:string; intro:string;
 goals: string[]; zones:ZoneInfo[]; knowledge:Knowledge[]; questions: Question[];
 challenges:string[]; primary:string; mentor:string;
}
