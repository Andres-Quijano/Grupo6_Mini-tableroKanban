/**
 * Evita que el texto escrito por el usuario se interprete como HTML
 * al insertarlo en la página (previene inyección de etiquetas).
 */
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}
