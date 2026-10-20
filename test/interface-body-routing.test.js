import test from 'node:test';
import {cases} from '../test-support/interface-cases.js';
test('interfaz conserva alias seccion fecha y montaje de cuerpo', {timeout:45000}, () => cases['body-routing']());
