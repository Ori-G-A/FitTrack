import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva raices activas y entradas de shell', {timeout:45000}, () => cases['navigation']());
