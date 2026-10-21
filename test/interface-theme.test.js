import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva preferencia y fallos de almacenamiento', {timeout:45000}, () => cases['theme']());
