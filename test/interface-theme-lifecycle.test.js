import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva tema de sistema primer render y limpieza', {timeout:45000}, () => cases['theme-lifecycle']());
