import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva contenido y cierres de desglose', {timeout:45000}, () => cases['detail']());
