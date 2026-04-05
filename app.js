// app.js - ESign mở modal chi tiết, Mods mở alert VIP khi tải xuống
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { firebaseConfig } from "./bootstrap.bundle.min.js";
import { esignItems } from "./data/esign-data.js";
import { certItems } from "./data/cert-data.js";
import { trollstoreItems } from "./data/trollstore-data.js";
import { modsItems } from "./data/mods-data.js";
import { initParticles, updateParticlesTheme } from "./components/particles-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const translations = {
  vi: {
    title: "APPLE CERTIFICATE.",
    subtitle: "Chia sẻ chứng chỉ ESign iPhone/iPad và các file iPAs mod",
    support: "Liên Hệ Hỗ Trợ 24/7",
    website: "Website Bán Chứng Chỉ Tự Động",
    dns: "DNS Chặn Thu Hồi và Quảng Cáo",
    "ipa-sign": "Ký IPA Trực Tuyến",
    "ipa-store": "Kho Ứng Dụng iPA MOD",
    contact: "Liên hệ: ",
    copyright: "Bản quyền © 2022 CHUNGCHIP12.COM. Bảo lưu mọi quyền.",
    beijing: "Beijing",
    "china-railway": "China Railway",
    "dtt-technology": "Dtt Technology",
    "tcl-household": "TCL Household",
    "wuling-power": "Wuling Power",
    "vietnamcert-01": "VietNamCert.01",
    "national-science-library": "National Science Library",
    "Nhân bản app": "Nhân bản và nhiều tính năng VIP ",
    youtube: "Mở khoá tính năng Premium",
    "mods-placeholder": "Mods Placeholder",
    "download-suffix": "lượt cài đặt thành công",
    "search-placeholder": "Tìm kiếm ứng dụng...",
    "no-results": "Không tìm thấy ứng dụng",
    "get-btn": "NHẬN",
    "download-btn-text": "Truy cập liên kết tải về",
    "download-note": "Sau khi nhấn 'NHẬN', ứng dụng sẽ được thêm vào thư viện của bạn",
    "app-info-title": "Thông tin bổ sung",
    "app-info-description": "Vì đây là ứng dụng được ký bằng chứng chỉ doanh nghiệp nên dùng không được ổn định và lâu dài. Nếu cần sử dụng lâu dài và đảm bảo thì hãy nâng cấp gói <a href='https://chungchip12.com' class='promo-link price-tag'>chứng chỉ cá nhân tại CHUNGCHIP12.COM</a> chỉ <span class='price-tag'>55.000đ</span> cho <span class='highlight'>1 năm sử dụng</span> ESign và Chứng Chỉ riêng biệt <span class='highlight'>không lo bị thu hồi</span>.",
    "version": "Phiên bản",
    "requirements": "Yêu cầu hệ thống",
    "rating": "XẾP HẠNG",
    "developer": "NHÀ PHÁT TRIỂN",
    "size": "KÍCH THƯỚC",
    "rating-label": "đánh giá",
    "info-details-title": "Thông tin",
    "notice-title": "Lưu ý quan trọng",
    "notice-description": "Vì đây là <span class='highlight-esign'>ESign</span> được ký bằng chứng chỉ doanh nghiệp nên thời gian dùng không xác định và nếu bạn muốn dùng ổn định và lâu dài hãy tham khảo qua <a href='https://chungchip12.com' class='notice-link' target='_blank'>chứng chỉ cá nhân tại hệ thống CHUNGCHIP12.COM</a>",
    "benefit-1": "Hỗ trợ cài đặt chứng chỉ và ESign, Gbox, Scarlet riêng biệt theo thiết bị",
    "benefit-2": "Thời gian cấp chứng chỉ 15 giây - 5 phút",
    "benefit-3": "Hỗ trợ tất cả thiết bị không lo Blacklist",
    "benefit-4": "Uy tín - Tự động - Bảo mật",
    "cta-button": "Đăng ký ngay - Chỉ từ 55.000đ/năm"
  },
  en: {
    title: "APPLE CERTIFICATE.",
    subtitle: "Website share ESign/Certificate on iPhone/iPad With Anti-Revoke",
    support: "Contact Support 24/7",
    website: "Automatic Certificate Sales Website",
    dns: "DNS for Anti-Revoke and Ads Block ",
    "ipa-sign": "Online IPA Signing",
    "ipa-store": "iPA MOD Apps Store",
    contact: "Contact me: ",
    copyright: "Copyright © 2022 CHUNGCHIP12.COM. All rights reserved.",
    beijing: "Beijing",
    "china-railway": "China Railway",
    "dtt-technology": "Dtt Technology",
    "tcl-household": "TCL Household",
    "wuling-power": "Wuling Power",
    "vietnamcert-01": "VietNamCert.01",
    "national-science-library": "National Science Library",
    "Nhân bản app": "Clone apps and unlock exclusive VIP features ",
    youtube: "Unlock Premium Mods",
    "mods-placeholder": "Mods Placeholder",
    "download-suffix": "successful installations",
    "search-placeholder": "Search for apps...",
    "no-results": "No apps found",
    "get-btn": "GET",
    "download-btn-text": "Access download link",
    "download-note": "After clicking 'GET', the app will be added to your library",
    "app-info-title": "Additional Information",
    "app-info-description": "This app is signed with an enterprise certificate, so it may not be stable and long-lasting. For long-term and guaranteed usage, upgrade to a <a href='https://chungchip12.com' class='promo-link price-tag'>personal certificate package at CHUNGCHIP12.COM</a> for only <span class='price-tag'>69,000 VND</span> for <span class='highlight'>1 year of usage</span>. Enjoy separate ESign and Certificate <span class='highlight'>without revocation worries</span>.",
    "version": "Version",
    "requirements": "System Requirements",
    "rating": "RATING",
    "developer": "DEVELOPER",
    "size": "SIZE",
    "rating-label": "ratings",
    "info-details-title": "Information",
    "notice-title": "Important Notice",
    "notice-description": "This <span class='highlight-esign'>ESign</span> is signed with an enterprise certificate, so the usage time is uncertain. If you want stable and long-term usage, please consider <a href='https://chungchip12.com' class='notice-link' target='_blank'>personal certificates at CHUNGCHIP12.COM</a>",
    "benefit-1": "Support for installing certificates and ESign, Gbox, Scarlet separately per device",
    "benefit-2": "Certificate issuance time: 15 seconds - 5 minutes",
    "benefit-3": "Support all devices, no Blacklist worries",
    "benefit-4": "Reliable - Automatic - Secure",
    "cta-button": "Register now - Only from 69,000 VND/year"
  }
};

const esignList = document.getElementById('esign-list');
const certList = document.getElementById('cert-list');
const trollstoreList = document.getElementById('trollstore-list');
const modsList = document.getElementById('mods-list');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('mods-search');
const noResults = document.getElementById('no-results');

const modal = document.getElementById('app-modal');
const modalClose = modal ? modal.querySelector('.modal-close') : null;
const modalTitle = document.getElementById('modal-app-title');
const modalCompany = document.getElementById('modal-app-company');
const modalIcon = document.getElementById('modal-app-icon');
const modalDeveloper = document.getElementById('modal-developer');
const modalSize = document.getElementById('modal-size');
const modalGetBtn = document.getElementById('modal-get-btn');
const modalVersion = document.getElementById('modal-version-text');
let currentItem = null;
let currentType = '';

// Alert elements
const modsTabAlert = document.getElementById('mods-tab-alert');
const modsDownloadAlert = document.getElementById('mods-download-alert');
const closeTabAlert = document.getElementById('close-tab-alert');
const closeDownloadAlert = document.getElementById('close-download-alert');

const DEFAULT_DEVELOPER = "𝐕𝐢𝐞𝐭𝐧𝐚𝐦 𝐒𝐢𝐠𝐧𝐢𝐧𝐠 𝐀𝐮𝐭𝐡𝐨𝐫𝐢𝐭𝐲";
const downloadCountCache = new Map();

async function getDownloadCount(itemId) {
  try {
    if (downloadCountCache.has(itemId)) return downloadCountCache.get(itemId);
    const docRef = doc(db, "downloads", itemId);
    const docSnap = await getDoc(docRef);
    let count = 0;
    if (docSnap.exists()) {
      count = docSnap.data().count;
    } else {
      await setDoc(docRef, { count: 3007 });
      count = 3007;
    }
    downloadCountCache.set(itemId, count);
    return count;
  } catch (error) {
    console.error(`Error getting count for ${itemId}:`, error);
    return 2292;
  }
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateRatingStars(rating) {
  const starsContainer = document.getElementById('modal-stars');
  if (!starsContainer) return;
  starsContainer.innerHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsContainer.innerHTML += '<i class="fas fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      starsContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsContainer.innerHTML += '<i class="far fa-star"></i>';
    }
  }
}

// Open modal for ESign only
async function openModal(item, type) {
  if (!modal) return;
  currentItem = item;
  currentType = type;
  
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalCompany) modalCompany.textContent = item.company;
  
  const downloadCount = await getDownloadCount(item.id);
  const formattedCount = formatNumber(downloadCount);
  const ratingCountElement = document.getElementById('modal-rating-count');
  if (ratingCountElement) {
    const currentLang = localStorage.getItem('language') || 'vi';
    ratingCountElement.textContent = `(${formattedCount} ${translations[currentLang]['rating-label']})`;
  }
  
  if (type === 'esign') {
    if (modalIcon) {
      modalIcon.src = 'https://vsacheat.com/img/esign.png';
      modalIcon.onerror = function() { this.src = 'https://cdn-icons-png.flaticon.com/512/3208/3208720.png'; };
    }
    if (modalDeveloper) modalDeveloper.textContent = DEFAULT_DEVELOPER;
    if (modalSize) modalSize.textContent = Math.random() > 0.5 ? '11.05 MB' : '8.92 MB';
    const ratingValue = (4.5 + Math.random() * 0.5).toFixed(1);
    updateRatingStars(parseFloat(ratingValue));
    if (modalVersion) modalVersion.textContent = '5.0.2';
  }
  
  const certificateNameElement = document.getElementById('modal-certificate-name');
  const footerTextElement = document.getElementById('modal-footer-text');
  if (certificateNameElement) certificateNameElement.textContent = `P12 Certificate : ${item.company}`;
  if (footerTextElement) footerTextElement.textContent = item.company;
  
  updateModalLanguage();
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentItem = null;
    currentType = '';
  }
}

// FIXED: Handle direct download without popup blocker
function handleDirectDownload(itemId, itemUrl) {
  // Mở URL ngay lập tức - đồng bộ để tránh bị chặn popup
  window.open(itemUrl, '_blank');
  
  // Cập nhật counter sau (không đồng bộ, không ảnh hưởng đến việc mở link)
  updateDownloadCounter(itemId);
}

// Hàm riêng để cập nhật counter
async function updateDownloadCounter(itemId) {
  try {
    const docRef = doc(db, "downloads", itemId);
    await updateDoc(docRef, { count: increment(1) });
    const currentCount = downloadCountCache.get(itemId) || 0;
    downloadCountCache.set(itemId, currentCount + 1);
    const counterElement = document.getElementById(`counter-${itemId}`);
    if (counterElement) {
      const currentLang = localStorage.getItem('language') || 'vi';
      const docSnap = await getDoc(docRef);
      const newCount = docSnap.exists() ? docSnap.data().count : 3008;
      counterElement.innerHTML = `<span style="font-weight: bold; color:#e63946;">${newCount}</span> ${translations[currentLang]['download-suffix']}`;
    }
  } catch (error) {
    console.error('Error updating counter:', error);
  }
}

function renderList(items, listElement, type) {
  if (!listElement) return;
  listElement.innerHTML = '';
  items.forEach(item => {
    const appCard = document.createElement('div');
    appCard.className = 'app-card';
    let iconHTML = '';
    if (type === 'esign') {
      iconHTML = '<img src="https://vsacheat.com/img/esign.png" alt="ESign Icon" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">';
    } else if (type === 'cert') {
      iconHTML = '<img src="https://vsacheat.com/img/ioscert/cert.webp" alt="Certificate Icon" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">';
    } else if (type === 'trollstore') {
      iconHTML = `<img src="${item.iconUrl}" alt="${item.title}" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">`;
    } else if (type === 'mods') {
      iconHTML = item.iconUrl ? `<img src="${item.iconUrl}" alt="${item.title}" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">` : '<i class="fas fa-cogs"></i>';
    }
    const badgeHTML = item.badge ? '<img src="https://vsacheat.com/img/ioscert/new-badge.png" alt="NEW" class="new-badge">' : '';
    const statusDotHTML = item.statusDot ? '<span class="status-dot"></span>' : '';
    appCard.innerHTML = `
      <div class="app-header">
        <div class="app-icon">
          ${iconHTML}
          ${badgeHTML}
        </div>
        <div class="app-content">
          <div class="app-title">
            ${item.title}
            ${statusDotHTML}
          </div>
          <div class="app-meta">
            <i class="fas fa-map-marker-alt"></i> ${item.company}
          </div>
          <div class="download-count">
            <i class="fas fa-user"></i>
            <span id="counter-${item.id}">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
      <button id="download-${item.id}" class="download-btn" data-type="${type}" title="Download"></button>
    `;
    listElement.appendChild(appCard);
    setupDownloadButton(`download-${item.id}`, item.id, item.url, type, item);
  });
}

async function updateCounter(linkId, elementId) {
  try {
    const count = await getDownloadCount(linkId);
    const counterElement = document.getElementById(elementId);
    if (counterElement) {
      const currentLang = localStorage.getItem('language') || 'vi';
      counterElement.innerHTML = `<span style="font-weight: bold; color:#e63946;">${count}</span> ${translations[currentLang]['download-suffix']}`;
    }
  } catch (error) {
    console.error(`Error updating counter for ${linkId}:`, error);
  }
}

function showModsDownloadAlert() {
  if (modsDownloadAlert) modsDownloadAlert.style.display = 'flex';
}
function hideModsDownloadAlert() {
  if (modsDownloadAlert) modsDownloadAlert.style.display = 'none';
}
function showModsTabAlert() {
  if (modsTabAlert) modsTabAlert.style.display = 'flex';
}
function hideModsTabAlert() {
  if (modsTabAlert) modsTabAlert.style.display = 'none';
}

// FIXED: Setup download button with proper handling
function setupDownloadButton(btnId, linkId, url, type, item) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'cert') {
      // Cert: Mở link trực tiếp - KHÔNG bị chặn popup
      handleDirectDownload(linkId, url);
    } else if (type === 'trollstore') {
      // TrollStore: Mở link trực tiếp như Cert
      handleDirectDownload(linkId, url);
    } else if (type === 'esign') {
      // ESign: Mở modal
      if (item) openModal(item, type);
    } else if (type === 'mods') {
      // Mods: Hiển thị alert VIP
      showModsDownloadAlert();
    }
  });
  
  updateCounter(linkId, `counter-${linkId}`);
}

function updateModalLanguage() {
  const currentLang = localStorage.getItem('language') || 'vi';
  if (modalGetBtn) modalGetBtn.textContent = translations[currentLang]['get-btn'];
  const noticeTitle = document.getElementById('modal-notice-title');
  const noticeDescription = document.getElementById('modal-notice-description');
  const benefitItems = document.querySelectorAll('.benefit-item span');
  const ctaButton = document.querySelector('.cta-button');
  if (noticeTitle) noticeTitle.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${translations[currentLang]['notice-title']}`;
  if (noticeDescription) noticeDescription.innerHTML = translations[currentLang]['notice-description'];
  if (benefitItems.length >= 4) {
    benefitItems[0].textContent = translations[currentLang]['benefit-1'];
    benefitItems[1].textContent = translations[currentLang]['benefit-2'];
    benefitItems[2].textContent = translations[currentLang]['benefit-3'];
    benefitItems[3].textContent = translations[currentLang]['benefit-4'];
  }
  if (ctaButton) {
    ctaButton.innerHTML = `<i class="fas fa-gem"></i> ${translations[currentLang]['cta-button']}`;
    ctaButton.href = 'https://chungchip12.com';
  }
  const infoDetailsTitle = document.getElementById('modal-info-details-title');
  if (infoDetailsTitle) infoDetailsTitle.textContent = translations[currentLang]['info-details-title'];
  const downloadNote = document.getElementById('modal-download-note');
  if (downloadNote) downloadNote.textContent = translations[currentLang]['download-note'];
}

function setLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key !== "esign" && key !== "cert" && key !== "mods" && !element.classList.contains('download-btn')) {
      if (key === 'contact') {
        const link = element.querySelector('a');
        if (link) element.innerHTML = translations[lang][key] + link.outerHTML;
        else element.textContent = translations[lang][key] || element.textContent;
      } else if (element.classList.contains('support-link')) {
        element.innerHTML = `<i class="fas fa-headset"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('website-link')) {
        element.innerHTML = `<i class="fas fa-globe"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('dns-link')) {
        element.innerHTML = `<i class="fas fa-shield-alt"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('ipa-sign-link')) {
        element.innerHTML = `<i class="fas fa-signature"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('ipa-store-link')) {
        element.innerHTML = `<i class="fas fa-box-open"></i> ${translations[lang][key] || element.textContent}`;
      } else {
        element.textContent = translations[lang][key] || element.textContent;
      }
    }
  });
  if (searchInput) searchInput.placeholder = translations[lang]['search-placeholder'];
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  document.documentElement.lang = lang;
  localStorage.setItem('language', lang);
  document.querySelectorAll('.download-count span[id^="counter-"]').forEach(counter => {
    const linkId = counter.id.replace('counter-', '');
    updateCounter(linkId, counter.id);
  });
  if (modal && modal.style.display === 'block') updateModalLanguage();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('theme', newTheme);
  updateParticlesTheme();
}

function showList(type) {
  if (esignList) esignList.classList.toggle('hidden', type !== 'esign');
  if (certList) certList.classList.toggle('hidden', type !== 'cert');
  if (trollstoreList) trollstoreList.classList.toggle('hidden', type !== 'trollstore');
  if (modsList) modsList.classList.toggle('hidden', type !== 'mods');
  if (searchContainer) searchContainer.classList.toggle('hidden', type !== 'mods');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${type}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (type === 'mods' && searchInput) {
    searchInput.value = '';
    filterMods();
    showModsTabAlert();
  }
}

function filterMods() {
  if (!searchInput || !modsList) return;
  const input = searchInput.value.toLowerCase().trim();
  const cards = modsList.querySelectorAll('.app-card');
  let visibleCount = 0;
  cards.forEach(card => {
    const titleElement = card.querySelector('.app-title');
    if (!titleElement) return;
    const title = titleElement.textContent.toLowerCase();
    if (input === '' || title.includes(input)) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  if (noResults) noResults.classList.toggle('hidden', visibleCount > 0);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function applySavedLanguage() {
  const savedLang = localStorage.getItem('language') || 'vi';
  setLanguage(savedLang);
}

let lastScrollTop = 0;
const header = document.querySelector('.top-header');
function handleScroll() {
  if (!header) return;
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop && scrollTop > 200) {
    header.classList.add('hidden');
  } else if (scrollTop < lastScrollTop && scrollTop <= 200) {
    header.classList.remove('hidden');
  }
  lastScrollTop = scrollTop;
}

function handleModalGetButton() {
  if (!modalGetBtn) return;
  modalGetBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!currentItem) return;
    const downloadUrl = currentItem.url;
    if (downloadUrl) {
      // Mở link ngay lập tức
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      // Cập nhật counter
      updateDownloadCounter(currentItem.id);
      closeModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (modal) modal.style.display = 'none';
  if (modsTabAlert) modsTabAlert.style.display = 'none';
  if (modsDownloadAlert) modsDownloadAlert.style.display = 'none';
  
  applySavedTheme();
  applySavedLanguage();
  initParticles();
  
  if (esignList && esignItems) renderList(esignItems, esignList, 'esign');
  if (certList && certItems) renderList(certItems, certList, 'cert');
  if (trollstoreList && trollstoreItems) renderList(trollstoreItems, trollstoreList, 'trollstore');
  if (modsList && modsItems) renderList(modsItems, modsList, 'mods');
  
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  handleModalGetButton();
  
  // Close alert buttons
  if (closeTabAlert) closeTabAlert.addEventListener('click', hideModsTabAlert);
  if (closeDownloadAlert) closeDownloadAlert.addEventListener('click', hideModsDownloadAlert);
  
  if (modsTabAlert) {
    modsTabAlert.addEventListener('click', e => { if (e.target === modsTabAlert) hideModsTabAlert(); });
  }
  if (modsDownloadAlert) {
    modsDownloadAlert.addEventListener('click', e => { if (e.target === modsDownloadAlert) hideModsDownloadAlert(); });
  }
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') closeModal();
    if (e.key === 'Escape' && modsTabAlert && modsTabAlert.style.display === 'flex') hideModsTabAlert();
    if (e.key === 'Escape' && modsDownloadAlert && modsDownloadAlert.style.display === 'flex') hideModsDownloadAlert();
  });
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  
  const trollstoreTabBtn = document.querySelector('.tab-btn[data-tab="trollstore"]');
  const modsTabBtn = document.querySelector('.tab-btn[data-tab="mods"]');
  const esignTabBtn = document.querySelector('.tab-btn[data-tab="esign"]');
  const certTabBtn = document.querySelector('.tab-btn[data-tab="cert"]');
  
  if (trollstoreTabBtn) trollstoreTabBtn.addEventListener('click', () => showList('trollstore'));
  if (modsTabBtn) modsTabBtn.addEventListener('click', () => showList('mods'));
  if (esignTabBtn) esignTabBtn.addEventListener('click', () => showList('esign'));
  if (certTabBtn) certTabBtn.addEventListener('click', () => showList('cert'));
  
  if (searchInput) searchInput.addEventListener('input', filterMods);
  window.addEventListener('scroll', handleScroll);
});