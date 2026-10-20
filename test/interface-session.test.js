import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva foco visual de sesion y salida limpia', {timeout:45000}, () => cases['session']());
