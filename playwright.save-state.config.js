import {defineConfig} from '@playwright/test';
import base from './playwright.config.js';
export default defineConfig({...base,projects:undefined,testDir:'./change-tests',testMatch:'save-state.spec.js',timeout:30000,expect:{timeout:3000},outputDir:'./test-results/save-state-change',reporter:[['list']]});
