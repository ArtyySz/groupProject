/**
 * @jest-environment jsdom
 */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const html = `
<!DOCTYPE html>
<html>
  <body>
    <div id="monster"></div>
    <div id="coins">0</div>
    <div class="health">Здоровье: 100</div>
    <div id="damageContainer"></div>
  </body>
</html>
`;

let dom;

beforeEach(() => {
  dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable"
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.fetch = jest.fn();
});

test('Game initializes and updates UI correctly', async () => {
  const {
    gameState,
    initGame,
    updateUI,
    initDOMElements,
    setupEventListeners
  } = require('../client/src/mainPage');

  initDOMElements();
  setupEventListeners();

  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve({ coins: 123, level: 2, damage: 5 })
  });

  await initGame();

  expect(fetch).toHaveBeenCalledWith('http://localhost:5000/load');
  expect(gameState.coins).toBe(123);
  expect(gameState.level).toBe(2);
  expect(gameState.damage).toBe(5);
});
