import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva descarte general siete dias y deshacer', {timeout:45000}, () => cases['dismiss']());
