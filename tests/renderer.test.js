/**
 * @jest-environment jsdom
 */

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const path = require('path');
const { JSDOM } = require('jsdom');

describe('Renderer Test', () => {
  let dom, window, document;

  beforeEach(async () => {
    // 1. Мокаем fetch и ProfileAPI
    global.fetch = jest.fn((url) => {
      if (url.includes('/load')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            coins: 150,
            level: 2,
            damage: 10,
            monster_health: 180,
            damage_upgrade_price: 40,
            damage_upgrades: 2,
            coins_per_second: 5,
            cps_upgrades: 1,
            cps_upgrade_price: 30
          })
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
    });

      global.ProfileAPI = {
    incrementClickCounter: jest.fn(),
    saveProfile: jest.fn(() => Promise.resolve())
  };

    // 2. Создаём DOM с предустановленными моками
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Мок для ProfileAPI
            window.ProfileAPI = {
              incrementClickCounter: jest.fn(),
              saveProfile: jest.fn(() => Promise.resolve())
            };
          </script>
        </head>
        <body>
          <div id="monster"></div>
          <div id="coins">0</div>
          <div class="health">Здоровье: 100</div>
          <div id="damageContainer"></div>
          <div id="level">Уровень: 1</div>
          <script src="file://${path.resolve(__dirname, '../client/src/renderer.js')}"></script>
        </body>
      </html>
    `;

    // 3. Инициализируем JSDOM
    dom = await new JSDOM(html, {
      runScripts: "dangerously",
      resources: "usable",
      url: "http://localhost",
      beforeParse(window) {
        window.fetch = global.fetch; // Критически важно!
      }
    });

    window = dom.window;
    document = window.document;

    // 4. Ждём полной инициализации
    await new Promise(resolve => {
      window.addEventListener('load', resolve);
    });
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test('loadGame корректно обновляет интерфейс', async () => {
    expect(document.getElementById('coins').textContent).toBe('150');
    expect(document.querySelector('.health').textContent).toBe('Здоровье: 180');
    expect(document.getElementById('level').textContent).toBe('Уровень: 2');
  });

  test('клик по монстру уменьшает здоровье', async () => {
    const monster = document.getElementById('monster');
    monster.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(document.querySelector('.health').textContent).toBe('Здоровье: 170');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5001/save',
      expect.anything()
    );
  });
});