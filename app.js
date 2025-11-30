// Variables globales
let gastos = [];
let mesResumen = new Date();
let categoriaSeleccionada = '';
let monedaSeleccionada = 'USD';
let unsubscribe = null;

// Categorías con iconos y colores profesionales
const categorias = {
    'Pedrito': { icon: '👶', color: '#FFB4D6' },
    'Casa': { icon: '🏠', color: '#A7C7E7' },
    'Alquiler': { icon: '🏢', color: '#B4A7D6' },
    'Servicios': { icon: '⚡', color: '#FFD700' },
    'Préstamos': { icon: '💳', color: '#FF6B6B' },
    'Restaurantes': { icon: '🍽️', color: '#FF9F43' },
    'Viajes': { icon: '✈️', color: '#48C9B0' },
    'Gasolina': { icon: '⛽', color: '#95A5A6' },
    'Personal': { icon: '👥', color: '#9B59B6' },
    'Internet': { icon: '🛒', color: '#3498DB' },
    'Supermercado': { icon: '🛍️', color: '#2ECC71' },
    'Farmacia': { icon: '💊', color: '#E74C3C' },
    'Ropa': { icon: '👕', color: '#E67E22' },
    'Adicionales': { icon: '➕', color: '#34495E' },
    'Otros': { icon: '📋', color: '#7F8C8D' }
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
            <div style="font-size: 24px;">${datos.icon}</div>
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
                        ${cat.icon}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #1A1A1A; font-size: 15px; margin-bottom: 4px;">
                            ${g.categoria}
                        </div>
                        <div style="color: #8F9BB3; font-size: 13px;">
                            ${g.descripcion || formatearFecha(g.fecha)}
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
                        ${catInfo.icon}
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
