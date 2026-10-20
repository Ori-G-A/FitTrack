import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva busqueda filtros limites y vacios de diario', {timeout:45000}, () => cases['diary']());
