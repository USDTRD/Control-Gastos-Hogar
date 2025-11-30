// Variables globales
let gastos = [];
let mesResumen = new Date();
let categoriaSeleccionada = '';
let monedaSeleccionada = 'USD';
let unsubscribe = null;

// Categorías con iconos SVG profesionales y colores
const categorias = {
    'Pedrito': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C10.34 2 9 3.34 9 5s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-1.5 20v-6h-3l2.59-7.59C10.34 7.59 11.09 7 12 7c.9 0 1.66.59 1.91 1.41L16.5 16h-3v6h-3z"/></svg>',
        color: '#FFB4D6' 
    },
    'Casa': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
        color: '#A7C7E7' 
    },
    'Alquiler': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>',
        color: '#B4A7D6' 
    },
    'Servicios': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>',
        color: '#FFD700' 
    },
    'Préstamos': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>',
        color: '#FF6B6B' 
    },
    'Restaurantes': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>',
        color: '#FF9F43' 
    },
    'Viajes': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
        color: '#48C9B0' 
    },
    'Gasolina': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>',
        color: '#95A5A6' 
    },
    'Personal': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
        color: '#9B59B6' 
    },
    'Internet': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>',
        color: '#3498DB' 
    },
    'Supermercado': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45zM6.16 6h12.15l-2.76 5H8.53L6.16 6zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>',
        color: '#2ECC71' 
    },
    'Farmacia': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5h-2.64l1.14-3.14L17.15 1l-1.46 4H3v2l2 6-2 6v2h18v-2l-2-6 2-6V5zm-5 9h-3v3h-2v-3H8v-2h3V9h2v3h3v2z"/></svg>',
        color: '#E74C3C' 
    },
    'Ropa': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4l1.29 1.29-2.88 2.88-1.29-1.29c-.39-.39-1.02-.39-1.41 0l-6 6c-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0l6-6c.39-.39.39-1.02 0-1.41L13.24 7l2.88-2.88L18 5.71V4h-2zm.41 7.41c.39.39.39 1.02 0 1.41l-6 6c-.39.39-1.02.39-1.41 0l-1.41-1.41c-.39-.39-.39-1.02 0-1.41l6-6c.39-.39 1.02-.39 1.41 0l1.41 1.41z"/></svg>',
        color: '#E67E22' 
    },
    'Adicionales': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
        color: '#34495E' 
    },
    'Otros': { 
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
        color: '#7F8C8D' 
    }
};

// Esperar a que Firebase esté listo
function esperarFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.firebaseReady && window.db) {
                clearInterval(checkFirebase);
                resolve();
            }
        }, 100);
    });
}

window.onload = async function() {
    document.getElementById('fechaInput').value = new Date().toISOString().split('T')[0];
    cargarCategorias();
    
    // Esperar Firebase y luego cargar datos
    await esperarFirebase();
    inicializarFirestore();
};

// Inicializar escucha en tiempo real de Firestore
function inicializarFirestore() {
    const q = window.query(window.collection(window.db, 'gastos'), window.orderBy('fecha', 'desc'));
    
    unsubscribe = window.onSnapshot(q, (snapshot) => {
        gastos = [];
        snapshot.forEach((doc) => {
            gastos.push({
                firestoreId: doc.id,
                ...doc.data()
            });
        });
        
        actualizar();
        mostrarSincronizado();
    }, (error) => {
        console.error('Error al escuchar cambios:', error);
        mostrarError();
    });
}

function mostrarSincronizado() {
    const indicator = document.getElementById('syncIndicator');
    indicator.textContent = '✓ Sincronizado';
    indicator.style.background = '#E8FAF6';
    indicator.style.color = '#1CC29F';
}

function mostrarSincronizando() {
    const indicator = document.getElementById('syncIndicator');
    indicator.textContent = '🔄 Guardando...';
    indicator.style.background = '#FFF3E0';
    indicator.style.color = '#F57C00';
}

function mostrarError() {
    const indicator = document.getElementById('syncIndicator');
    indicator.textContent = '⚠️ Sin conexión';
    indicator.style.background = '#FFEBEE';
    indicator.style.color = '#C62828';
}

function cargarCategorias() {
    const grid = document.getElementById('categoriaGrid');
    grid.innerHTML = '';
    
    Object.entries(categorias).forEach(([nombre, datos]) => {
        const div = document.createElement('div');
        div.className = 'category-option';
        div.onclick = () => seleccionarCategoria(nombre);
        div.id = 'cat-' + nombre;
        div.innerHTML = `
            <div style="width: 28px; height: 28px; color: ${datos.color};">${datos.icon}</div>
            <div style="font-size: 10px; font-weight: 600; color: #8F9BB3; text-align: center;">${nombre}</div>
        `;
        grid.appendChild(div);
    });
}

function seleccionarCategoria(nombre) {
    categoriaSeleccionada = nombre;
    document.querySelectorAll('.category-option').forEach(el => {
        if (el.id && el.id.startsWith('cat-')) {
            el.classList.remove('selected');
        }
    });
    document.getElementById('cat-' + nombre).classList.add('selected');
}

function seleccionarMoneda(moneda) {
    monedaSeleccionada = moneda;
    document.getElementById('btnUSD').classList.remove('selected');
    document.getElementById('btnDOP').classList.remove('selected');
    document.getElementById('btn' + moneda).classList.add('selected');
}

function abrirModal() {
    document.getElementById('modalAgregar').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    document.getElementById('modalAgregar').classList.remove('active');
    document.body.style.overflow = '';
    limpiarFormulario();
}

function limpiarFormulario() {
    categoriaSeleccionada = '';
    document.querySelectorAll('.category-option').forEach(el => {
        if (el.id && el.id.startsWith('cat-')) {
            el.classList.remove('selected');
        }
    });
    document.getElementById('montoInput').value = '';
    document.getElementById('descripcionInput').value = '';
}

async function guardarGasto() {
    const monto = parseFloat(document.getElementById('montoInput').value);
    const descripcion = document.getElementById('descripcionInput').value.trim();
    const fecha = document.getElementById('fechaInput').value;

    if (!categoriaSeleccionada) {
        alert('Selecciona una categoría');
        return;
    }

    if (!monto || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
    }

    mostrarSincronizando();

    try {
        await window.addDoc(window.collection(window.db, 'gastos'), {
            categoria: categoriaSeleccionada,
            monto: monto,
            moneda: monedaSeleccionada,
            descripcion: descripcion,
            fecha: fecha,
            timestamp: new Date().toISOString()
        });
        
        cerrarModal();
        cambiarSeccion('gastos');
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar. Verifica tu conexión.');
        mostrarError();
    }
}

async function eliminarGasto(firestoreId) {
    if (confirm('¿Eliminar este gasto?')) {
        mostrarSincronizando();
        try {
            await window.deleteDoc(window.doc(window.db, 'gastos', firestoreId));
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar. Verifica tu conexión.');
            mostrarError();
        }
    }
}

function cambiarSeccion(seccion) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById('seccion' + seccion.charAt(0).toUpperCase() + seccion.slice(1)).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');
    
    if (seccion === 'resumen') actualizarResumen();
    if (seccion === 'analisis') actualizarGraficas();
}

function actualizar() {
    const mesActual = new Date().toISOString().substring(0, 7);
    const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mesActual));

    const totalUSD = gastosDelMes.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0);
    const totalDOP = gastosDelMes.filter(g => g.moneda === 'DOP').reduce((sum, g) => sum + g.monto, 0);
    const totalMes = totalUSD + (totalDOP / 60);

    document.getElementById('totalMesDisplay').textContent = '$' + totalMes.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalUSDDisplay').textContent = '$' + totalUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalDOPDisplay').textContent = 'RD$' + totalDOP.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalGastosDisplay').textContent = gastosDelMes.length;

    const listaDiv = document.getElementById('listaGastosRecientes');
    
    if (gastosDelMes.length === 0) {
        listaDiv.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #8F9BB3;">No hay gastos este mes</div>';
        return;
    }

    // MOSTRAR TODOS LOS GASTOS (no solo 10)
    listaDiv.innerHTML = gastosDelMes
        .map(g => {
            const cat = categorias[g.categoria];
            if (!cat) return ''; // Si no existe la categoría, saltar
            
            return `
                <div class="category-item" onclick="eliminarGasto('${g.firestoreId}')">
                    <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color};">
                        <div style="width: 24px; height: 24px;">${cat.icon}</div>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #1A1A1A; font-size: 15px; margin-bottom: 4px;">
                            ${g.categoria}
                        </div>
                        <div style="color: #8F9BB3; font-size: 13px;">
                            ${g.descripcion ? g.descripcion + ' • ' + formatearFecha(g.fecha) : formatearFecha(g.fecha)}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: #1A1A1A; font-size: 16px;">
                            ${g.moneda === 'USD' ? '$' : 'RD$'}${g.monto.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                    </div>
                </div>
            `;
        })
        .filter(html => html !== '')
        .join('');
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
    document.getElementById('mesActualText').textContent = meses[mesResumen.getMonth()] + ' ' + mesResumen.getFullYear();

    const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mesStr));
    
    const totalUSD = gastosDelMes.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0);
    const totalDOP = gastosDelMes.filter(g => g.moneda === 'DOP').reduce((sum, g) => sum + g.monto, 0);

    document.getElementById('resumenUSD').textContent = '$' + totalUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('resumenDOP').textContent = 'RD$' + totalDOP.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    const porCategoria = {};
    gastosDelMes.forEach(g => {
        if (!porCategoria[g.categoria]) {
            porCategoria[g.categoria] = { USD: 0, DOP: 0, cantidad: 0 };
        }
        porCategoria[g.categoria][g.moneda] += g.monto;
        porCategoria[g.categoria].cantidad++;
    });

    const resumenDiv = document.getElementById('resumenCategorias');
    
    if (Object.keys(porCategoria).length === 0) {
        resumenDiv.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #8F9BB3;">No hay gastos este mes</div>';
        return;
    }

    resumenDiv.innerHTML = Object.entries(porCategoria)
        .sort((a, b) => {
            const totalA = a[1].USD + (a[1].DOP / 60);
            const totalB = b[1].USD + (b[1].DOP / 60);
            return totalB - totalA;
        })
        .map(([cat, datos]) => {
            const catInfo = categorias[cat];
            if (!catInfo) return ''; // Si no existe la categoría, saltar
            
            return `
                <div class="category-item">
                    <div class="category-icon" style="background: ${catInfo.color}20; color: ${catInfo.color};">
                        <div style="width: 24px; height: 24px;">${catInfo.icon}</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1A1A1A; font-size: 15px; margin-bottom: 4px;">
                            ${cat}
                        </div>
                        <div style="color: #8F9BB3; font-size: 13px;">
                            ${datos.cantidad} transacción${datos.cantidad > 1 ? 'es' : ''}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        ${datos.USD > 0 ? `<div style="font-weight: 700; font-size: 16px;">$${datos.USD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>` : ''}
                        ${datos.DOP > 0 ? `<div style="font-weight: 700; font-size: 16px;">RD$${datos.DOP.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>` : ''}
                    </div>
                </div>
            `;
        })
        .filter(html => html !== '')
        .join('');
}

// GRÁFICAS - ARREGLADAS Y MEJORADAS
function actualizarGraficas() {
    const mesActual = new Date().toISOString().substring(0, 7);
    const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mesActual));

    // Gráfico por categoría
    const porCategoria = {};
    gastosDelMes.forEach(g => {
        if (!porCategoria[g.categoria]) porCategoria[g.categoria] = 0;
        porCategoria[g.categoria] += g.moneda === 'USD' ? g.monto : g.monto / 60;
    });

    const categoriasConDatos = Object.keys(porCategoria).filter(cat => categorias[cat]);
    
    const ctxCat = document.getElementById('graficoCategorias');
    if (window.chartCat) window.chartCat.destroy();
    
    if (categoriasConDatos.length === 0) {
        ctxCat.parentElement.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #8F9BB3;">No hay datos para este mes</div><canvas id="graficoCategorias"></canvas>';
    } else {
        window.chartCat = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: categoriasConDatos,
                datasets: [{
                    data: categoriasConDatos.map(cat => porCategoria[cat]),
                    backgroundColor: categoriasConDatos.map(cat => categorias[cat].color),
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { 
                            font: { size: 12, weight: '600' },
                            padding: 12,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico USD vs DOP
    const totalUSD = gastosDelMes.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0);
    const totalDOP = gastosDelMes.filter(g => g.moneda === 'DOP').reduce((sum, g) => sum + g.monto, 0);

    const ctxMon = document.getElementById('graficoMonedas');
    if (window.chartMon) window.chartMon.destroy();
    
    window.chartMon = new Chart(ctxMon, {
        type: 'bar',
        data: {
            labels: ['USD', 'DOP'],
            datasets: [{
                label: 'Monto',
                data: [totalUSD, totalDOP],
                backgroundColor: ['#1CC29F', '#05BE9E'],
                borderRadius: 10,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ${label === 'USD' ? '$' : 'RD$'}${value.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('en-US');
                        }
                    }
                }
            }
        }
    });

    // Gráfico evolución mensual - últimos 6 meses
    const meses = {};
    gastos.forEach(g => {
        const mes = g.fecha.substring(0, 7);
        if (!meses[mes]) meses[mes] = 0;
        meses[mes] += g.moneda === 'USD' ? g.monto : g.monto / 60;
    });

    const mesesOrdenados = Object.keys(meses).sort().slice(-6);
    const nombresMeses = mesesOrdenados.map(m => {
        const [year, month] = m.split('-');
        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return mesesNombres[parseInt(month) - 1];
    });

    const ctxEvol = document.getElementById('graficoEvolucion');
    if (window.chartEvol) window.chartEvol.destroy();
    
    window.chartEvol = new Chart(ctxEvol, {
        type: 'line',
        data: {
            labels: nombresMeses,
            datasets: [{
                label: 'Total (USD)',
                data: mesesOrdenados.map(m => meses[m]),
                borderColor: '#1CC29F',
                backgroundColor: 'rgba(28, 194, 159, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#1CC29F',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            return `Total: $${value.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('en-US');
                        }
                    }
                }
            }
        }
    });
}
