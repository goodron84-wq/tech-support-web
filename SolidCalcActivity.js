// =================================================================
// Логика перенесена из SolidCalcActivity.java (ВЕБ-ВЕРСИЯ С ФИКСАМИ 2.0)
// =================================================================

function onSolidProductChanged() {
    const rawInput = document.getElementById('solid-product-select').value;

    if (!rawInput) {
        const hardenerSelect = document.getElementById('solid-hardener-select');
        if (hardenerSelect) hardenerSelect.innerHTML = '<option value="">Нет отв.</option>';

        const hintHardener = document.getElementById('solid-hardener-hint');
        if (hintHardener) hintHardener.textContent = "0%";

        const hintDiluent = document.getElementById('solid-diluent-hint');
        if (hintDiluent) hintDiluent.textContent = "—";

        const pctHardener = document.getElementById('solid-hardener-pct');
        if (pctHardener) pctHardener.value = "";

        const pctDiluent = document.getElementById('solid-diluent-pct');
        if (pctDiluent) pctDiluent.value = "";

        const rowAcc = document.getElementById('rowAccelerator');
        if (rowAcc) rowAcc.style.display = 'none';

        const resDiv = document.getElementById('solid-result');
        if (resDiv) resDiv.style.display = 'none';
        return;
    }

    const selectedProduct = rawInput.trim().toUpperCase();
    
    // 1. Обновление Отвердителей (mixing_recipes.csv: Индекс 0 - Продукт, Индекс 1 - Отвердитель)
    const hardenerSelect = document.getElementById('solid-hardener-select');
    if (hardenerSelect && typeof recipesDb !== 'undefined') {
        hardenerSelect.innerHTML = '';
        const matchingRecipes = recipesDb.filter(row => row && row[0] && row[0].trim().toUpperCase() === selectedProduct);

        if (matchingRecipes.length === 0 || matchingRecipes[0][1] === "-") {
            let opt = document.createElement('option');
            opt.value = ""; opt.textContent = "Нет отв.";
            hardenerSelect.appendChild(opt);
        } else {
            const addedHardeners = new Set();
            matchingRecipes.forEach(row => {
                const hName = row[1].trim();
                if (hName !== "-" && !addedHardeners.has(hName)) {
                    addedHardeners.add(hName);
                    let opt = document.createElement('option');
                    opt.value = hName; opt.textContent = hName;
                    hardenerSelect.appendChild(opt);
                }
            });
        }
    }

    // 2. Обновление Разбавителей (mixing_recipes.csv: Индекс 4 - Название, Индекс 5 - Мин, Индекс 6 - Макс)
    if (typeof recipesDb !== 'undefined') {
        const recipeRow = recipesDb.find(row => row && row[0] && row[0].trim().toUpperCase() === selectedProduct);
        const diluentNameField = document.getElementById('tvThinnerName') || document.getElementById('solid-diluent-select');
        const hintDiluent = document.getElementById('solid-diluent-hint');
        const pctDiluent = document.getElementById('solid-diluent-pct');

        if (recipeRow) {
            let dilName = recipeRow[4] ? recipeRow[4].trim() : "-";
            let tMin = recipeRow[5] ? recipeRow[5].trim() : "0";
            let tMax = recipeRow[6] ? recipeRow[6].trim() : "0";

            // Выводим точное название S10 / S50 / Вода вместо слова "Разбавитель"
            if (diluentNameField) {
                if (diluentNameField.tagName === "SELECT") {
                    diluentNameField.innerHTML = `<option value="${dilName}">${dilName === "-" ? "Разбавитель" : dilName}</option>`;
                } else {
                    diluentNameField.textContent = (dilName === "-") ? "Разбавитель" : dilName;
                }
            }

            if (dilName === "-" || (tMin === "0" && tMax === "0")) {
                if (hintDiluent) hintDiluent.textContent = "—";
                if (pctDiluent) {
                    pctDiluent.value = "0";
                    pctDiluent.disabled = true;
                    pctDiluent.style.backgroundColor = "#F1F5F9";
                }
            } else {
                if (hintDiluent) hintDiluent.textContent = `${tMin}-${tMax}%`;
                if (pctDiluent) {
                    pctDiluent.value = "";
                    pctDiluent.placeholder = "0";
                    pctDiluent.disabled = false;
                    pctDiluent.style.backgroundColor = "#ffffff";
                }
            }

            // 3. Управление Ускорителем версии 2.0 (Индексы: 7 - Название, 8 - Мин, 9 - Макс)
            const rowAcc = document.getElementById('rowAccelerator');
            const hintAcc = document.getElementById('solid-accelerator-hint') || document.getElementById('solid-accelerator-range');
            const pctAcc = document.getElementById('solid-accelerator-pct') || document.getElementById('etAcceleratorPercent');

            let accName = recipeRow[7] ? recipeRow[7].trim() : "-";
            let accMin = recipeRow[8] ? recipeRow[8].trim() : "0";
            let accMax = recipeRow[9] ? recipeRow[9].trim() : "0";

            if (selectedProduct.startsWith("E") && accName !== "-" && (accMin !== "0" || accMax !== "0")) {
                if (rowAcc) rowAcc.style.display = 'flex';
                if (hintAcc) hintAcc.textContent = `${accMin}-${accMax}%`;
                if (pctAcc) {
                    pctAcc.disabled = false;
                    pctAcc.style.backgroundColor = "#ffffff";
                    pctAcc.value = "";
                    pctAcc.placeholder = "0";
                }
            } else {
                if (rowAcc) rowAcc.style.display = 'none';
                if (pctAcc) {
                    pctAcc.value = "0";
                    pctAcc.disabled = true;
                    pctAcc.style.backgroundColor = "#F1F5F9";
                }
            }
        }
    }

    onSolidHardenerChanged();
    const resDiv = document.getElementById('solid-result');
    if (resDiv) resDiv.style.display = 'none';
}

function onSolidHardenerChanged() {
    const rawProduct = document.getElementById('solid-product-select').value;
    if (!rawProduct || typeof recipesDb === 'undefined') return;

    const selectedProduct = rawProduct.trim().toUpperCase();
    const selectedHardener = document.getElementById('solid-hardener-select').value;
    const hintElement = document.getElementById('solid-hardener-hint');
    const pctInput = document.getElementById('solid-hardener-pct');

    if (!pctInput || !hintElement) return;

    if (!selectedHardener || selectedHardener === "Нет отв." || selectedHardener === "") {
        hintElement.textContent = "0%";
        pctInput.value = "0";
        pctInput.disabled = true;
        pctInput.style.backgroundColor = "#F1F5F9";
        return;
    }

    pctInput.disabled = false;
    pctInput.style.backgroundColor = "#ffffff";

    const recipeRow = recipesDb.find(row => row && row[0].trim().toUpperCase() === selectedProduct && row[1] === selectedHardener);
    if (recipeRow) {
        const minVal = recipeRow[2];
        const maxVal = recipeRow[3];
        hintElement.textContent = `${minVal}-${maxVal}%`;
        pctInput.value = "";
        pctInput.placeholder = "0";
    }
}
function calculateSolid() {
    const rawProduct = document.getElementById('solid-product-select').value;

    if (!rawProduct) {
        alert("⚠️ Сначала выберите продукт из списка!");
        return;
    }

    const selectedProduct = rawProduct.trim().toUpperCase();
    const selectedHardener = document.getElementById('solid-hardener-select').value;

    const hardenerInput = document.getElementById('solid-hardener-pct');
    const resultDiv = document.getElementById('solid-result');
    if (!hardenerInput || !resultDiv) return;

    if (!selectedHardener || selectedHardener === "" || selectedHardener === "Нет отв.") {
        hardenerInput.value = "0";
    }

    const hardenerVol = parseFloat(hardenerInput.value) || 0;
    const diluentVol = parseFloat(document.getElementById('solid-diluent-pct').value) || 0;

    const rowAcc = document.getElementById('rowAccelerator');
    const acceleratorVol = (rowAcc && rowAcc.style.display !== 'none') ? (parseFloat(document.getElementById('solid-accelerator-pct').value) || 0) : 0;

    if (diluentVol < 0 || hardenerVol < 0 || acceleratorVol < 0) {
        alert("⚠️ Количество компонентов не может быть меньше 0!");
        return;
    }

    hardenerInput.style.borderColor = "#cbd5e1";

    let isHardenerValid = true;
    const rangeText = document.getElementById('solid-hardener-hint').textContent.replace("%", "").trim();

    if (selectedHardener && selectedHardener !== "Нет отв." && rangeText !== "—" && rangeText !== "0" && rangeText !== "0%") {
        try {
            const parts = rangeText.split("-");
            if (parts.length === 2) {
                const minAllowed = parseFloat(parts[0].trim());
                const maxAllowed = parseFloat(parts[1].trim());
                if (hardenerVol < minAllowed || hardenerVol > maxAllowed) {
                    isHardenerValid = false;
                }
            }
        } catch (e) { console.error(e); }
    }

    if (!isHardenerValid) {
        hardenerInput.style.backgroundColor = "#FFEBEE";
        hardenerInput.style.borderColor = "#EF4444";

        resultDiv.innerHTML = `
            <div style="color: #991B1B; font-weight: bold; margin-bottom: 6px;">⚠️ Внимание! Нарушена дозировка отвердителя!</div>
            <div style="color: #475569; font-size: 14px;">Рекомендованный допуск по паспорту: <b>${rangeText}</b></div>
        `;
        resultDiv.style.backgroundColor = "#FEE2E2";
        resultDiv.style.display = 'block';
        return;
    }

    if (typeof productsDb === 'undefined' || typeof hardenersDb === 'undefined') return;

    // Ищем сухой остаток Части А (products_database.csv - Индекс 2 это Название, Индекс 4 это сухой остаток)
    const productRow = productsDb.find(row => row && row[2] && row[2].trim().toUpperCase() === selectedProduct);
    let baseSolidPct = 0.00;
    if (productRow && productRow[4]) {
        let val = parseFloat(productRow[4].replace(',', '.'));
        if (!isNaN(val)) baseSolidPct = val;
    }

    // Ищем сухой остаток Отвердителя Части B (hardeners_directory.csv - Индекс 0 это Код, Индекс 2 это сухой остаток)
    let hardenerSolidPct = 0.00;
    if (selectedHardener && selectedHardener !== "Нет отв.") {
        const hardenerRow = hardenersDb.find(row => row && row[0] && row[0].trim().toUpperCase() === selectedHardener.trim().toUpperCase());
        if (hardenerRow && hardenerRow[2]) {
            let val = parseFloat(hardenerRow[2].replace(',', '.'));
            if (!isNaN(val)) hardenerSolidPct = val;
        }
    }

    // Ищем сухой остаток Ускорителя EA1
    let acceleratorSolidPct = 10.50;
    const accRow = hardenersDb.find(row => row && row[0] && row[0].trim().toUpperCase() === "EA1");
    if (accRow && accRow[2]) {
        let val = parseFloat(accRow[2].replace(',', '.'));
        if (!isNaN(val)) acceleratorSolidPct = val;
    }

    // МАТЕМАТИЧЕСКИЙ РАСЧЕТ ВЕРСИИ 2.0 (С учетом трех компонентов)
    const totalVolume = 100 + hardenerVol + diluentVol + acceleratorVol;
    const totalVolumeNoDiluent = 100 + hardenerVol + acceleratorVol;
    const absoluteSolidWeight = (100 * baseSolidPct) + (hardenerVol * hardenerSolidPct) + (acceleratorVol * acceleratorSolidPct);

    const solidMixPct = (absoluteSolidWeight / totalVolume);
    const solidNoDiluentPct = (absoluteSolidWeight / totalVolumeNoDiluent);

    window.lastCalculatedSolidContent = solidMixPct;

    resultDiv.style.backgroundColor = "#ADFF2F";
    resultDiv.style.borderColor = "#A3E635";
    resultDiv.innerHTML = `
        <div class="solid-result-line">Сухой остаток готовой смеси: <b>${solidMixPct.toFixed(2)}%</b></div>
        <div class="solid-result-line">Сухой остаток без разбавителя: <b>${solidNoDiluentPct.toFixed(2)}%</b></div>
        <div class="solid-result-line solid-result-spacer">Сухой остаток части А: <b>${baseSolidPct.toFixed(2)}%</b></div>
        <div class="solid-result-line">Сухой остаток части В: <b>${hardenerSolidPct.toFixed(2)}%</b></div>
    `;
    resultDiv.style.display = 'block';
}

function filterSolidProducts() {
    const inputField = document.getElementById('solid-product-select');
    const dropdown = document.getElementById('solid-custom-dropdown');
    if (!inputField || !dropdown || typeof productsDb === 'undefined') return;

    const filterPattern = inputField.value.trim().toUpperCase();
    dropdown.innerHTML = '';

    let allProducts = new Set();
    for (let i = 1; i < productsDb.length; i++) {
        if (productsDb[i] && productsDb[i][2]) {
            allProducts.add(productsDb[i][2].trim());
        }
    }
    const sortedProducts = Array.from(allProducts).sort();
    const filtered = sortedProducts.filter(prod => prod.toUpperCase().includes(filterPattern));

    if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    filtered.forEach(prodName => {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.textContent = prodName;

        item.onclick = function () {
            inputField.value = prodName;
            dropdown.style.display = 'none';
            onSolidProductChanged();
        };
        dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
}

function toggleSolidDropdown() {
    const dropdown = document.getElementById('solid-custom-dropdown');
    if (dropdown && dropdown.style.display === 'none') {
        filterSolidProducts();
    } else if (dropdown) {
        dropdown.style.display = 'none';
    }
}

document.addEventListener('click', function (e) {
    const wrapper = document.querySelector('.autocomplete-wrapper');
    const dropdown = document.getElementById('solid-custom-dropdown');
    if (dropdown && wrapper && !wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});
