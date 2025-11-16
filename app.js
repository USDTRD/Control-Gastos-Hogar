// Variables globales
let gastos = JSON.parse(localStorage.getItem('gastosHogar') || '[]');
let gastosFiltrados = [...gastos];
let mesResumen = new Date();

// Colores profesionales por categoría
const coloresCategorias = {
    'Alquiler': { bg: '#fbbf24', text: '#78350f' },
    'Servicios Públicos': { bg: '#60a5fa', text: '#1e3a8a' },
    'Préstamos': { bg: '#f87171', text: '#991b1b' },
    'Restaurantes': { bg: '#fb923c', text: '#9a3412' },
    'Viajes': { bg: '#a78bfa', text: '#5b21b6' },
    'Gasolina': { bg: '#34d399', text: '#065f46' },
    'Personal/Chofer': { bg: '#38bdf8', text: '#075985' },
    'Compras Internet': { bg: '#c084fc', text: '#6b21a8' },
    'Supermercado': { bg: '#4ade80', text: '#166534' },
    'Farmacia': { bg: '#f472b6', text: '#9f1239' },
    'Ropa': { bg: '#818cf8', text: '#3730a3' },
    'Adicionales': { bg: '#fcd34d', text: '#78350f' },
    'Otros': { bg: '#94a3b8', text: '#334155' }
};

window.onload = function() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
    document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleString('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    actualizar();
};

function cambiarTab(tab) {
    ['tabGastos', 'tabResumen', 'tabGraficas'].forEach(id => {
        document.getElementById(id).className = 'tab-inactive px-6 py-3 rounded-xl font-bold transition-all cursor-pointer';
    });
    
    ['seccionGastos', 'seccionResumen', 'seccionGraficas'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
    const seccionId = 'seccion' + tab.charAt(0).toUpperCase() + tab.slice(1);
    
    document.getElementById(tabId).className = 'tab-active px-6 py-3 rounded-xl font-bold transition-all cursor-pointer';
    document.getElementById(seccionId).classList.remove('hidden');
    
    if (tab === 'resumen') actualizarResumen();
    if (tab === 'graficas') actualizarGraficas();
}

function agregarGasto() {
    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const moneda = document.getElementById('moneda').value;
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!fecha || !categoria || !monto || monto <= 0) {
        alert('Por favor completa fecha, categoría y un monto válido');
        return;
    }

    gastos.push({
        id: Date.now(),
        fecha: fecha,
        categoria: categoria,
        monto: monto,
        moneda: moneda,
        descripcion: descripcion
    });

    localStorage.setItem('gastosHogar', JSON.stringify(gastos));
    
    // Limpiar formulario
    document.getElementById('monto').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('categoria').value = '';

    gastosFiltrados = [...gastos];
    actualizar();
    
    // Mostrar feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ ¡Agregado!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
}

function eliminarGasto(id) {
    if (!confirm('¿Eliminar este gasto?')) return;
    gastos = gastos.filter(g => g.id !== id);
    localStorage.setItem('gastosHogar', JSON.stringify(gastos));
    gastosFiltrados = [...gastos];
    actualizar();
}

function filtrarGastos() {
    const categoria = document.getElementById('filtroCategoria').value;
    const desde = document.getElementById('filtroDesde').value;
    const hasta = document.getElementById('filtroHasta').value;
    const moneda = document.getElementById('filtroMoneda').value;

    gastosFiltrados = gastos.filter(g => {
        const matchCategoria = !categoria || g.categoria === categoria;
        const matchFecha = (!desde || g.fecha >= desde) && (!hasta || g.fecha <= hasta);
        const matchMoneda = !moneda || g.moneda === moneda;
        return matchCategoria && matchFecha && matchMoneda;
    });

    actualizarTablaGastos();
}

function actualizar() {
    actualizarTotales();
    actualizarTablaGastos();
    document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleString('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function actualizarTotales() {
    const mesActual = new Date().toISOString().substring(0, 7);
    const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mesActual));

    const totalUSD = gastosDelMes.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0);
    const totalDOP = gastosDelMes.filter(g => g.moneda === 'DOP').reduce((sum, g) => sum + g.monto, 0);

    document.getElementById('totalUSD').textContent = '$' + totalUSD.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalDOP').textContent = 'RD$' + totalDOP.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalGastos').textContent = gastosDelMes.length.toLocaleString('es-DO');
}

function actualizarTablaGastos() {
    const tbody = document.getElementById('tablaGastos');
    tbody.innerHTML = '';

    if (gastosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-12 text-gray-400 text-lg font-medium">No hay gastos registrados</td></tr>';
        return;
    }

    gastosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
        const colores = coloresCategorias[g.categoria] || { bg: '#94a3b8', text: '#334155' };
        const simboloMoneda = g.moneda === 'USD' ? '$' : 'RD$';
        
        const tr = document.createElement('tr');
        tr.className = 'table-row border-b border-gray-100';
        tr.innerHTML = `
            <td class="py-4 px-4 font-semibold text-gray-700">${formatearFecha(g.fecha)}</td>
            <td class="py-4 px-4">
                <span class="category-badge" style="background-color: ${colores.bg}; color: ${colores.text};">
                    ${g.categoria}
                </span>
            </td>
            <td class="text-right py-4 px-4 font-mono font-bold text-lg" style="color: ${colores.text};">
                ${simboloMoneda}${g.monto.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
            <td class="py-4 px-4 text-gray-600">${g.descripcion || '—'}</td>
            <td class="text-center py-4 px-4">
                <button onclick="eliminarGasto(${g.id})" class="text-red-500 hover:text-red-700 hover:scale-110 transition-all text-xl">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatearFecha(fecha) {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
}

// RESUMEN
function cambiarMes(dir) {
    mesResumen.setMonth(mesResumen.getMonth() + dir);
    actualizarResumen();
}

function actualizarResumen() {
    const mesStr = mesResumen.toISOString().substring(0, 7);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = meses[mesResumen.getMonth()] + ' ' + mesResumen.getFullYear();

    const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mesStr));
    
    const totalUSD = gastosDelMes.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0);
    const totalDOP = gastosDelMes.filter(g => g.moneda === 'DOP').reduce((sum, g) => sum + g.monto, 0);

    document.getElementById('resumenUSD').textContent = '$' + totalUSD.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('resumenDOP').textContent = 'RD$' + totalDOP.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // Resumen por categoría
    const categorias = {};
    gastosDelMes.forEach(g => {
        if (!categorias[g.categoria]) {
            categorias[g.categoria] = { USD: 0, DOP: 0, cantidad: 0 };
        }
        categorias[g.categoria][g.moneda] += g.monto;
        categorias[g.categoria].cantidad++;
    });

    const resumenDiv = document.getElementById('resumenCategorias');
    
    if (Object.keys(categorias).length === 0) {
        resumenDiv.innerHTML = '<p class="text-gray-400 text-center py-12 text-lg font-medium">No hay gastos este mes</p>';
        return;
    }

    let html = '';
    Object.entries(categorias).sort((a, b) => {
        const totalA = a[1].USD + (a[1].DOP / 60);
        const totalB = b[1].USD + (b[1].DOP / 60);
        return totalB - totalA;
    }).forEach(([cat, datos]) => {
        const colores = coloresCategorias[cat] || { bg: '#94a3b8', text: '#334155' };
        html += `
            <div class="category-summary" style="border-color: ${colores.bg};">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <span class="category-badge" style="background-color: ${colores.bg}; color: ${colores.text};">
                            ${cat}
                        </span>
                        <span class="text-gray-500 text-sm font-medium">${datos.cantidad} transacción${datos.cantidad > 1 ? 'es' : ''}</span>
                    </div>
                    <div class="text-right">
                        ${datos.USD > 0 ? `<div class="font-bold text-lg text-gray-800">$${datos.USD.toLocaleString('es-DO', {minimumFractionDigits: 2})}</div>` : ''}
                        ${datos.DOP > 0 ? `<div class="font-bold text-lg text-gray-700">RD$${datos.DOP.toLocaleString('es-DO', {minimumFractionDigits: 2})}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    resumenDiv.innerHTML = html;
}

// GRÁFICAS
function actualizarGraficas() {
    const mesActual = new Date().toISOString().substring(0, 7);
    const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mesActual));

    // Gráfica por categorías
    const categorias = {};
    gastosDelMes.forEach(g => {
        if (!categorias[g.categoria]) categorias[g.categoria] = 0;
        const montoUSD = g.moneda === 'USD' ? g.monto : g.monto / 60;
        categorias[g.categoria] += montoUSD;
    });

    const ctxCat = document.getElementById('graficoCategorias');
    if (window.chartCategorias) window.chartCategorias.destroy();
    window.chartCategorias = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categorias),
            datasets: [{
                data: Object.values(categorias),
                backgroundColor: Object.keys(categorias).map(cat => coloresCategorias[cat]?.bg || '#94a3b8'),
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: '#374151', 
                        font: { weight: '600', size: 12, family: 'Inter' },
                        padding: 15,
                        usePointStyle: true
                    } 
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return ` $${context.parsed.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Gráfica USD vs DOP
    const totalUSD = gastosDelMes.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0);
    const totalDOP = gastosDelMes.filter(g => g.moneda === 'DOP').reduce((sum, g) => sum + g.monto, 0);

    const ctxMonedas = document.getElementById('graficoMonedas');
    if (window.chartMonedas) window.chartMonedas.destroy();
    window.chartMonedas = new Chart(ctxMonedas, {
        type: 'bar',
        data: {
            labels: ['USD', 'DOP'],
            datasets: [{
                label: 'Total gastado',
                data: [totalUSD, totalDOP],
                backgroundColor: ['#059669', '#10b981'],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#374151',
                        font: { weight: '600', size: 12 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: { 
                        color: '#374151', 
                        font: { weight: '700', size: 14 }
                    },
                    grid: { display: false }
                }
            }
        }
    });

    // Evolución mensual
    const meses = {};
    gastos.forEach(g => {
        const mes = g.fecha.substring(0, 7);
        if (!meses[mes]) meses[mes] = 0;
        meses[mes] += g.moneda === 'USD' ? g.monto : g.monto / 60;
    });

    const mesesOrdenados = Object.keys(meses).sort().slice(-6); // Últimos 6 meses
    const totalesPorMes = mesesOrdenados.map(m => meses[m]);

    const ctxEvol = document.getElementById('graficoEvolucion');
    if (window.chartEvolucion) window.chartEvolucion.destroy();
    window.chartEvolucion = new Chart(ctxEvol, {
        type: 'line',
        data: {
            labels: mesesOrdenados.map(m => {
                const [year, month] = m.split('-');
                const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return nombresMeses[parseInt(month) - 1] + ' ' + year.slice(2);
            }),
            datasets: [{
                label: 'Total (USD aprox.)',
                data: totalesPorMes,
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#059669',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    labels: { 
                        color: '#374151', 
                        font: { weight: '600', size: 13, family: 'Inter' },
                        padding: 15
                    } 
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return ` $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#374151',
                        font: { weight: '600', size: 12 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: { 
                        color: '#374151',
                        font: { weight: '600', size: 12 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.03)' }
                }
            }
        }
    });
}
