import {addDays} from '../src/date-utils.js';
export const today='2026-10-18';
export const food={id:'milk',name:'Leche',unit:'ml',kcal:61,protein:3.2,carbs:4.8,fat:3.3};
export const recipe={id:'r1',name:'Batido',servings:2,items:[{id:'i1',name:'Leche',grams:200,unit:'ml',kcal:122,protein:6.4,carbs:9.6,fat:6.6}]};
export const paceWeights=(perWeek=-0.9,{days=22,from=70,start='2026-09-27'}={})=>Array.from({length:days},(_,i)=>({id:'w'+i,date:addDays(start,i),kg:+(from+perWeek*i/7).toFixed(2)}));
export const paceGoals={weeklyChange:-0.4,kcalTarget:2000,proteinTarget:140,autoMacros:true,paceCheckedAt:'',extra:'preservar'};
