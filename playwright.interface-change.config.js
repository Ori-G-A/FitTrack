import {defineConfig} from '@playwright/test';
import base from './playwright.config.js';
export default defineConfig({...base,projects:undefined,testDir:'./change-tests',timeout:20000,expect:{timeout:3000},outputDir:'./test-results/interface-change',reporter:[['list'],['json',{outputFile:'test-results/interface-change.json'}]]});
