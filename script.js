// ---------- 数据 ----------
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 生成本周日期
const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1);

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

// 计划数据
let planData = {};
weekDates.forEach(d => {
    planData[d.dateStr] = { 
        breakfast: { '主食': [], '蔬菜': [], '肉鱼': [], '蛋': [], '油脂': [], '水果': [] },
        lunch: { '主食': [], '蔬菜': [], '肉鱼': [], '蛋': [], '油脂': [], '水果': [] },
        dinner: { '主食': [], '蔬菜': [], '肉鱼': [], '蛋': [], '油脂': [], '水果': [] }
    };
});

// 菜谱库
let recipes = [
    { id: 1, name: '鳕鱼饼', category: '肉鱼', history: ['03/11早餐', '03/09午餐', '03/05晚餐'] },
    { id: 2, name: '蒸蛋', category: '蛋', history: ['03/11早餐', '03/08早餐', '03/06早餐', '03/03早餐', '03/01早餐'] },
    { id: 3, name: '炒鸡蛋', category: '蛋', history: ['03/11早餐', '03/10午餐', '03/07早餐', '03/04早餐'] },
    { id: 4, name: '西蓝花', category: '蔬菜', history: ['03/11早餐', '03/09晚餐'] },
    { id: 5, name: '蓝莓', category: '水果', history: ['03/11早餐', '03/08水果'] },
    { id: 6, name: '腰果', category: '油脂', history: ['03/11早餐'] },
    { id: 7, name: '藕片', category: '蔬菜', history: ['03/12午餐'] },
    { id: 8, name: '球生菜', category: '蔬菜', history: [] },
    { id: 9, name: '蝴蝶面', category: '主食', history: ['03/11早餐'] },
    { id: 10, name: '米饭', category: '主食', history: ['03/10午餐'] }
];

let selectedDate = weekDates.find(d => d.isToday)?.dateStr || weekDates[0].dateStr;
let selectedCategory = '';
let selectedMeal = '';

// ---------- 页面切换 ----------
function showPage(page) {
    const mainLayout = document.getElementById('mainLayout');
    const headerBtn = document.getElementById('newRecipeBtn');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    headerBtn.style.display = page === 'recipe' ? 'block' : 'none';
    
    if (page === 'plan') {
        mainLayout.innerHTML = renderPlanPage();
        initPlanEvents();
    } else if (page === 'recipe') {
        mainLayout.innerHTML = renderRecipePage();
        initRecipeEvents();
    } else if (page === 'search') {
        mainLayout.innerHTML = renderSearchPage();
    }
}

// ---------- 计划页 ----------
function renderPlanPage() {
    return `
        <div class="date-sidebar" id="dateSidebar">
            ${weekDates.map((d, index) => `
                <div class="date-item ${d.dateStr === selectedDate ? 'active' : ''}" data-date="${d.dateStr}">
                    ${weekDays[index]}<br>${d.dateStr}
                    ${d.isToday ? '<span class="date-tag">今</span>' : ''}
                </div>
            `).join('')}
        </div>
        <div class="plan-content" id="planContent">
            ${renderPlanContent()}
        </div>
    `;
}

function renderPlanContent() {
    const dayData = planData[selectedDate] || { breakfast: {}, lunch: {}, dinner: {} };
    return `
        <div class="selected-date-title">${selectedDate}</div>
        ${renderMealSection('早餐', dayData.breakfast)}
        ${renderMealSection('午餐', dayData.lunch)}
        ${renderMealSection('晚餐', dayData.dinner)}
    `;
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
                <div class="category-title">
                    <span>${cat}</span>
                    <span class="add-btn-small" style="font-size: 18px; cursor: pointer;" data-meal="${title}" data-category="${cat}">➕</span>
                </div>
                <div class="card-grid" data-meal="${title}" data-category="${cat}">
        `;
        
        catRecipes.forEach(recipeName => {
            const recipe = recipes.find(r => r.name === recipeName);
            const count = recipe ? recipe.history.length : 0;
            sectionHtml += renderRecipeCard(recipeName, count);
        });

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

function initPlanEvents() {
    // 日期点击
    document.querySelectorAll('.date-item').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.date-item').forEach(d => d.classList.remove('active'));
            el.classList.add('active');
            selectedDate = el.dataset.date;
            document.getElementById('planContent').innerHTML = renderPlanContent();
            initPlanEvents();
        });
    });
    
    // 折叠
    document.querySelectorAll('.meal-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            header.nextElementSibling.classList.toggle('collapsed');
        });
    });
    
    // 加号点击（小加号）
    document.querySelectorAll('.add-btn-small').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedMeal = btn.dataset.meal;
            selectedCategory = btn.dataset.category;
            showSelectRecipeModal(selectedCategory);
        });
    });
    
    // 菜谱卡片点击
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipe = recipes.find(r => r.name === card.dataset.name);
            if (recipe) showRecipeModal(recipe);
        });
    });
}

// ---------- 选择菜谱弹窗 ----------
function showSelectRecipeModal(category) {
    const modal = document.getElementById('selectRecipeModal');
    document.getElementById('selectModalTitle').textContent = `选择${category}`;
    
    const filteredRecipes = recipes.filter(r => r.category === category);
    const grid = document.getElementById('selectRecipeGrid');
    
    grid.innerHTML = filteredRecipes.map(recipe => 
        renderRecipeCard(recipe.name, recipe.history.length)
    ).join('');
    
    modal.classList.add('active');
    
    // 菜谱点击
    grid.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipeName = card.dataset.name;
            addToPlan(recipeName);
            modal.classList.remove('active');
        });
    });
    
    document.getElementById('closeSelectModal').addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

function addToPlan(recipeName) {
    if (!selectedMeal || !selectedCategory) return;
    
    const mealMap = { '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner' };
    const mealKey = mealMap[selectedMeal];
    
    if (!planData[selectedDate][mealKey][selectedCategory]) {
        planData[selectedDate][mealKey][selectedCategory] = [];
    }
    
    // 避免重复添加
    if (!planData[selectedDate][mealKey][selectedCategory].includes(recipeName)) {
        planData[selectedDate][mealKey][selectedCategory].push(recipeName);
    }
    
    // 更新历史
    const recipe = recipes.find(r => r.name === recipeName);
    if (recipe) {
        const todayStr = `${selectedDate}${selectedMeal}`;
        if (!recipe.history.includes(todayStr)) {
            recipe.history.unshift(todayStr);
        }
    }
    
    document.getElementById('planContent').innerHTML = renderPlanContent();
    initPlanEvents();
}

// ---------- 菜谱库页 ----------
function renderRecipePage() {
    return `
        <div class="recipe-page">
            <div class="recipe-header">
                <h2>📖 菜谱库</h2>
                <input type="text" class="search-box" id="recipeSearch" placeholder="搜索...">
            </div>
            <div class="category-filter" id="categoryFilter">
                <span class="filter-tag active" data-category="all">全部</span>
                <span class="filter-tag" data-category="主食">🍚 主食</span>
                <span class="filter-tag" data-category="蔬菜">🥬 蔬菜</span>
                <span class="filter-tag" data-category="肉鱼">🐟 肉鱼</span>
                <span class="filter-tag" data-category="蛋">🥚 蛋</span>
                <span class="filter-tag" data-category="油脂">🥜 油脂</span>
                <span class="filter-tag" data-category="水果">🍎 水果</span>
            </div>
            <div class="library-grid" id="libraryGrid"></div>
        </div>
    `;
}

function initRecipeEvents() {
    renderLibrary();
    
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            renderLibrary(tag.dataset.category, document.getElementById('recipeSearch').value);
        });
    });
    
    document.getElementById('recipeSearch').addEventListener('input', (e) => {
        const activeCat = document.querySelector('.filter-tag.active').dataset.category;
        renderLibrary(activeCat, e.target.value);
    });
}

function renderLibrary(category = 'all', search = '') {
    const grid = document.getElementById('libraryGrid');
    let filtered = recipes;

    if (category !== 'all') {
        filtered = filtered.filter(r => r.category === category);
    }
    if (search) {
        filtered = filtered.filter(r => r.name.includes(search));
    }

    grid.innerHTML = filtered.map(recipe => 
        renderRecipeCard(recipe.name, recipe.history.length)
    ).join('');

    document.querySelectorAll('#libraryGrid .recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipe = recipes.find(r => r.name === card.dataset.name);
            if (recipe) showRecipeModal(recipe);
        });
    });
}

// ---------- 搜索页 ----------
function renderSearchPage() {
    return `
        <div style="width: 100%; padding: 16px;">
            <input type="text" class="search-box" style="width: 100%; margin-bottom: 20px; padding: 10px;" placeholder="搜索菜谱...">
            <div style="font-size: 14px; color: #8f8579; margin-bottom: 12px;">最近搜索</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span class="filter-tag">鳕鱼</span>
                <span class="filter-tag">鸡蛋</span>
                <span class="filter-tag">西蓝花</span>
                <span class="filter-tag">牛肉</span>
            </div>
        </div>
    `;
}

// ---------- 弹窗 ----------
function showRecipeModal(recipe) {
    document.getElementById('modalRecipeName').textContent = recipe.name;
    document.getElementById('totalCount').textContent = recipe.history.length + '次';
    
    const monthCount = recipe.history.filter(h => h.includes('03/')).length;
    document.getElementById('monthCount').textContent = monthCount + '次';
    
    document.getElementById('lastTime').textContent = recipe.history[0] || '暂无';
    
    const historyHtml = recipe.history.slice(0, 10).map(h => 
        `<div class="history-item">• ${h}</div>`
    ).join('') || '<div class="history-item">暂无记录</div>';
    
    document.getElementById('historyList').innerHTML = historyHtml;
    document.getElementById('recipeModal').classList.add('active');
}

// ---------- 初始化 ----------
function init() {
    // 导航点击
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => showPage(item.dataset.page));
    });
    
    // 默认显示计划页
    showPage('plan');
    
    // 关闭弹窗
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('recipeModal').classList.remove('active');
    });
    
    // 新建菜谱
    document.getElementById('newRecipeBtn').addEventListener('click', () => {
        alert('新建菜谱功能开发中，可以直接修改recipes数组');
    });
}

init();