const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inputN = document.getElementById('input-n');
const generarBtn = document.getElementById('generar-btn');
const reiniciarBtn = document.getElementById('reiniciar-btn');
const outputBox = document.getElementById('output-box');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Flip the y-axis and move the origin to the bottom-left corner
ctx.translate(0, canvas.height);
ctx.scale(1, -1);

// Fill the initial background
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let puntosControl = [];
let n = 0;
let clickCount = 0;

// Event listener for generating points
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
});

// Event listener for placing control points
canvas.addEventListener('click', (event) => {
    if (clickCount < n) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = canvas.height - (event.clientY - rect.top); // Adjust y for flipped coordinates

        if (puntosControl.length === 0 || x > puntosControl[puntosControl.length - 1].x) {
            puntosControl.push({ x, y });
            clickCount++;
            dibujarPuntos();
            mostrarPuntos();

            if (clickCount === n) {
                generarBtn.disabled = true;
            }
        } else {
            alert("Debe colocar el nuevo punto a la derecha del último punto.");
        }
    }
});

// Function to draw the control points
function dibujarPuntos() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0000ff';
    puntosControl.forEach(punto => {
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });

    if (puntosControl.length > 1) {
        dibujarSpline();
    }
}

// Function to draw the cubic spline
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
        ctx.moveTo(x0, puntosControl[i].y);

        for (let x = x0; x < x1; x++) {
            let t = (x - x0) / h[i];
            let y = a[i] + b[i] * t * h[i] + c[i] * Math.pow(t * h[i], 2) + d[i] * Math.pow(t * h[i], 3);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

// Function to display control points in the output box
function mostrarPuntos() {
    outputBox.innerHTML = '';
    puntosControl.forEach(punto => {
        const p = document.createElement('p');
        p.textContent = `(${punto.x.toFixed(2)}, ${punto.y.toFixed(2)})`;
        outputBox.appendChild(p);
    });
}

// Event listener for resetting the canvas
reiniciarBtn.addEventListener('click', () => {
    puntosControl = [];
    clickCount = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    outputBox.innerHTML = '';
    generarBtn.disabled = false;
});
