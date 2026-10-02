// Estructura de categorías
const categories = {
  male:   { name: 'Hombre',   code: 'ArrowLeft',  display: 'Flecha Izq',   count: 0 },
  female: { name: 'Mujer',    code: 'ArrowRight', display: 'Flecha Der',   count: 0 },
  boy:    { name: 'Niño',     code: 'ArrowUp',    display: 'Flecha Arriba',count: 0 },
  girl:   { name: 'Niña',     code: 'ArrowDown',  display: 'Flecha Abajo', count: 0 },
  pet:    { name: 'Mascota',  code: 'KeyM',       display: 'Tecla M',      count: 0 }
};

let history = []; // Pila para deshacer
let listeningTarget = null; // Para reconfiguración de teclas

const toast = document.getElementById('toast');

// Escuchar pulsaciones de teclado globales
window.addEventListener('keydown', (e) => {
  // 1. Reconfigurar tecla si hay alguna activa
  if (listeningTarget) {
    e.preventDefault();
    const display = formatKeyDisplay(e);
    
    categories[listeningTarget].code = e.code;
    categories[listeningTarget].display = display;

    const btn = document.getElementById(`btnKey_${listeningTarget}`);
    btn.textContent = display;
    btn.classList.remove('listening');
    
    listeningTarget = null;
    return;
  }

  // 2. Tecla para Deshacer (Ctrl+Z)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undoLastAction();
    return;
  }

  // 3. Comprobar si la tecla pulsada coincide con alguna categoría
  for (const [key, cat] of Object.entries(categories)) {
    if (e.code === cat.code) {
      e.preventDefault();
      registerEntry(key);
      break;
    }
  }
});

// Iniciar escucha para reconfigurar tecla
function startListening(key) {
  listeningTarget = key;
  
  Object.keys(categories).forEach(k => {
    document.getElementById(`btnKey_${k}`).classList.remove('listening');
  });

  const btn = document.getElementById(`btnKey_${key}`);
  btn.classList.add('listening');
  btn.textContent = 'Presiona...';
}

// Formatear texto de la tecla
function formatKeyDisplay(e) {
  if (e.code === 'Space') return 'Espacio';
  if (e.code.startsWith('Arrow')) return 'Flecha ' + e.code.replace('Arrow', '');
  if (e.code.startsWith('Key')) return 'Tecla ' + e.code.replace('Key', '');
  if (e.key.length === 1) return e.key.toUpperCase();
  return e.key;
}

// Incrementar conteo
function registerEntry(key) {
  categories[key].count++;
  history.push(key);

  const card = document.getElementById(`card_${key}`);
  triggerFlash(card);
  showToast(`+1 ${categories[key].name}`);
  updateDisplay();
}

// Ajuste manual con botones +1 / -1
function adjustCount(key, delta) {
  if (categories[key].count + delta >= 0) {
    categories[key].count += delta;
    updateDisplay();
  }
}

// Animación visual de la tarjeta
function triggerFlash(cardElement) {
  cardElement.classList.remove('active-flash');
  void cardElement.offsetWidth; // Forzar reflow
  cardElement.classList.add('active-flash');

  setTimeout(() => {
    cardElement.classList.remove('active-flash');
  }, 150);
}

// Actualizar datos en pantalla (Personas, Mascotas y Aforo Total)
function updateDisplay() {
  let totalPersons = 0;
  let totalPets = 0;

  for (const [key, cat] of Object.entries(categories)) {
    document.getElementById(`count_${key}`).textContent = cat.count;

    if (key === 'pet') {
      totalPets += cat.count;
    } else {
      totalPersons += cat.count;
    }
  }

  document.getElementById('totalPersons').textContent = totalPersons;
  document.getElementById('totalPets').textContent = totalPets;
  document.getElementById('totalCount').textContent = totalPersons + totalPets;
}

// Deshacer última acción
function undoLastAction() {
  if (history.length === 0) return;
  const lastKey = history.pop();
  if (categories[lastKey].count > 0) {
    categories[lastKey].count--;
    showToast(`↩ Deshecho ${categories[lastKey].name}`);
    updateDisplay();
  }
}

// Reiniciar todos los contadores
function resetAll() {
  const total = Object.values(categories).reduce((acc, c) => acc + c.count, 0);
  if (total === 0) return;

  if (confirm('¿Quieres reiniciar todos los contadores a 0?')) {
    Object.keys(categories).forEach(k => categories[k].count = 0);
    history = [];
    updateDisplay();
    showToast('Reinicio completado');
  }
}

// Toast flotante
let toastTimeout;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1200);
}