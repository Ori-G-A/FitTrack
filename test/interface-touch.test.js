import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva cabecera sticky y medidas tactiles', {timeout:45000}, () => cases['touch']());
