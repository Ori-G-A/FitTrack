import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva componentes fechas movimiento y cleanup', {timeout:45000}, () => cases['editorial']());
