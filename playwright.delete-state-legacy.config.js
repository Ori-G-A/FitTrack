import {defineConfig} from '@playwright/test';
import base from './playwright.config.js';
export default defineConfig({...base,projects:base.projects.map(p=>({...p,testIgnore:'**/delete-state.spec.js'})),outputDir:'./test-results/delete-state-legacy',reporter:[['list'],['json',{outputFile:'test-results/delete008-legacy-browser.json'}]]});
