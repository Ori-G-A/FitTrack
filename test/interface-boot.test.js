import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva cargas reintentos errores y estado de guardado', {timeout:45000}, () => cases['boot']());
