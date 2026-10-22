import {defineConfig} from '@playwright/test';
import base from './playwright.config.js';
// Solo E1: la presentación 007 conserva sus dos rojos y se ejecuta separada.
export default defineConfig({...base,projects:base.projects.map(project=>({...project,testIgnore:'**/save-state.spec.js'}))});
