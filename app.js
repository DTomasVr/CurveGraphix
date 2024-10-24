const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inputN = document.getElementById('input-n');
const generarBtn = document.getElementById('generar-btn');
const reiniciarBtn = document.getElementById('reiniciar-btn');
const outputBox = document.getElementById('output-box');
const outputFunctionsBox = document.getElementById('output-functions');

canvas.width = 800;
canvas.height = 600;

function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    const gridSize = 20;
    for (let x = gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    drawAxes();
}

function drawAxes() {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;


    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20); 
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();

   
    ctx.beginPath();
    ctx.moveTo(20, 0); 
    ctx.lineTo(20, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';

    // Label the X-axis
    for (let x = 50; x <= canvas.width; x += 50) {
        ctx.fillText(x, x, canvas.height - 5); 
    }

    // Label the Y-axis
    for (let y = 50; y <= canvas.height; y += 50) {
        ctx.fillText(canvas.height - y, 5, y + 5); 
    }
}

ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawGrid();

let puntosControl = [];
let n = 0;
let clickCount = 0;

generarBtn.addEventListener('click', () => {
    n = parseInt(inputN.value);
    if (n < 8 || n > 12 || isNaN(n)) {
        alert("Por favor, ingrese un número válido entre 8 y 12.");
        return;
    }
    clickCount = 0;
    puntosControl = [];
    dibujarPuntos();
    outputBox.innerHTML = '';
    if (clickCount === n) {
        generarBtn.disabled = true;
        canvas.style.cursor = 'default'; 
        mostrarFuncionesSpline();
    }
});

canvas.addEventListener('click', (event) => {
    if (clickCount < n) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (puntosControl.length === 0 || x > puntosControl[puntosControl.length - 1].x) {
            puntosControl.push({ x, y: canvas.height - y }); 
            clickCount++;
            dibujarPuntos();
            mostrarPuntos();

            if (clickCount === n) {
                generarBtn.disabled = true;
                canvas.style.cursor = 'default'; 
                mostrarFuncionesSpline();
            }
        } else {
            alert("Debe colocar el nuevo punto a la derecha del último punto.");
        }
    }
});

canvas.addEventListener('mousemove', () => {
    if (clickCount < n) {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'default';
    }
});

function dibujarPuntos() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    ctx.fillStyle = '#0000ff';
    puntosControl.forEach((punto, index) => {
        ctx.beginPath();
        ctx.arc(punto.x, canvas.height - punto.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Arial';
        ctx.fillText(index + 1, punto.x + 7, canvas.height - punto.y - 7);
        ctx.fillStyle = '#0000ff';
    });

    if (puntosControl.length > 1) {
        dibujarSpline();
    }
}

function dibujarSpline() {
    ctx.strokeStyle = '#99eebb';
    ctx.lineWidth = 2;

    const n = puntosControl.length - 1;

    let a = [], b = [], c = [], d = [];
    for (let i = 0; i < n; i++) {
        a.push(puntosControl[i].y);
        b.push(0);
        c.push(0);
        d.push(0);
    }

    let h = [];
    for (let i = 0; i < n; i++) {
        h.push(puntosControl[i + 1].x - puntosControl[i].x);
    }

    let alpha = [];
    for (let i = 1; i < n; i++) {
        alpha.push((3 / h[i]) * (puntosControl[i + 1].y - puntosControl[i].y) - (3 / h[i - 1]) * (puntosControl[i].y - puntosControl[i - 1].y));
    }

    let l = [1], mu = [0], z = [0];
    for (let i = 1; i < n; i++) {
        l.push(2 * (puntosControl[i + 1].x - puntosControl[i - 1].x) - h[i - 1] * mu[i - 1]);
        mu.push(h[i] / l[i]);
        z.push((alpha[i - 1] - h[i - 1] * z[i - 1]) / l[i]);
    }

    l.push(1);
    z.push(0);
    c[n] = 0;

    for (let j = n - 1; j >= 0; j--) {
        c[j] = z[j] - mu[j] * c[j + 1];
        b[j] = (puntosControl[j + 1].y - puntosControl[j].y) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
        d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    for (let i = 0; i < n; i++) {
        let x0 = puntosControl[i].x;
        let x1 = puntosControl[i + 1].x;
        ctx.beginPath();
        ctx.moveTo(x0, canvas.height - puntosControl[i].y);

        for (let x = x0; x < x1; x++) {
            let t = (x - x0) / h[i];
            let y = a[i] + b[i] * t * h[i] + c[i] * Math.pow(t * h[i], 2) + d[i] * Math.pow(t * h[i], 3);
            ctx.lineTo(x, canvas.height - y);
        }
        ctx.stroke();
    }
}

function mostrarPuntos() {
    outputBox.innerHTML = '';
    puntosControl.forEach(punto => {
        const p = document.createElement('p');
        p.textContent = `(${punto.x.toFixed(2)}, ${punto.y.toFixed(2)})`;
        outputBox.appendChild(p);
    });
}
function mostrarFuncionesSpline() {
    console.log("Llamando a mostrarFuncionesSpline");
    console.log("Puntos de control:", puntosControl);
    
    outputFunctionsBox.innerHTML = '';

    const n = puntosControl.length - 1;
    let a = [], b = [], c = [], d = [];

    for (let i = 0; i < n; i++) {
        a.push(puntosControl[i].y);
        b.push(0);
        c.push(0);
        d.push(0);
    }

    let h = [];
    for (let i = 0; i < n; i++) {
        h.push(puntosControl[i + 1].x - puntosControl[i].x);
    }

    let alpha = [];
    for (let i = 1; i < n; i++) {
        alpha.push((3 / h[i]) * (puntosControl[i + 1].y - puntosControl[i].y) - (3 / h[i - 1]) * (puntosControl[i].y - puntosControl[i - 1].y));
    }

    let l = [1], mu = [0], z = [0];
    for (let i = 1; i < n; i++) {
        l.push(2 * (puntosControl[i + 1].x - puntosControl[i - 1].x) - h[i - 1] * mu[i - 1]);
        mu.push(h[i] / l[i]);
        z.push((alpha[i - 1] - h[i - 1] * z[i - 1]) / l[i]);
    }

    l.push(1);
    z.push(0);
    c[n] = 0;

    for (let j = n - 1; j >= 0; j--) {
        c[j] = z[j] - mu[j] * c[j + 1];
        b[j] = (puntosControl[j + 1].y - puntosControl[j].y) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
        d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    for (let i = 0; i < n; i++) {
        const x0 = puntosControl[i].x;
        const x1 = puntosControl[i + 1].x;

        const p = document.createElement('p');
        p.textContent = `Spline ${i + 1}: S${i}(x) = ${a[i].toFixed(2)} + (${b[i].toFixed(2)})(x - ${x0.toFixed(2)}) + (${c[i].toFixed(2)})(x - ${x0.toFixed(2)})^2 + (${d[i].toFixed(2)})(x - ${x0.toFixed(2)})^3, para x entre ${x0.toFixed(2)} y ${x1.toFixed(2)}`;
        outputFunctionsBox.appendChild(p);
    }
}
reiniciarBtn.addEventListener('click', () => {
    puntosControl = [];
    clickCount = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    outputBox.innerHTML = '';
    generarBtn.disabled = false;
});