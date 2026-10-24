import {defineConfig} from '@playwright/test';
import base from './playwright.config.js';
export default defineConfig({...base,projects:undefined,testDir:'./change-tests',testMatch:'delete-state.spec.js',timeout:30000,expect:{timeout:2000},outputDir:'./test-results/delete-state-change',reporter:[['list'],['json',{outputFile:'test-results/delete008-change-browser.json'}]]});
