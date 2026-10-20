import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva fecha enfocada y tarjeta solicitada', {timeout:45000}, () => cases['routing']());
