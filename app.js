const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvas.width, canvas.height);


let controlPoints = [];

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if there are any points already, and if the new x value is greater than the last point's x
    if (controlPoints.length === 0 || x > controlPoints[controlPoints.length - 1].x) {
        controlPoints.push({ x, y });
        drawPoints();
    } else {
        alert("You must place the new point to the right of the last point.");
    }
});


function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0000ff';
    controlPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });

    if (controlPoints.length > 1) {
        drawSpline();
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
