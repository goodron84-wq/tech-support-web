// =================================================================
// Логика перенесена из PriceCalcActivity.java + ДИНАМИЧЕСКАЯ ПЛОТНОСТЬ
// =================================================================

// Автоматическая подстановка имен продуктов из баз при открытии вкладки
function initPriceScreen() {
    const etNameA = document.getElementById('etNameA');
    const etNameB = document.getElementById('etNameB');
    const etNameThinner = document.getElementById('etNameThinner');
    const tvUnitA = document.getElementById('tvUnitA');
    const tvPriceBreakdown = document.getElementById('tvPriceBreakdown');

    // Берем данные из активного выбора на вкладке Сухого Остатка / Смешивания
    const selectedProduct = document.getElementById('solid-product-select')?.value || "";
    const selectedHardener = document.getElementById('solid-hardener-select')?.value || "";
    const selectedThinner = document.getElementById('solid-diluent-select')?.value || "";

    if (selectedProduct) {
        etNameA.value = selectedProduct;
        // Определение единицы измерения по второй букве (P -> р/кг, T -> р/л)
        if (selectedProduct.length >= 2) {
            const secondChar = selectedProduct.charAt(1).toUpperCase();
            tvUnitA.textContent = (secondChar === 'P') ? "р/кг" : "р/л";
        }
    }

    if (selectedHardener) etNameB.value = selectedHardener;
    if (selectedThinner) etNameThinner.value = selectedThinner;

    // Считываем сохраненные пропорции из элементов второй вкладки
    window.lastHardenerPercent = parseFloat(document.getElementById('solid-hardener-pct')?.value) || 0;
    window.lastThinnerPercent = parseFloat(document.getElementById('solid-diluent-pct')?.value) || 0;

    const initHardener = etNameB.value.trim() || "Отвердитель";
    const initThinner = etNameThinner.value.trim() || "Разбавитель";

    tvPriceBreakdown.textContent = `Рецепт: ${initHardener}: ${window.lastHardenerPercent.toFixed(1)}%, ${initThinner}: ${window.lastThinnerPercent.toFixed(1)}%`;
}

function calculateTotalMixPrice() {
    const etNameA = document.getElementById('etNameA').value.trim();
    const etNameB = document.getElementById('etNameB').value.trim();
    const etNameThinner = document.getElementById('etNameThinner').value.trim();

    const priceA = parseFloat(document.getElementById('etPriceA').value) || 0;
    const priceB = parseFloat(document.getElementById('etPriceB').value) || 0;
    const priceThinner = parseFloat(document.getElementById('etPriceThinner').value) || 0;

    const transferEfficiency = parseFloat(document.getElementById('etTransferEfficiency').value) || 0;
    const manualConsumptionGrams = parseFloat(document.getElementById('etManualConsumption').value) || 0;

    const tvPricePerKg = document.getElementById('tvPricePerKg');
    const tvPricePerLiter = document.getElementById('tvPricePerLiter');
    const tvPricePerSqMeter = document.getElementById('tvPricePerSqMeter');
    const tvPriceBreakdown = document.getElementById('tvPriceBreakdown');

    if (!etNameA) {
        alert("⚠️ Сначала выберите материал на вкладке Сухой остаток!");
        return;
    }

    if (transferEfficiency <= 0 || transferEfficiency > 100) {
        alert("Коэффициент переноса должен быть от 1% до 100%!");
        return;
    }

    if (manualConsumptionGrams <= 0) {
        alert("Введите корректный расход материала!");
        return;
    }

    // 1. Ищем точную плотность основы (Часть А) в products_database.csv (Столбец D - индекс 3)
    let densityA = 1.0;
    const productRow = productsDb.find(row => row[2] === etNameA || row[0] === etNameA);
    if (productRow && productRow[3]) {
        let val = parseFloat(productRow[3].replace(',', '.'));
        if (!isNaN(val)) densityA = val;
    }

    // 2. Ищем точную плотность ОТВЕРДИТЕЛЯ в hardeners_directory.csv (Столбец D - индекс 3)
    let densityB = 0.96; // Дефолтное значение на случай отсутствия в базе
    if (etNameB) {
        const hardenerRow = hardenersDb.find(row => row[0] === etNameB || row[1] === etNameB);
        if (hardenerRow && hardenerRow[3]) {
            let val = parseFloat(hardenerRow[3].replace(',', '.'));
            if (!isNaN(val)) densityB = val;
        }
    }

    // 3. Ищем точную плотность РАЗБАВИТЕЛЯ в diluents_directory.csv (Столбец D - индекс 3)
    let densityThinner = 0.86; // Дефолтное значение на случай отсутствия в базе
    if (etNameThinner) {
        const thinnerRow = diluentsDb.find(row => row[0] === etNameThinner || row[1] === etNameThinner);
        if (thinnerRow && thinnerRow[3]) {
            let val = parseFloat(thinnerRow[3].replace(',', '.'));
            if (!isNaN(val)) densityThinner = val;
        }
    }

    const currentUnitA = document.getElementById('tvUnitA').textContent;

    // Расчет цены за 1 грамм с учетом динамической плотности
    const pricePerGramA = (currentUnitA === "р/кг") ? (priceA / 1000.0) : ((priceA / densityA) / 1000.0);
    const pricePerGramB = (priceB / densityB) / 1000.0;
    const pricePerGramThinner = (priceThinner / densityThinner) / 1000.0;

    // Массы компонентов на базе 1000г основы
    const massA = 1000.0;
    const hPct = window.lastHardenerPercent || 0;
    const tPct = window.lastThinnerPercent || 0;

    let massB = massA * (hPct / 100.0);
    let massThinner = massA * (tPct / 100.0);

    if (priceB === 0) massB = 0.0;
    if (priceThinner === 0) massThinner = 0.0;

    const totalMixMassGrams = massA + massB + massThinner;
    const totalMixMassKg = totalMixMassGrams / 1000.0;

    const volumeA = massA / densityA;
    const volumeB = massB / densityB;
    const volumeThinner = massThinner / densityThinner;
    const totalMixVolumeLiters = (volumeA + volumeB + volumeThinner) / 1000.0;

    // Итоговая стоимость жидкой системы
    const costA = massA * pricePerGramA;
    const costB = massB * pricePerGramB;
    const costThinner = massThinner * pricePerGramThinner;
    const totalCostOfMix = costA + costB + costThinner;

    const finalPricePerKg = totalCostOfMix / totalMixMassKg;
    const finalPricePerLiter = totalCostOfMix / totalMixVolumeLiters;

    // Вывод результатов на плашку результатов
    tvPricePerKg.textContent = `${finalPricePerKg.toFixed(2)} р.`;
    tvPricePerLiter.textContent = `${finalPricePerLiter.toFixed(2)} р.`;

    // Расчет стоимости покрытия за квадратный метр
    const realConsumptionWithLossGrams = manualConsumptionGrams / (transferEfficiency / 100.0);
    const finalPricePerSqMeter = (realConsumptionWithLossGrams / 1000.0) * finalPricePerKg;

    tvPricePerSqMeter.textContent = `${finalPricePerSqMeter.toFixed(2)} р.`;

    let nameB = etNameB || "Отвердитель";
    let nameT = etNameThinner || "Разбавитель";

    tvPriceBreakdown.textContent = `${nameB}: ${hPct.toFixed(0)}%, ${nameT}: ${tPct.toFixed(0)}%`;

    console.log(`Успешно рассчитано! Динамические плотности -> А: ${densityA}, B: ${densityB}, Thinner: ${densityThinner}`);
}
