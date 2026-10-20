import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva fachadas CSS y contratos anteriores', {timeout:45000}, () => cases['compatibility']());
