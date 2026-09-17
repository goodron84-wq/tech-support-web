// =================================================================
// ГЛОБАЛЬНЫЕ МАССИВЫ ДАННЫХ ДЛЯ ВЕБ-ВЕРСИИ 2.0 (ПОД ИНДЕКСЫ ОКОН)
// =================================================================
let productsDb = [];
let recipesDb = [];
let hardenersDb = [];
let diluentsDb = [];

// Функция асинхронной загрузки всех CSV баз при старте страницы
async function loadAllDatabases() {
    try {
        // 1. Загружаем Отвердители (из hardeners_directory.csv)
        const responseHardeners = await fetch('assets/hardeners_directory.csv');
        const textHardeners = await responseHardeners.text();
        hardenersDb = parseSemiColonCsv(textHardeners);

        // 2. Загружаем Разбавители (из diluents_directory.csv)
        const responseDiluents = await fetch('assets/diluents_directory.csv');
        const textDiluents = await responseDiluents.text();
        diluentsDb = parseSemiColonCsv(textDiluents);

        // 3. Загружаем Продукты Части А (из products_database.csv)
        const responseProducts = await fetch('assets/products_database.csv');
        const textProducts = await responseProducts.text();
        productsDb = parseSemiColonCsv(textProducts);

        // 4. Загружаем Рецептуры Смешивания (из mixing_recipes.csv)
        const responseRecipes = await fetch('assets/mixing_recipes.csv');
        const textRecipes = await responseRecipes.text();
        recipesDb = parseSemiColonCsv(textRecipes);

        console.log("Базы данных версии 2.0 успешно загружены в массивы!");

        // Навешиваем слушатели на элементы управления, если открыта вкладка
        initSolidCalcEventListeners();

    } catch (error) {
        console.error("Критическая ошибка загрузки CSV файлов: ", error);
    }
}

// Универсальный парсер строк по точке с запятой
function parseSemiColonCsv(text) {
    const result = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const tokens = line.split(';');
        result.push(tokens);
    }
    return result;
}

// Связываем элементы интерфейса с функциями поиска
function initSolidCalcEventListeners() {
    const prodSelect = document.getElementById('solid-product-select');
    if (prodSelect) {
        prodSelect.removeAttribute('onclick'); // Убираем старые атрибуты
        prodSelect.addEventListener('input', filterSolidProducts);
        prodSelect.addEventListener('click', toggleSolidDropdown);
    }
    const hardSelect = document.getElementById('solid-hardener-select');
    if (hardSelect) {
        hardSelect.addEventListener('change', onSolidHardenerChanged);
    }
    const calcBtn = document.getElementById('solid-calc-btn') || document.getElementById('btnCalculate');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateSolid);
    }
}

// Запускаем автоматический сбор баз данных при загрузке вкладки в браузере
document.addEventListener("DOMContentLoaded", loadAllDatabases);

// =================================================================
// ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ
// =================================================================
function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        if (screen.id === screenId) {
            screen.classList.add('active');
        }
    });

    const results = document.querySelectorAll('.result-div, #solid-result, #tvResult');
    results.forEach(res => {
        if (res) res.style.display = 'none';
    });
}
