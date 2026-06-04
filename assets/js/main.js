lucide.createIcons();

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = mobileMenuBtn.querySelector('i');
    if (mobileMenu.classList.contains('hidden')) {
        icon.setAttribute('data-lucide', 'menu');
    } else {
        icon.setAttribute('data-lucide', 'x');
    }
    lucide.createIcons();
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('shadow-sm');
    } else {
        navbar.classList.remove('shadow-sm');
    }
});

// Add group functionality
const groupList = document.getElementById('groupList');
const addGroupBtn = document.getElementById('addGroupBtn');
const groupCountEl = document.getElementById('groupCount');
let groupCount = 3;

addGroupBtn.addEventListener('click', () => {
    groupCount++;
    const groupNames = ['📊 Analytics Team', '🎨 Design Squad', '🚀 Dev Team', '📣 Social Media', '🤝 Partners', '🏆 Leadership'];
    const randomName = groupNames[Math.floor(Math.random() * groupNames.length)];
    const newGroup = document.createElement('div');
    newGroup.className = 'flex items-center gap-2 bg-wa-gray rounded-lg px-3 py-2.5 animate-slide-up';
    newGroup.innerHTML = `
                <span class="text-sm text-gray-600 flex-1 truncate">${randomName}</span>
                <span class="text-xs text-wa-green font-medium bg-wa-light px-2 py-0.5 rounded-full">Active</span>
                <button class="text-gray-400 hover:text-red-500 transition-colors p-1 remove-group"><i data-lucide="x" class="w-4 h-4"></i></button>
            `;
    groupList.appendChild(newGroup);
    updateGroupCount();
    lucide.createIcons();
    attachRemoveListeners();
});

function attachRemoveListeners() {
    document.querySelectorAll('.remove-group').forEach(btn => {
        btn.onclick = function () {
            this.closest('.flex').remove();
            groupCount--;
            updateGroupCount();
        };
    });
}

function updateGroupCount() {
    const actualCount = groupList.querySelectorAll('.flex').length;
    groupCount = actualCount;
    groupCountEl.textContent = actualCount + ' group' + (actualCount !== 1 ? 's' : '');
}
attachRemoveListeners();

// Keyword functionality
const keywordTags = document.getElementById('keywordTags');
const keywordInput = document.getElementById('keywordInput');
const addKeywordBtn = document.getElementById('addKeywordBtn');
const keywordCountEl = document.getElementById('keywordCount');
let keywordCount = 4;

function addKeyword(tag) {
    if (!tag.trim()) return;
    keywordCount++;
    const span = document.createElement('span');
    span.className =
        'inline-flex items-center gap-1 bg-wa-light text-wa-dark text-xs font-medium px-3 py-1.5 rounded-full animate-fade-in';
    span.innerHTML = `
                ${tag.trim()}
                <button class="hover:text-red-500 transition-colors remove-keyword"><i data-lucide="x" class="w-3 h-3"></i></button>
            `;
    keywordTags.appendChild(span);
    updateKeywordCount();
    lucide.createIcons();
    attachKeywordRemoveListeners();
}

function attachKeywordRemoveListeners() {
    document.querySelectorAll('.remove-keyword').forEach(btn => {
        btn.onclick = function () {
            this.closest('span').remove();
            keywordCount--;
            updateKeywordCount();
        };
    });
}
attachKeywordRemoveListeners();

function updateKeywordCount() {
    const actualCount = keywordTags.querySelectorAll('span').length;
    keywordCount = actualCount;
    keywordCountEl.textContent = actualCount + ' keyword' + (actualCount !== 1 ? 's' : '');
}

addKeywordBtn.addEventListener('click', () => {
    addKeyword(keywordInput.value);
    keywordInput.value = '';
});
keywordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addKeyword(keywordInput.value);
        keywordInput.value = '';
    }
});

// Interval display update
const intervalSelect = document.getElementById('intervalSelect');
const displayInterval = document.getElementById('displayInterval');
intervalSelect.addEventListener('change', () => {
    const val = intervalSelect.value;
    if (val <= 30) displayInterval.textContent = val + ' min';
    else displayInterval.textContent = (val / 60) + ' hr';
});

// Boss number display update
const bossNumberList = document.getElementById('bossNumberList');
const addBossNumberBtn = document.getElementById('addBossNumberBtn');
const displayNumber = document.getElementById('displayNumber');

if (addBossNumberBtn) {
    addBossNumberBtn.addEventListener('click', () => {
        const newDiv = document.createElement('div');
        newDiv.className = 'flex items-center gap-2 bg-wa-gray rounded-lg px-4 py-3 animate-slide-up';
        newDiv.innerHTML = `
            <span class="text-sm text-gray-400">+</span>
            <input type="text" placeholder="Add number..." class="bg-transparent border-0 text-sm text-gray-700 flex-1 focus:outline-none boss-number-input">
            <button class="text-gray-400 hover:text-red-500 transition-colors p-1 remove-boss-number"><i data-lucide="x" class="w-4 h-4"></i></button>
        `;
        bossNumberList.appendChild(newDiv);
        lucide.createIcons();
        attachBossNumberRemoveListeners();
        attachBossNumberInputListeners();
    });
}

function attachBossNumberRemoveListeners() {
    document.querySelectorAll('.remove-boss-number').forEach(btn => {
        btn.onclick = function () {
            this.closest('.flex').remove();
            updateDisplayNumber();
        };
    });
}

function attachBossNumberInputListeners() {
    document.querySelectorAll('.boss-number-input').forEach(input => {
        input.oninput = updateDisplayNumber;
    });
}

function updateDisplayNumber() {
    const inputs = document.querySelectorAll('.boss-number-input');
    if (inputs.length > 0 && inputs[0].value) {
        displayNumber.textContent = '+' + inputs[0].value + (inputs.length > 1 ? ` (+${inputs.length - 1} more)` : '');
    } else {
        displayNumber.textContent = 'None';
    }
}

attachBossNumberRemoveListeners();
attachBossNumberInputListeners();

// Save configuration
const saveConfigBtn = document.getElementById('saveConfigBtn');
const toastNotification = document.getElementById('toastNotification');
const lastChecked = document.getElementById('lastChecked');

saveConfigBtn.addEventListener('click', () => {
    // Show toast
    toastNotification.style.opacity = '1';
    toastNotification.style.transform = 'translateY(0)';
    toastNotification.style.transition = 'all 0.3s ease';

    // Update last checked
    lastChecked.textContent = 'Just now';

    // Flash effect on save button
    saveConfigBtn.textContent = '✓ Saved!';
    saveConfigBtn.classList.add('bg-wa-green');
    setTimeout(() => {
        saveConfigBtn.innerHTML =
            '<i data-lucide="save" class="w-5 h-5"></i> Save Configuration';
        saveConfigBtn.classList.remove('bg-wa-green');
        lucide.createIcons();
    }, 2000);

    // Hide toast after 3 seconds
    setTimeout(() => {
        toastNotification.style.opacity = '0';
        toastNotification.style.transform = 'translateY(10px)';
    }, 3000);
});

// Initial toast state
toastNotification.style.opacity = '0';
toastNotification.style.transform = 'translateY(10px)';
toastNotification.style.transition = 'all 0.3s ease';

// Mouse trailing ripple effect
let lastRippleTime = 0;
document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    if (now - lastRippleTime < 50) return; // create a ripple every 50ms
    lastRippleTime = now;

    const ripple = document.createElement('div');
    ripple.className = 'mouse-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1000); // matches animation duration
});
