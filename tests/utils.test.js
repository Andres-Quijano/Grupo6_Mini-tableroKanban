import { escapeHtml } from '../src/utils/escapeHtml.js';
import { loadSampleTasks } from '../src/data/sampleTasks.js';
import { Board } from '../src/domain/Board.js';

describe('escapeHtml', () => {
  test('neutraliza etiquetas y comillas', () => {
    expect(escapeHtml('<img src="x" onerror=\'a\'> & b')).toBe(
      '&lt;img src=&quot;x&quot; onerror=&#39;a&#39;&gt; &amp; b',
    );
  });

  test('convierte valores que no son texto', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

describe('loadSampleTasks', () => {
  test('carga los datos de ejemplo respetando todas las políticas', () => {
    const board = new Board();
    loadSampleTasks(board);
    expect(board.columns.map((c) => c.tasks.length)).toEqual([1, 1, 1, 0]);
  });
});
