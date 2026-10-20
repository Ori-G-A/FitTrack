import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva destinos y fecha del dia del plan', {timeout:45000}, () => cases['plan']());
