import { modsItems } from '../data/apps-data.js';

// Particles Configuration
function initParticles() {
    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#f59e0b" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
            line_linked: { enable: true, distance: 150, color: "#f59e0b", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
            modes: { grab: { distance: 140, line_linked: { opacity: 0.5 } }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
}

window.appsData = modsItems;

const appsList = document.getElementById('appsList');
const searchInput = document.getElementById('searchInput');
const totalSpan = document.getElementById('totalCount');
const filterChips = document.querySelectorAll('.filter-chip');

let currentFilter = "all";
let searchKeyword = "";

// Hàm xử lý tải trực tiếp - chuyển hướng đến link
function handleDirectDownload(url) {
    if (url) {
        window.open(url, '_blank');
    } else {
        alert('Link tải không khả dụng');
    }
}

function getFilteredApps() {
    let apps = [...window.appsData];
    if (currentFilter === 'badge') {
        apps = apps.filter(app => app.badge === true);
    }
    if (searchKeyword.trim() !== "") {
        const kw = searchKeyword.trim().toLowerCase();
        apps = apps.filter(app =>
            app['tieu-de'].toLowerCase().includes(kw) ||
            app['mo-ta'].toLowerCase().includes(kw)
        );
    }
    return apps;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderList() {
    const filtered = getFilteredApps();
    totalSpan.innerText = filtered.length;

    if (filtered.length === 0) {
        appsList.innerHTML = `<div class="empty-state"><i class="fas fa-box-open fa-2x" style="margin-bottom: 0.8rem; opacity:0.6;"></i><br />😢 Không tìm thấy ứng dụng nào</div>`;
        return;
    }

    appsList.innerHTML = filtered.map(app => `
        <div class="app-item" data-app-url="${app['link-tai']}">
            <div class="app-item-inner">
                <img class="app-logo" src="${app.logo}" alt="${app['tieu-de']}" loading="lazy" onerror="this.src='https://placehold.co/200x200/1e293b/f59e0b?text=MOD'">
                <div class="app-info">
                    <div class="app-title">
                        ${escapeHtml(app['tieu-de'])}
                        ${app.badge ? '<span class="app-badge"><i class="fas fa-bolt"></i> HOT</span>' : ''}
                    </div>
                    <div class="app-time">
                        <i class="fas fa-clock"></i> ${escapeHtml(app['thoi-gian-upload'] || 'Không rõ')}
                    </div>
                    <div class="app-mota">
                        <i class="fas fa-align-left"></i> ${escapeHtml(app['mo-ta'])}
                    </div>
                </div>
                <div class="download-icon">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        </div>
    `).join('');

    // Gắn sự kiện click cho từng ứng dụng - chuyển hướng trực tiếp
    document.querySelectorAll('.app-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-app-url');
            handleDirectDownload(url);
        });
    });
}

// Event listeners
searchInput.addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    renderList();
});

filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const filterVal = chip.getAttribute('data-filter');
        currentFilter = filterVal === 'all' ? 'all' : 'badge';
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderList();
    });
});

// Initialize
initParticles();
renderList();
console.log(`✅ Đã tải ${window.appsData.length} ứng dụng từ data/apps-data.js`);