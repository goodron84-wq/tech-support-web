// =================================================================
// Логика перенесена из GlossActivity.java
// =================================================================

function calculateGloss() {
    // В Android: entryOne, entryTwo, entryTarget
    const sOne = document.getElementById('gloss-entry-one').value.trim();
    const sTwo = document.getElementById('gloss-entry-two').value.trim();
    const sTarget = document.getElementById('gloss-entry-target').value.trim();

    const resultBox = document.getElementById('gloss-result-box');
    const resultText = document.getElementById('gloss-result-text');
    const chartCard = document.getElementById('gloss-chart-card');

    if (!resultBox || !resultText) return;

    // Сброс ошибки (в Java: установка цвета #ADFF2F)
    resultBox.classList.remove('error-box');

    // Проверка if (sOne.isEmpty() ...)
    if (!sOne || !sTwo || !sTarget) {
        showGlossError("Заполните все поля!");
        return;
    }

    const A = parseFloat(sOne);
    const B = parseFloat(sTwo);
    const T = parseFloat(sTarget);

    if (isNaN(A) || isNaN(B) || isNaN(T)) {
        showGlossError("Введите корректные числа!");
        return;
    }

    // Проверка диапазона блеска от 5 до 90
    if (A < 5 || B < 5 || T < 5 || A > 90 || B > 90 || T > 90) {
        showGlossError("Ошибка: Блеск должен быть в диапазоне от 5 до 90!");
        return;
    }

    if (A === B) {
        showGlossError("Значения блеска лаков не должны быть равны!");
        return;
    }

    // Формула x = (T - B) / (A - B)
    const x = (T - B) / (A - B);
    const y = 1 - x;

    if (x < 0 || x > 1 || y < 0 || y > 1) {
        showGlossError("Целевой блеск должен быть строго\nмежду значениями выбранных лаков!");
        return;
    }

    // Округление Math.round(x * 1000.0) / 10.0
    const pctOne = Math.round(x * 1000.0) / 10.0;
    const pctTwo = Math.round(y * 1000.0) / 10.0;

    const resTextOne = (pctOne % 1 === 0) ? pctOne.toFixed(0) : pctOne.toString();
    const resTextTwo = (pctTwo % 1 === 0) ? pctTwo.toFixed(0) : pctTwo.toString();

    // Вывод в tvResult
    resultText.innerHTML = `Лак 1: ${resTextOne}%<br>Лак 2: ${resTextTwo}%`;

    // chartCard.setVisibility(View.VISIBLE)
    if (chartCard) {
        chartCard.style.display = 'block';
        drawNativeChartWeb(A, B, T, pctTwo); // Вызов отрисовки графики
    }
}

// Метод showError(String message) из Java
function showGlossError(message) {
    const resultBox = document.getElementById('gloss-result-box');
    const resultText = document.getElementById('gloss-result-text');
    const chartCard = document.getElementById('gloss-chart-card');

    if (resultBox && resultText) {
        resultBox.classList.add('error-box'); // Меняет фон на красный #FEE2E2
        resultText.innerHTML = message.replace('\n', '<br>');
    }
    if (chartCard) {
        chartCard.style.display = 'none'; // chartCard.setVisibility(View.GONE)
    }
}

// Метод drawNativeChart(...) из Java перенесен на HTML5 Canvas
function drawNativeChartWeb(A, B, T, targetX) {
    const canvas = document.getElementById('glossCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Отступы аналогично Paint-разметке Java
    const paddingLeft = 50;
    const paddingRight = 55;
    const paddingTop = 30;
    const paddingBottom = 40;

    const graphW = w - paddingLeft - paddingRight;
    const graphH = h - paddingTop - paddingBottom;

    const minVal = Math.min(A, B);
    const maxVal = Math.max(A, B);
    const margin = (maxVal !== minVal) ? (maxVal - minVal) * 0.15 : 5;

    const minY = (minVal - margin >= 0) ? (minVal - margin) : 0;
    const maxY = maxVal + margin;
    const rangeY = maxY - minY;

    const startXPix = paddingLeft;
    const endXPix = paddingLeft + graphW;
    const targetXPix = paddingLeft + (graphW * (targetX / 100));

    const valAPix = paddingTop + graphH * (1 - ((A - minY) / rangeY));
    const valBPix = paddingTop + graphH * (1 - ((B - minY) / rangeY));
    const valTPix = paddingTop + graphH * (1 - ((T - minY) / rangeY));

    // Рисуем Оси (цвет #64748B)
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, h - paddingBottom);
    ctx.lineTo(w - paddingRight, h - paddingBottom);
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, h - paddingBottom);
    ctx.moveTo(w - paddingRight, paddingTop);
    ctx.lineTo(w - paddingRight, h - paddingBottom);
    ctx.stroke();

    // Подписи шкал (0% и 100%)
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("0%", paddingLeft - 15, h - paddingBottom + 20);
    ctx.fillText("100%", w - paddingRight + 15, h - paddingBottom + 20);

    // Значения блеска лаков по бокам осей (цвет #0F172A)
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(A), paddingLeft - 10, valAPix + 5);
    ctx.textAlign = 'left';
    ctx.fillText(Math.round(B), w - paddingRight + 10, valBPix + 5);

    // Линия целевого блеска (Синяя: #2196F3)
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startXPix, valTPix);
    ctx.lineTo(endXPix, valTPix);
    ctx.stroke();

    // Линия соотношения лаков (Красная: #EF4444)
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startXPix, valAPix);
    ctx.lineTo(endXPix, valBPix);
    ctx.stroke();

    // Вертикальная линия к точке (Зеленая: #22C55E)
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetXPix, h - paddingBottom);
    ctx.lineTo(targetXPix, valTPix);
    ctx.stroke();

    // Зеленая точка пересечения
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(targetXPix, valTPix, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Текст процентов над точкой (цвет #15803D)
    ctx.fillStyle = '#15803D';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(targetX + "%", targetXPix, valTPix - 10);
}
