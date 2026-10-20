import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva alias de cuenta y seleccion local', {timeout:45000}, () => cases['account']());
