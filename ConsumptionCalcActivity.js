// =================================================================
// Логика перенесена из ConsumptionCalcActivity.java
// =================================================================

function performConsumptionCalculations() {
    const areaStr = document.getElementById('etArea').value.trim();
    const transferStr = document.getElementById('etTransferEfficiencyConsumption').value.trim();
    const weightStr = document.getElementById('etWeightOnDetail').value.trim();
    const tvResult = document.getElementById('tvResultConsumption');

    if (!tvResult) return;

    if (!areaStr || !transferStr || !weightStr) {
        alert("Заполните все три поля для вычислений!");
        return;
    }

    // Безопасно заменяем запятую на точку перед парсингом
    const area = parseFloat(areaStr.replace(",", "."));
    const transfer = parseFloat(transferStr.replace(",", "."));
    const weight = parseFloat(weightStr.replace(",", "."));

    // ЗАЩИТА ОТ ДУРАКА ИЗ JAVA-КОДА
    if (isNaN(area) || area <= 0) {
        alert("⚠️ Площадь детали должна быть больше 0!");
        return;
    }
    if (isNaN(transfer) || transfer <= 0 || transfer > 100) {
        alert("⚠️ Процент переноса должен быть строго от 0.1% до 100%!");
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        alert("⚠️ Вес ЛКМ должен быть больше 0!");
        return;
    }

    // Формула: вес / площадь / (процент переноса / 100)
    const consumptionCalculated = weight / area / (transfer / 100.0);

    // Выводим результат с округлением до двух знаков
    tvResult.textContent = `${consumptionCalculated.toFixed(2)} г/кв.м`;
}
