import { ScreenModel } from './ScreenModel.js';

const screenMod = new ScreenModel();
screenMod.setRowFromChars(0, 'this is a test');
screenMod.setTestPage1();
screenMod.dumpToConsole();
const row = screenMod.getRow(1);
console.log(row);
