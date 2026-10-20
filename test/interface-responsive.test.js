import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva CSS y matriz responsive original', {timeout:45000}, () => cases['responsive']());
