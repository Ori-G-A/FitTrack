import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva filtro ancla resaltado y retorno temprano', {timeout:45000}, () => cases['metric-focus']());
