import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva destinos de registrar segun ciclo', {timeout:45000}, () => cases['registration']());
