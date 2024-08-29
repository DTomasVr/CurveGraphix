const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvas.width, canvas.height);


let controlPoints = [];


document.getElementById('add-point-btn').addEventListener('click', () => {
    const xInput = document.getElementById('x-value');
    const yInput = document.getElementById('y-value');

    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);

    if (!isNaN(x) && !isNaN(y)) {
        controlPoints.push({ x, y });
        drawPoints();
    } else {
        alert('Please enter valid X and Y values.');
    }
    
    // Clear the input fields
    xInput.value = '';
    yInput.value = '';
});


function drawPoints() {
    const { scaleX, scaleY, offsetX, offsetY } = calculateScaleAndOffsets();

    ctx.setTransform(scaleX, 0, 0, -scaleY, offsetX, canvas.height + offsetY); // Invert Y-axis
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGridLines();
    drawAxisLabels();

    ctx.fillStyle = '#0000ff';
    controlPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });

    if (controlPoints.length > 1) {
        drawSpline();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
}

function drawGridLines() {
    const gridSpacing = 20;
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 0; x <= canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function calculateScaleAndOffsets() {
    const minX = Math.min(...controlPoints.map(p => p.x), 0);
    const maxX = Math.max(...controlPoints.map(p => p.x), canvas.width);
    const minY = Math.min(...controlPoints.map(p => p.y), 0);
    const maxY = Math.max(...controlPoints.map(p => p.y), canvas.height);

    const scaleX = canvas.width / (maxX - minX);
    const scaleY = canvas.height / (maxY - minY);

    const offsetX = -minX * scaleX;
    const offsetY = -minY * scaleY;

    return { scaleX, scaleY, offsetX, offsetY };
}

function drawAxisLabels() {
    const xAxisContainer = document.getElementById('x-axis-labels');
    const yAxisContainer = document.getElementById('y-axis-labels');

    // Clear previous labels
    xAxisContainer.innerHTML = '';
    yAxisContainer.innerHTML = '';

    const gridSpacing = 20;

    // X axis labels
    for (let x = 0; x <= canvas.width; x += gridSpacing) {
        const xLabel = document.createElement('div');
        xLabel.textContent = x;
        xLabel.style.position = 'absolute';
        xLabel.style.left = `${x}px`;
        xLabel.style.transform = 'translateX(-50%)';
        xAxisContainer.appendChild(xLabel);
    }

    // Y axis labels
    for (let y = 0; y <= canvas.height; y += gridSpacing) {
        const yLabel = document.createElement('div');
        yLabel.textContent = (canvas.height - y);
        yLabel.style.position = 'absolute';
        yLabel.style.bottom = `${y}px`;
        yLabel.style.transform = 'translateY(50%)';
        yAxisContainer.appendChild(yLabel);
    }
}

function drawSpline() {
    ctx.strokeStyle = '#99eebb';
    ctx.lineWidth = 2;

    const n = controlPoints.length - 1;

    // Generate coefficients for cubic spline
    let a = [], b = [], c = [], d = [];
    for (let i = 0; i < n; i++) {
        a.push(controlPoints[i].y);
        b.push(0);
        c.push(0);
        d.push(0);
    }

    // Set up the system of equations
    let h = [];
    for (let i = 0; i < n; i++) {
        h.push(controlPoints[i + 1].x - controlPoints[i].x);
    }

    let alpha = [];
    for (let i = 1; i < n; i++) {
        alpha.push((3 / h[i]) * (controlPoints[i + 1].y - controlPoints[i].y) - (3 / h[i - 1]) * (controlPoints[i].y - controlPoints[i - 1].y));
    }

    let l = [1], mu = [0], z = [0];
    for (let i = 1; i < n; i++) {
        l.push(2 * (controlPoints[i + 1].x - controlPoints[i - 1].x) - h[i - 1] * mu[i - 1]);
        mu.push(h[i] / l[i]);
        z.push((alpha[i - 1] - h[i - 1] * z[i - 1]) / l[i]);
    }

    l.push(1);
    z.push(0);
    c[n] = 0;

    for (let j = n - 1; j >= 0; j--) {
        c[j] = z[j] - mu[j] * c[j + 1];
        b[j] = (controlPoints[j + 1].y - controlPoints[j].y) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
        d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    // Draw the spline
    for (let i = 0; i < n; i++) {
        let x0 = controlPoints[i].x;
        let x1 = controlPoints[i + 1].x;
        ctx.beginPath();
        ctx.moveTo(x0, controlPoints[i].y);

        for (let x = x0; x < x1; x++) {
            let t = (x - x0) / h[i];
            let y = a[i] + b[i] * t * h[i] + c[i] * Math.pow(t * h[i], 2) + d[i] * Math.pow(t * h[i], 3);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}


const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', () => {
    controlPoints = [];
    drawPoints();
});
