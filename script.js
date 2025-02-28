const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

// 移除pointer事件，只使用mouse和touch事件
canvas.removeEventListener('pointerdown', startDrawing);
canvas.removeEventListener('pointermove', draw);
canvas.removeEventListener('pointerup', stopDrawing);

// 优化鼠标事件处理
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    startDrawing(offsetX, offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    draw(offsetX, offsetY);
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    stopDrawing();
});

// 优化触摸事件处理
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e.touches[0]);
    startDrawing(offsetX, offsetY);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e.touches[0]);
    draw(offsetX, offsetY);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
});

const brushSize = document.getElementById('brushSize');
const eraserSize = document.getElementById('eraserSize');
const brushColor = document.getElementById('brushColor');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');
let isErasing = false;

// 初始化工具设置
let currentColor = brushColor.value;
let currentToolSize = brushSize.value;

// 清空画板功能
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 橡皮擦/画笔切换功能
eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing; // 切换状态
    if (isErasing) {
        currentColor = '#ffffff'; // 白色作为橡皮擦颜色
        currentToolSize = eraserSize.value;
        eraserBtn.textContent = '画笔';
        eraserBtn.style.backgroundColor = '#6b4f4f'; // 切换按钮颜色
    } else {
        currentColor = brushColor.value;
        currentToolSize = brushSize.value;
        eraserBtn.textContent = '橡皮擦';
        eraserBtn.style.backgroundColor = '#ff8c94'; // 恢复按钮颜色
    }
});

// 画笔颜色变化监听
brushColor.addEventListener('input', () => {
    if (!isErasing) {
        currentColor = brushColor.value;
    }
});

// 画笔大小变化监听
brushSize.addEventListener('input', () => {
    if (!isErasing) {
        currentToolSize = brushSize.value;
    }
});

// 橡皮擦大小变化监听
eraserSize.addEventListener('input', () => {
    if (isErasing) {
        currentToolSize = eraserSize.value;
    }
});

function startDrawing(x, y) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(x, y) {
    if (!isDrawing) return;
    
    ctx.lineWidth = currentToolSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // 考虑CSS缩放
    const scaleY = canvas.height / rect.height; // 考虑CSS缩放
    
    return {
        offsetX: (e.clientX - rect.left) * scaleX,
        offsetY: (e.clientY - rect.top) * scaleY
    };
}

document.getElementById('generateBtn').addEventListener('click', async () => {
    const imageData = canvas.toDataURL('image/png'); // 获取画布图像
    try {
        const response = await fetch('https://your-app-name.fly.dev/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData.split(',')[1], // 去掉Base64前缀
                prompt: '将这幅画转换为梵高风格', // 提示词
                strength: 0.6, // 控制生成图像的强度（0-1）
            }),
        });

        const result = await response.json();
        const img = document.createElement('img');
        img.src = result.image_url; // 返回的图像URL
        document.getElementById('resultContainer').innerHTML = '';
        document.getElementById('resultContainer').appendChild(img);
    } catch (error) {
        console.error('Error:', error);
        alert('生成失败，请检查服务器是否正常运行');
    }
}); 