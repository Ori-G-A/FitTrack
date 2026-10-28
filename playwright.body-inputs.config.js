import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:['browser-tests/body-inputs.spec.js','change-tests/body-inputs.spec.js'],outputDir:'./test-results/body010-playwright',workers:1,retries:0,timeout:120000,use:{browserName:'chromium'},reporter:'list'});
