// ---------- 数据 ----------
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 生成本周日期
const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1); // 周一

const weekDates = [];
for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    weekDates.push({
        dateStr: `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`,
        fullDate: d,
        isToday: d.toDateString() === today.toDateString()
    });
}

// 初始计划数据 - 动态生成本周7天
let planData = {};
weekDates.forEach(d => {
    planData[d.dateStr] = { breakfast: {}, lunch: {}, dinner: {} };
});

// 菜谱库
let recipes = [
    { id: 1, name: '鳕鱼饼', category: '肉鱼', image: '', history: ['03/11早餐', '03/09午餐', '03/05晚餐'] },
    { id: 2, name: '蒸蛋', category: '蛋', image: '', history: ['03/11早餐', '03/08早餐', '03/06早餐', '03/03早餐', '03/01早餐'] },
    { id: 3, name: '炒鸡蛋', category: '蛋', image: '', history: ['03/11早餐', '03/10午餐', '03/07早餐', '03/04早餐'] },
    { id: 4, name: '西蓝花', category: '蔬菜', image: '', history: ['03/11早餐', '03/09晚餐'] },
    { id: 5, name: '蓝莓', category: '水果', image: '', history: ['03/11早餐', '03/08水果'] },
    { id: 6, name: '腰果', category: '油脂', image: '', history: ['03/11早餐'] },
    { id: 7, name: '藕片', category: '蔬菜', image: '', history: ['03/12午餐'] },
    { id: 8, name: '球生菜', category: '蔬菜', image: '', history: [] },
    { id: 9, name: '蝴蝶面', category: '主食', image: '', history: ['03/11早餐'] },
    { id: 10, name: '米饭', category: '主食', image: '', history: ['03/10午餐'] }
];

// 当前选中的日期 - 默认选中今天
let selectedDate = weekDates.find(d => d.isToday)?.dateStr || weekDates[0].dateStr;
let selectedRecipeForModal = null;

// ---------- 渲染左侧日期栏 ----------
function renderDateSidebar() {
    const sidebar = document.getElementById('dateSidebar');
    let html = '';
    weekDates.forEach((d, index) => {
        const dateKey = d.dateStr;
        const isActive = dateKey === selectedDate ? 'active' : '';
        const todayTag = d.isToday ? '<span class="date-tag">今</span>' : '';
        html += `
            <div class="date-item ${isActive}" data-date="${dateKey}">
                ${weekDays[index]}<br>${dateKey}
                ${todayTag}
            </div>
        `;
    });
    sidebar.innerHTML = html;

    // 添加点击事件
    document.querySelectorAll('.date-item').forEach(el => {
        el.addEventListener('click', (e) => {
            document.querySelectorAll('.date-item').forEach(d => d.classList.remove('active'));
            el.classList.add('active');
            selectedDate = el.dataset.date;
            renderRightContent();
        });
    });
}

// ---------- 渲染右侧三餐 ----------
function renderRightContent() {
    const content = document.getElementById('rightContent');
    const dayData = planData[selectedDate] || { breakfast: {}, lunch: {}, dinner: {} };

    let html = `<div class="selected-date-title">${selectedDate} · 安排</div>`;

    // 早餐
    html += renderMealSection('早餐', dayData.breakfast || {});
    // 午餐
    html += renderMealSection('午餐', dayData.lunch || {});
    // 晚餐
    html += renderMealSection('晚餐', dayData.dinner || {});

    content.innerHTML = html;

    // 添加折叠事件
    document.querySelectorAll('.meal-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            const content = header.nextElementSibling;
            content.classList.toggle('collapsed');
        });
    });
}

function renderMealSection(title, mealData) {
    const categories = ['主食', '蔬菜', '肉鱼', '蛋', '油脂', '水果'];
    let sectionHtml = `
        <div class="meal-section">
            <div class="meal-header">
                <span class="arrow">▼</span> ${title}
            </div>
            <div class="meal-content">
    `;

    categories.forEach(cat => {
        const catRecipes = mealData[cat] || [];
        sectionHtml += `
            <div class="category-row">
                <div class="category-title">${cat}</div>
                <div class="card-grid" data-meal="${title}" data-category="${cat}">
        `;

        // 已有的菜
        catRecipes.forEach(recipeName => {
            const recipe = recipes.find(r => r.name === recipeName);
            const count = recipe ? recipe.history.length : 0;
            sectionHtml += renderRecipeCard(recipeName, count, false);
        });

        // 加号卡片
        sectionHtml += `<div class="add-card" data-meal="${title}" data-category="${cat}">+</div>`;

        sectionHtml += `</div></div>`;
    });

    sectionHtml += `</div></div>`;
    return sectionHtml;
}

function renderRecipeCard(name, count) {
    return `
        <div class="recipe-card" data-name="${name}">
            <div class="card-image"></div>
            <div class="recipe-name">${name}</div>
            ${count > 0 ? `<div class="red-dot">${count}</div>` : ''}
        </div>
    `;
}

// ---------- 渲染菜谱库 ----------
function renderLibrary(category = 'all', search = '') {
    const grid = document.getElementById('libraryGrid');
    let filtered = recipes;

    if (category !== 'all') {
        filtered = filtered.filter(r => r.category === category);
    }

    if (search) {
        filtered = filtered.filter(r => r.name.includes(search));
    }

    let html = '';
    filtered.forEach(recipe => {
        html += renderRecipeCard(recipe.name, recipe.history.length);
    });

    grid.innerHTML = html;

    // 添加点击事件
    document.querySelectorAll('#libraryGrid .recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            const recipe = recipes.find(r => r.name === name);
            if (recipe) {
                showRecipeModal(recipe);
            }
        });
    });
}

// ---------- 显示弹窗 ----------
function showRecipeModal(recipe) {
    selectedRecipeForModal = recipe;
    document.getElementById('modalRecipeName').textContent = recipe.name;

    const total = recipe.history.length;
    const lastMonth = recipe.history.filter(h => {
        return h.includes('03/');
    }).length;

    document.getElementById('totalCount').textContent = total + '次';
    document.getElementById('monthCount').textContent = lastMonth + '次';
    document.getElementById('lastTime').textContent = recipe.history[0] || '暂无';

    let historyHtml = '';
    recipe.history.slice(0, 10).forEach(h => {
        historyHtml += `<div class="history-item">• ${h}</div>`;
    });
    if (recipe.history.length === 0) {
        historyHtml = '<div class="history-item">暂无记录</div>';
    }
    document.getElementById('historyList').innerHTML = historyHtml;

    document.getElementById('recipeModal').classList.add('active');
}

// ---------- 初始化 ----------
function init() {
    renderDateSidebar();
    renderRightContent();
    renderLibrary();

    // 筛选点击
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            const category = tag.dataset.category;
            const search = document.querySelector('.search-box').value;
            renderLibrary(category, search);
        });
    });

    // 搜索
    document.querySelector('.search-box').addEventListener('input', (e) => {
        const activeCat = document.querySelector('.filter-tag.active').dataset.category;
        renderLibrary(activeCat, e.target.value);
    });

    // 关闭弹窗
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('recipeModal').classList.remove('active');
    });

    // 新建菜谱
    document.querySelector('.header button').addEventListener('click', () => {
        alert('新建菜谱功能开发中，你可以直接修改recipes数组');
    });
}

// 启动
init();