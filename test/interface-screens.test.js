import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva recorridos y salidas de registro', {timeout:45000}, () => cases['screens']());
