import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./change-tests',testMatch:'clock-state.spec.js',outputDir:'./test-results/clock009-playwright',workers:1,retries:0,timeout:120000,use:{browserName:'chromium',viewport:{width:1280,height:900}},reporter:'list'});
