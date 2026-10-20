import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva toast ultimo mensaje plazo y limpieza', {timeout:45000}, () => cases['toast']());
