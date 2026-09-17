// =================================================================
// Логика перенесена из ThicknessCalcActivity.java
// =================================================================

// Автоподстановка сухого остатка (вызывается при открытии этого экрана)
function initThicknessScreen() {
    // Проверяем, есть ли рассчитанный сухой остаток на второй вкладке
    // В JS берем сохраненное значение или глобальную переменную
    const etSolid = document.getElementById('etThicknessSolidContent');
    if (etSolid && window.lastCalculatedSolidContent > 0) {
        etSolid.value = window.lastCalculatedSolidContent.toFixed(2);
    }
}

function performThicknessCalculations() {
    const solidStr = document.getElementById('etThicknessSolidContent').value.trim();
    const wetStr = document.getElementById('etWetLayer').value.trim();
    const requiredDryStr = document.getElementById('etRequiredThickness').value.trim();

    const tvDryThickness = document.getElementById('tvCalculatedDryThickness');
    const tvConsumption = document.getElementById('tvCalculatedConsumption');

    if (!solidStr) {
        alert("Введите сухой остаток готовой смеси!");
        return;
    }

    const solidPercent = parseFloat(solidStr.replace(",", "."));
    if (isNaN(solidPercent) || solidPercent <= 0 || solidPercent > 100) {
        alert("Сухой остаток должен быть от 0.1 до 100%");
        return;
    }

    // Умное определение плотности по названию выбранного продукта
    let density = 1.0;
    
    // Получаем текущий выбранный продукт из любой активной вкладки (например, со второй)
    const activeProductSelect = document.getElementById('solid-product-select');
    const productName = activeProductSelect ? activeProductSelect.value.trim() : "";

    if (productName.length >= 2) {
        const secondChar = productName.charAt(1).toUpperCase();
        if (secondChar === 'P') {
            density = 1.2; // Пигментированная краска
        } else if (secondChar === 'T') {
            density = 1.0; // Прозрачный лак
        }
    }

    // 1. Расчет толщины сухого слоя
    if (wetStr !== "") {
        const wetMicro = parseFloat(wetStr.replace(",", "."));
        if (!isNaN(wetMicro)) {
            const dryCalculated = wetMicro * (solidPercent / 100.0);
            tvDryThickness.textContent = dryCalculated.toFixed(1);
        }
    } else {
        tvDryThickness.textContent = "0.0";
    }

    // 2. Расчет теоретического расхода
    if (requiredDryStr !== "") {
        const reqDryMicro = parseFloat(requiredDryStr.replace(",", "."));
        if (!isNaN(reqDryMicro)) {
            const consumptionCalculated = (reqDryMicro * density) / (solidPercent / 100.0);
            tvConsumption.textContent = consumptionCalculated.toFixed(1);
            
            console.log(`Продукт: ${productName || "Вручную"}, Плотность: ${density} г/см³`);
        }
    } else {
        tvConsumption.textContent = "0.0";
    }

    if (wetStr === "" && requiredDryStr === "") {
        alert("Заполните хотя бы одно поле для вычислений!");
    }
}
