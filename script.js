/* ===================================================
   PEMBUKUAN DIMSUM - by Farrel Aulia Irfealdo
   Script v3.3 - Custom Filter UI + Animations + Bug Fixes
=================================================== */

window.__PD_JS_OK = true; // penanda script.js termuat (untuk detektor error)

// ===== DATA MENU =====
const menuData = {
    kopi: [
        { nama: "Kopi Slow", harga: 8000, pcs: 1 },
        { nama: "Es Kopi", harga: 10000, pcs: 1 },
        { nama: "Kopi Susu", harga: 12000, pcs: 1 },
        { nama: "Es Kopi Susu", harga: 15000, pcs: 1 },
        { nama: "Es Kopi Milo", harga: 17000, pcs: 1 },
        { nama: "Es Kopsus Aren", harga: 17000, pcs: 1 }
    ],
    slowktail: [
        { nama: "Red Velvet", harga: 12000, pcs: 1 },
        { nama: "Milo", harga: 12000, pcs: 1 },
        { nama: "Coklat", harga: 12000, pcs: 1 },
        { nama: "Taro", harga: 12000, pcs: 1 },
        { nama: "Matcha", harga: 12000, pcs: 1 },
        { nama: "Cappuccino", harga: 12000, pcs: 1 },
        { nama: "Lava Lady", harga: 12000, pcs: 1 },
        { nama: "Vanilla", harga: 12000, pcs: 1 },
        { nama: "Tiramisu", harga: 12000, pcs: 1 },
        { nama: "Coco Hazel", harga: 12000, pcs: 1 }
    ],
    tea: [
        { nama: "Lemon Tea", harga: 8000, pcs: 1 },
        { nama: "Leci Tea", harga: 10000, pcs: 1 },
        { nama: "Teh Susu", harga: 8000, pcs: 1 },
        { nama: "Teh Es", harga: 7000, pcs: 1 },
        { nama: "Peach Tea", harga: 10000, pcs: 1 },
        { nama: "Teh Telang", harga: 10000, pcs: 1 }
    ],
    everydays: [
        { nama: "Blue Sky", harga: 12000, pcs: 1 },
        { nama: "Red Splash", harga: 12000, pcs: 1 },
        { nama: "Darkblue", harga: 12000, pcs: 1 },
        { nama: "Extrajos Susu", harga: 8000, pcs: 1 },
        { nama: "Kukubima Susu", harga: 8000, pcs: 1 },
        { nama: "Nutrisari Susu", harga: 8000, pcs: 1 }
    ],
    snack: [
        { nama: "Risol", harga: 3000, pcs: 1 },
        { nama: "Cireng Kuah", harga: 15000, pcs: 1 },
        { nama: "Cireng Saos", harga: 10000, pcs: 1 },
        { nama: "Mie Goreng", harga: 13000, pcs: 1 },
        { nama: "Mie Rebus", harga: 11000, pcs: 1 },
        { nama: "Es Kosong", harga: 2000, pcs: 1 }
    ]
};

// ===== BONUS KERETA API TIERS =====
const BONUS_TIERS = [
    { min: 1100000, max: Infinity, bonus: 35000, label: '🔥 Omset 1,1 Juta+', color: '#7C3AED' },
    { min: 1000000, max: 1099999,  bonus: 30000, label: '💜 Omset 1 Juta+',   color: '#A855F7' },
    { min: 900000,  max: 999999,   bonus: 25000, label: '🟪 Omset 900K+',     color: '#DB2777' },
    { min: 800000,  max: 899999,   bonus: 20000, label: '🟣 Omset 800K+',     color: '#E11D48' },
    { min: 600000,  max: 799999,   bonus: 15000, label: '🟢 Omset 600K+',     color: '#059669' },
    { min: 430000,  max: 599999,   bonus: 10000, label: '🔵 Omset 430K+',     color: '#2563EB' },
    { min: 390000,  max: 429999,   bonus: 5000,  label: '🟡 Omset 390K+',     color: '#D97706' },
    { min: 0,       max: 389999,   bonus: 0,     label: '⚪ Omset < 390K',    color: '#6B7280' },
];

let penjualanData = [], penjualanCounter = 0;
let stockData = [], stockCounter = 0;
let transferHistoryData = [];
let transferDari = 'Mutiara';
let transferKe = 'Mentai';
const TRANSFER_META = {
    Mutiara: { icon: '\ud83e\udd5f', warna: '#22C55E' },
    Mentai:  { icon: '\u2b50', warna: '#F4622A' }
};
let kasData = [], kasCounter = 0, kasSaldo = 0;
let currentTab = 'input';
let calcDisplayValue = '0', calcPreviousValue = null, calcOperator = null;
let calcWaitingForOperand = false, calcHistoryArr = [], calcExprStr = '';
let saveTimeout = null;

// ===== TOAST =====
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    document.getElementById('toastIcon').textContent = icons[type] || 'ℹ️';
    document.getElementById('toastMsg').textContent = msg;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== MODAL =====
function customConfirm(msg, title = 'Konfirmasi', icon = '⚠️') {
    return new Promise(resolve => {
        const overlay = document.getElementById('modalOverlay');
        document.getElementById('modalMsg').textContent = msg;
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalIcon').textContent = icon;
        overlay.classList.add('active');
        const cleanup = (r) => { overlay.classList.remove('active'); resolve(r); };
        document.getElementById('modalConfirm').onclick = () => cleanup(true);
        document.getElementById('modalCancel').onclick = () => cleanup(false);
        overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
    });
}

// ===== FORMAT =====
function formatRupiah(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}
function formatInputNumber(input) {
    let val = input.value.replace(/\D/g, '');
    input.value = val ? parseInt(val).toLocaleString('id-ID') : '';
}


// ===== DATE HELPER (gunakan tanggal LOKAL, bukan UTC) =====
function getTodayLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
// ===== DATE & THEME =====
function updateDate() {
    const el = document.getElementById('currentDate');
    if (el) el.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function loadTheme() {
    document.body.classList.add('dark');
    loadAccentTheme();
}

// ===== TAB =====
function switchTab(name, btn) {
    currentTab = name;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    (btn || document.querySelector(`[data-tab="${name}"]`))?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab' + name.charAt(0).toUpperCase() + name.slice(1))?.classList.add('active');
    if (name === 'laporan') updateLaporan();
    if (name === 'stock') { updateStockDisplay(); updateTransferHistoryDisplay(); }
    if (name === 'kas') updateKasDisplay();
    if (name === 'input') { }
    if (name === 'history') { updateHistoryDisplay(); }
}

// ===== CUSTOM DROPDOWN =====
function toggleCustomSelect(type) {
    const dropdown = document.getElementById(type + 'Dropdown');
    const arrow = document.getElementById(type + 'Arrow');
    const trigger = document.getElementById(type + 'Trigger');
    if (trigger.classList.contains('csd-disabled')) return;
    const isOpen = dropdown.style.display !== 'none';
    // Close all dropdowns first
    closeAllDropdowns();
    if (!isOpen) {
        dropdown.style.display = 'block';
        arrow.textContent = '▴';
        trigger.classList.add('csd-open');
    }
}
function closeAllDropdowns() {
    ['kategori','menu','stockKategori'].forEach(type => {
        const d = document.getElementById(type + 'Dropdown');
        const a = document.getElementById(type + 'Arrow');
        const t = document.getElementById(type + 'Trigger');
        if (d) d.style.display = 'none';
        if (a) a.textContent = '▾';
        if (t) t.classList.remove('csd-open');
    });
}
function selectSimple(id, value, label) {
    document.getElementById(id + 'Label').textContent = label;
    document.getElementById(id).value = value;
    closeAllDropdowns();
    // Mark active
    document.querySelectorAll('#' + id + 'Dropdown .csd-item').forEach(el => {
        const onclickAttr = el.getAttribute('onclick') || '';
        el.classList.toggle('csd-active', value !== '' && onclickAttr.includes("'" + value + "'"));
    });
    // Reset stock form if needed
    if (id === 'stockKategori') {
        document.querySelectorAll('#stockKategoriDropdown .csd-item').forEach(el => {
            el.classList.toggle('csd-active', el.getAttribute('onclick')?.includes("'" + value + "'"));
        });
    }
}
function selectKategori(value, label) {
    document.getElementById('kategoriLabel').textContent = label;
    document.getElementById('kategori').value = value;
    closeAllDropdowns();
    // Mark active item
    document.querySelectorAll('#kategoriDropdown .csd-item').forEach(el => {
        el.classList.toggle('csd-active', el.textContent.trim().includes(label.replace(/^[\uD800-\uDFFF\u2600-\u27FF]\s*/,'')));
    });
    updateMenu();
}
function selectMenu(value, label, idx) {
    document.getElementById('menuLabel').textContent = label;
    document.getElementById('menu').value = idx;
    closeAllDropdowns();
    document.querySelectorAll('#menuDropdown .csd-item').forEach(el => el.classList.remove('csd-active'));
    document.querySelectorAll('#menuDropdown .csd-item')[idx + 1]?.classList.add('csd-active');
    updateHarga();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-select-wrap')) closeAllDropdowns();
});


function updateMenu() {
    const kategori = document.getElementById('kategori').value;
    const menuSel = document.getElementById('menu');
    const menuDropdown = document.getElementById('menuDropdown');
    const menuTrigger = document.getElementById('menuTrigger');
    const menuLabel = document.getElementById('menuLabel');
    document.getElementById('harga').value = '';
    document.getElementById('previewTotal').style.display = 'none';
    menuSel.innerHTML = '<option value="">-- Pilih Menu --</option>';
    menuDropdown.innerHTML = '';
    menuLabel.textContent = '-- Pilih Menu --';

    if (kategori && menuData[kategori]) {
        menuSel.disabled = false;
        menuTrigger.classList.remove('csd-disabled');

        // Placeholder item
        const placeholder = document.createElement('div');
        placeholder.className = 'csd-item csd-placeholder';
        placeholder.textContent = '-- Pilih Menu --';
        placeholder.onclick = () => { selectMenu('', '-- Pilih Menu --', -1); };
        menuDropdown.appendChild(placeholder);

        menuData[kategori].forEach((item, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${item.nama}  ·  ${formatRupiah(item.harga)}`;
            menuSel.appendChild(opt);

            const div = document.createElement('div');
            div.className = 'csd-item';
            div.innerHTML = `<span class="csd-menu-name">${item.nama}</span><span class="csd-menu-price">${formatRupiah(item.harga)}</span>`;
            div.onclick = () => selectMenu(i, item.nama + ' · ' + formatRupiah(item.harga), i);
            menuDropdown.appendChild(div);
        });

        // Auto-pilih jika hanya 1 menu
        if (menuData[kategori].length === 1) {
            const item = menuData[kategori][0];
            menuSel.value = '0';
            selectMenu(0, item.nama + ' · ' + formatRupiah(item.harga), 0);
        }
    } else {
        menuSel.disabled = true;
        menuTrigger.classList.add('csd-disabled');
    }
}

function updateHarga() {
    const kat = document.getElementById('kategori').value;
    const idx = document.getElementById('menu').value;
    const hargaEl = document.getElementById('harga');
    hargaEl.value = '';
    document.getElementById('previewTotal').style.display = 'none';
    if (kat && idx !== '' && menuData[kat]) {
        hargaEl.value = formatRupiah(menuData[kat][idx].harga);
        updatePreviewTotal();
        // UX: Langsung fokus ke jumlah setelah pilih menu
        const jumlahEl = document.getElementById('jumlah');
        jumlahEl.focus();
        jumlahEl.select();
    }
}

function updatePreviewTotal() {
    const kat = document.getElementById('kategori').value;
    const idx = document.getElementById('menu').value;
    const jumlah = parseInt(document.getElementById('jumlah').value) || 0;
    const previewEl = document.getElementById('previewTotal');
    if (kat && idx !== '' && jumlah > 0 && menuData[kat]) {
        document.getElementById('previewValue').textContent = formatRupiah(menuData[kat][idx].harga * jumlah);
        previewEl.style.display = 'flex';
    } else {
        previewEl.style.display = 'none';
    }
}

// UX: Tombol jumlah cepat
function setJumlahQuick(n) {
    document.getElementById('jumlah').value = n;
    document.getElementById('jumlah').focus();
    updatePreviewTotal();
}

// UX: Enter di jumlah langsung simpan
function handleJumlahKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); tambahPenjualan(); }
}

// ===== PENCATATAN PENJUALAN (dipakai form Input & Kasir) =====
function _recordSale(menu, kat, jumlah) {
    const existing = penjualanData.findIndex(p => p.nama === menu.nama);
    if (existing >= 0) {
        penjualanData[existing].jumlah += jumlah;
        penjualanData[existing].totalHarga = menu.harga * penjualanData[existing].jumlah;
        penjualanData[existing].totalPcs = menu.pcs * penjualanData[existing].jumlah;
    } else {
        penjualanData.push({ id: ++penjualanCounter, nama: menu.nama, kategori: kat, harga: menu.harga, pcs: menu.pcs, jumlah, totalHarga: menu.harga * jumlah, totalPcs: menu.pcs * jumlah });
    }
    updateStockTerjual(menu.nama, menu.pcs * jumlah, kat);
}

// ===== TAMBAH PENJUALAN =====
function tambahPenjualan() {
    const kat = document.getElementById('kategori').value;
    const idx = document.getElementById('menu').value;
    const jumlahInput = document.getElementById('jumlah');
    const jumlah = parseInt(jumlahInput.value);

    if (!kat || idx === '') return showToast('Pilih menu terlebih dahulu!', 'error');
    if (!jumlah || jumlah <= 0 || isNaN(jumlah)) { jumlahInput.focus(); return showToast('Masukkan jumlah yang valid!', 'error'); }

    const menu = menuData[kat][idx];
    _recordSale(menu, kat, jumlah);
    scheduleSave();
    updateQuickSummary();
    updateStockDisplay();
    cekBonusTierNotif();

    // UX: Flash feedback tombol
    const btn = document.getElementById('btnCatat');
    if (btn) { btn.textContent = '✅ Tersimpan!'; btn.style.background = 'linear-gradient(135deg,#10B981,#059669)'; setTimeout(() => { btn.textContent = '✅ CATAT PENJUALAN'; btn.style.background = ''; }, 1200); }

    document.getElementById('kategori').value = '';
    document.getElementById('menu').innerHTML = '<option value="">-- Pilih Menu --</option>';
    document.getElementById('menu').disabled = true;
    document.getElementById('harga').value = '';
    document.getElementById('previewTotal').style.display = 'none';
    jumlahInput.value = '';
    // Reset custom dropdowns
    document.getElementById('kategoriLabel').textContent = '-- Pilih Kategori --';
    document.getElementById('menuLabel').textContent = '-- Pilih Menu --';
    document.getElementById('menuDropdown').innerHTML = '';
    document.getElementById('menuTrigger').classList.add('csd-disabled');
    document.querySelectorAll('.csd-item').forEach(el => el.classList.remove('csd-active'));
    document.getElementById('kategori').focus();

    showToast(`✅ +${jumlah} ${menu.pcs === 1 ? 'pcs' : 'porsi'} ${menu.nama.split(' ').slice(0,3).join(' ')}`, 'success');
}

// ===== QUICK SUMMARY =====
function updateQuickSummary() {
    const el = document.getElementById('quickSummary');
    const qtEl = document.getElementById('quickTotal');
    const totalRp = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
    const totalPcs = penjualanData.reduce((s, i) => s + i.totalPcs, 0);
    const totalItems = penjualanData.reduce((s, i) => s + i.jumlah, 0);

    if (penjualanData.length === 0) {
        el.style.display = 'none';
        updateMiniStats(0, 0);
        return;
    }
    el.style.display = 'flex';
    qtEl.textContent = `${penjualanData.length} menu · ${totalItems} item · ${formatRupiah(totalRp)}`;
    qtEl.classList.add('pulse');
    setTimeout(() => qtEl.classList.remove('pulse'), 500);
    // Selalu update header stats
    updateMiniStats(totalRp, totalPcs);
}

// ===== LAPORAN =====
function updateLaporan() {
    const empty = document.getElementById('emptyState');
    const section = document.getElementById('laporanSection');
    if (penjualanData.length === 0) { empty.style.display = 'block'; section.style.display = 'none'; return; }
    empty.style.display = 'none'; section.style.display = 'block';

    const list = document.getElementById('laporanList');
    list.innerHTML = '';
    // UX: Sort terbesar dulu
    [...penjualanData].sort((a, b) => b.totalHarga - a.totalHarga).forEach(item => {
        const div = document.createElement('div');
        const katLabel = { kopi: '☕ Kopi', slowktail: '🥤 Slowktail', tea: '🍵 Tea', everydays: '🧋 Everydays', snack: '🍟 Snack & Makanan' }[item.kategori] || '';
        div.className = 'laporan-item';
        div.innerHTML = `
            <div class="li-header">
                <div class="li-name">${item.nama}</div>
                <button class="btn-remove" onclick="hapusPenjualan(${item.id})">×</button>
            </div>
            <div class="li-kat-badge li-kat-${item.kategori}">${katLabel}</div>
            <div class="li-detail">${item.jumlah} ${item.pcs === 1 ? 'pcs' : 'porsi'} × ${formatRupiah(item.harga)}</div>
            <div class="li-total">${formatRupiah(item.totalHarga)} · ${item.totalPcs} pcs</div>
        `;
        list.appendChild(div);
    });
    updateSummary();
    updateBestSeller();
}

// Bulatkan persentase agar totalnya pas 100% (largest remainder method)
function _pctTo100(values, total) {
    if (!total || total <= 0) return values.map(() => 0);
    const raw = values.map(v => v / total * 100);
    const out = raw.map(Math.floor);
    const sisa = 100 - out.reduce((a, b) => a + b, 0);
    const urut = raw.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
    for (let k = 0; k < sisa && k < urut.length; k++) out[urut[k].i]++;
    return out;
}

function getKategoriSummary() {
    return {
        mentaiItems: penjualanData.filter(i => i.kategori === 'kopi'),
        gorengItems: penjualanData.filter(i => i.kategori === 'slowktail'),
        kukusItems: penjualanData.filter(i => ['tea','everydays','snack'].includes(i.kategori))
    };
}

function updateSummary() {
    const totalPorsi = penjualanData.reduce((s, i) => s + i.totalPcs, 0);
    const totalPendapatan = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
    const { mentaiItems, gorengItems, kukusItems } = getKategoriSummary();
    const sum = (arr, key) => arr.reduce((s, i) => s + i[key], 0);

    const mentaiRp = sum(mentaiItems, 'totalHarga');
    const gorengRp = sum(gorengItems, 'totalHarga');
    const kukusRp  = sum(kukusItems,  'totalHarga');
    const mentaiPcs = sum(mentaiItems, 'totalPcs');
    const gorengPcs = sum(gorengItems, 'totalPcs');
    const kukusPcs  = sum(kukusItems,  'totalPcs');

    document.getElementById('totalPorsi').textContent = totalPorsi + ' pcs';
    document.getElementById('totalPendapatan').textContent = formatRupiah(totalPendapatan);
    document.getElementById('totalMentai').innerHTML = `${formatRupiah(mentaiRp)} <small style="color:var(--text3)">(${mentaiPcs} pcs)</small>`;
    document.getElementById('totalGoreng').innerHTML = `${formatRupiah(gorengRp)} <small style="color:var(--text3)">(${gorengPcs} pcs)</small>`;
    document.getElementById('totalKukus').innerHTML  = `${formatRupiah(kukusRp)}  <small style="color:var(--text3)">(${kukusPcs} pcs)</small>`;

    // Progress bars & pct
    if (totalPendapatan > 0) {
        const [mp, gp, kp] = _pctTo100([mentaiRp, gorengRp, kukusRp], totalPendapatan);
        const mentaiEl = document.getElementById('mentaiPct');
        const gorengEl = document.getElementById('gorengPct');
        const mutiaraEl = document.getElementById('mutiaraPct');
        if (mentaiEl)  mentaiEl.textContent  = mp + '%';
        if (gorengEl)  gorengEl.textContent  = gp + '%';
        if (mutiaraEl) mutiaraEl.textContent = kp + '%';
        const mb = document.getElementById('mentaiBar');
        const gb = document.getElementById('gorengBar');
        const kb = document.getElementById('mutiaraBar');
        if (mb) mb.style.width = mp + '%';
        if (gb) gb.style.width = gp + '%';
        if (kb) kb.style.width = kp + '%';
        // Donut chart
        renderDonut(mp, gp, kp);
    }

    updateMiniStats(totalPendapatan, totalPorsi);
    updateClosingSection();
}

function renderDonut(mp, gp, kp) {
    const svg = document.getElementById('donutSvg');
    const wrap = document.getElementById('donutWrap');
    if (!svg || !wrap) return;
    if (mp + gp + kp === 0) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';

    const cx = 36, cy = 36, r = 28, stroke = 10;
    const circ = 2 * Math.PI * r;
    const colors = [
        { pct: mp, color: '#F4622A' },
        { pct: gp, color: '#EAB308' },
        { pct: kp, color: '#22C55E' }
    ];

    let offset = 0;
    let paths = '';
    // Start from top (-90deg = -circ/4 offset)
    let dashOffset = circ / 4;
    colors.forEach(({ pct, color }) => {
        const dash = (pct / 100) * circ;
        const gap  = circ - dash;
        paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset + dashOffset}" style="transition:stroke-dasharray 0.5s ease"/>`;
        offset += dash;
    });
    svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface3)" stroke-width="${stroke}"/>` + paths;

    const m = document.getElementById('donutMentaiPct');
    const g = document.getElementById('donutGorengPct');
    const k = document.getElementById('donutMutiaraPct');
    if (m) m.textContent = mp + '%';
    if (g) g.textContent = gp + '%';
    if (k) k.textContent = kp + '%';
}

function updateMiniStats(totalPendapatan, totalPorsi) {
    const elRp = document.getElementById('miniStatsPendapatan');
    const elPcs = document.getElementById('miniStatsPcs');
    const el = document.getElementById('miniStats');
    if (!el) return;
    if (totalPendapatan > 0 || penjualanData.length > 0) {
        el.style.display = 'flex';
        if (elRp) elRp.textContent = formatRupiah(totalPendapatan);
        if (elPcs) elPcs.textContent = totalPorsi + ' pcs';
    } else {
        el.style.display = 'none';
    }
}

function updateBestSeller() {
    const banner = document.getElementById('bestSellerBanner');
    if (penjualanData.length === 0) { banner.style.display = 'none'; return; }
    const best = penjualanData.reduce((max, i) => i.jumlah > max.jumlah ? i : max);
    banner.style.display = 'flex';
    document.getElementById('bestSellerName').textContent = best.nama;
    document.getElementById('bestSellerCount').textContent = `${best.jumlah} ${best.pcs === 1 ? 'pcs' : 'porsi'} · ${best.totalPcs} pcs`;
}

function simpanDariLaporan() {
    switchTab('history', document.querySelector('[data-tab="history"]'));
    setTimeout(() => simpanHariIni(), 300);
}

function hapusPenjualan(id) {
    customConfirm('Hapus item ini dari laporan?', 'Hapus Item', '🗑️').then(ok => {
        if (!ok) return;
        const item = penjualanData.find(p => p.id === id);
        if (item) {
            const stockKey = {}[item.kategori];
            const s = stockKey ? stockData.find(st => st.nama === stockKey) : null;
            if (s) { s.terjual = Math.max(0, s.terjual - item.totalPcs); s.sisa = Math.max(0, s.stockAwal - s.terjual); saveStockToStorage(); updateStockDisplay(); }
        }
        penjualanData = penjualanData.filter(p => p.id !== id);
        scheduleSave(); updateLaporan(); updateQuickSummary(); updateStockDisplay();
        showToast('Item dihapus & stock dikembalikan', 'info');
    });
}

// ===== COPY LAPORAN =====
function copyLaporan() {
    if (penjualanData.length === 0) return showToast('Belum ada data!', 'error');
    const tanggal = document.getElementById('currentDate').textContent;
    const line = '='.repeat(38);
    const sorted = [...penjualanData].sort((a,b) => b.totalHarga - a.totalHarga);
    let txt = `📊 LAPORAN PENJUALAN DIMSUM\n${tanggal}\n${line}\n\n`;
    sorted.forEach(i => { txt += `${i.nama}\n${i.jumlah} ${i.pcs === 1 ? 'pcs' : 'porsi'} × ${formatRupiah(i.harga)} = ${formatRupiah(i.totalHarga)}\n(${i.totalPcs} pcs)\n\n`; });

    const totalPorsi = penjualanData.reduce((s, i) => s + i.totalPcs, 0);
    const totalPendapatan = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
    const { mentaiItems, gorengItems, kukusItems } = getKategoriSummary();
    const sum = (arr, key) => arr.reduce((s, i) => s + i[key], 0);

    txt += `${line}\nTotal Porsi Terjual : ${totalPorsi} pcs\n\nBREAKDOWN PRODUK:\n`;
    txt += `☕ Kopi       : ${formatRupiah(sum(mentaiItems,'totalHarga'))} (${sum(mentaiItems,'totalPcs')} pcs)\n`;
    txt += `🥤 Slowktail  : ${formatRupiah(sum(gorengItems,'totalHarga'))} (${sum(gorengItems,'totalPcs')} pcs)\n`;
    txt += `🧋 Lainnya    : ${formatRupiah(sum(kukusItems,'totalHarga'))} (${sum(kukusItems,'totalPcs')} pcs)\n`;
    txt += `\n💰 Total Pendapatan : ${formatRupiah(totalPendapatan)}\n`;

    const gf = parseInt((document.getElementById('closingGoFood').value || '0').replace(/\D/g,'')) || 0;
    const qr = parseInt((document.getElementById('closingQris').value || '0').replace(/\D/g,'')) || 0;
    if (kasSaldo > 0 || gf > 0 || qr > 0) {
        txt += `\n${line}\n🏦 CLOSING KEUANGAN\n${line}\n`;
        txt += `💰 Saldo Kas    : ${formatRupiah(kasSaldo)}\n💵 Pendapatan   : ${formatRupiah(totalPendapatan)}\n`;
        if (gf) txt += `🛵 GoFood/Grab  : -${formatRupiah(gf)}\n`;
        if (qr) txt += `💳 QRIS/E-Wallet: -${formatRupiah(qr)}\n`;
        txt += `${'─'.repeat(38)}\n🏦 Total Uang   : ${formatRupiah(kasSaldo + totalPendapatan)}\n💵 Uang di Tangan: ${formatRupiah(kasSaldo + totalPendapatan - gf - qr)}\n`;
    }

    navigator.clipboard ? navigator.clipboard.writeText(txt).then(() => showToast('📋 Laporan berhasil di-copy!', 'success')).catch(() => fallbackCopy(txt)) : fallbackCopy(txt);
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('Laporan berhasil di-copy!', 'success'); } catch { showToast('Gagal copy laporan', 'error'); }
    document.body.removeChild(ta);
}

function resetLaporan() {
    if (penjualanData.length === 0) return showToast('Belum ada data!', 'error');
    customConfirm('Hapus semua data penjualan & kas hari ini?\n(Gaji TIDAK ikut reset)', 'Reset Harian', '🗑️').then(ok => {
        if (!ok) return;
        // Kembalikan stock terjual berdasarkan item penjualan yang dihapus
        const keyMap = {};
        penjualanData.forEach(item => {
            const key = keyMap[item.kategori];
            const s = key ? stockData.find(st => st.nama === key) : null;
            if (s) { s.terjual = Math.max(0, s.terjual - item.totalPcs); s.sisa = Math.max(0, s.stockAwal - s.terjual); }
        });
        penjualanData = []; penjualanCounter = 0; clearPenjualanStorage();
        saveStockToStorage();
        kasData = []; kasCounter = 0; kasSaldo = 0; localStorage.removeItem('dimsumKas');
        document.getElementById('closingGoFood').value = '';
        document.getElementById('closingQris').value = '';
        localStorage.removeItem('dimsumClosing');
        updateLaporan(); updateQuickSummary(); updateStockDisplay(); updateKasDisplay();
        updateMiniStats(0, 0);
        showToast('Data penjualan & kas direset. Stock tidak berubah ✅', 'info');
    });
}

// ===== CLOSING =====
function updateClosingSection() {
    const section = document.getElementById('closingSection');
    const totalPendapatan = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
    if (totalPendapatan <= 0 && kasSaldo <= 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';

    const gf = parseInt((document.getElementById('closingGoFood').value || '0').replace(/\D/g,'')) || 0;
    const qr = parseInt((document.getElementById('closingQris').value || '0').replace(/\D/g,'')) || 0;
    const total = kasSaldo + totalPendapatan;
    const cash = total - gf - qr;

    document.getElementById('closingSaldoKas').textContent = formatRupiah(kasSaldo);
    document.getElementById('closingPendapatan').textContent = formatRupiah(totalPendapatan);
    document.getElementById('closingGoFoodDisplay').textContent = '-' + formatRupiah(gf);
    document.getElementById('closingQrisDisplay').textContent = '-' + formatRupiah(qr);
    document.getElementById('closingTotal').textContent = formatRupiah(total);

    // FIX #3: Warning jika negatif
    const cashHandEl = document.getElementById('closingCashHand');
    const cashBox = document.querySelector('.cash-hand-box');
    cashHandEl.textContent = formatRupiah(cash);
    if (cash < 0) {
        cashBox.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
        if (!document.getElementById('closingNegativeWarn')) {
            const warn = document.createElement('div');
            warn.id = 'closingNegativeWarn';
            warn.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.9);margin-top:6px;font-weight:700;';
            warn.textContent = '⚠️ GoFood/QRIS melebihi total uang!';
            cashBox.appendChild(warn);
        }
    } else {
        cashBox.style.background = '';
        document.getElementById('closingNegativeWarn')?.remove();
    }
}
function updateClosingCalculation() { updateClosingSection(); saveClosingInput(); }
function saveClosingInput() {
    try { localStorage.setItem('dimsumClosing', JSON.stringify({ goFood: document.getElementById('closingGoFood').value, qris: document.getElementById('closingQris').value })); } catch {}
}
function loadClosingInput() {
    try {
        const d = JSON.parse(localStorage.getItem('dimsumClosing') || '{}');
        if (d.goFood) document.getElementById('closingGoFood').value = d.goFood;
        if (d.qris) document.getElementById('closingQris').value = d.qris;
    } catch {}
}

// ===== STOCK =====
function showStockForm() { document.getElementById('stockMainSection').style.display = 'none'; document.getElementById('stockForm').style.display = 'block'; document.getElementById('stockKategori').focus(); }
function batalStock() { document.getElementById('stockMainSection').style.display = 'block'; document.getElementById('stockForm').style.display = 'none'; resetStockForm(); const lbl = document.getElementById('stockKategoriLabel'); if (lbl) lbl.textContent = '-- Pilih Kategori --'; }
function resetStockForm() {
    ['stockKategori','stockJumlahKotak','stockPcsPerKotak','stockTotalPcs','stockPcsLangsung'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    // Reset mode ke Kotak
    const modeKotak = document.querySelector('input[name="stockInputMode"][value="kotak"]');
    if (modeKotak) { modeKotak.checked = true; toggleStockInputMode(); }
}
function toggleStockInputMode() {
    const mode = document.querySelector('input[name="stockInputMode"]:checked')?.value || 'kotak';
    document.getElementById('stockKotakSection').style.display = mode === 'kotak' ? 'block' : 'none';
    document.getElementById('stockPcsLangsungSection').style.display = mode === 'pcs' ? 'block' : 'none';
}
function hitungStockTotal() {
    const kotak = parseInt(document.getElementById('stockJumlahKotak').value) || 0;
    const pcs = parseInt(document.getElementById('stockPcsPerKotak').value) || 0;
    document.getElementById('stockTotalPcs').value = (kotak > 0 && pcs > 0) ? (kotak * pcs) + ' pcs' : '';
}
function simpanStock() {
    const kat = document.getElementById('stockKategori').value;
    if (!kat) return showToast('Pilih kategori!', 'error');

    const mode = document.querySelector('input[name="stockInputMode"]:checked')?.value || 'kotak';
    const namaMap = { goreng: 'Goreng', kukus: 'Mutiara', mentai: 'Mentai' };
    const nama = namaMap[kat];
    let total, kotak, pcs;

    if (mode === 'kotak') {
        kotak = parseInt(document.getElementById('stockJumlahKotak').value);
        pcs = parseInt(document.getElementById('stockPcsPerKotak').value);
        if (!kotak || kotak <= 0) return showToast('Jumlah kotak tidak valid!', 'error');
        if (!pcs || pcs <= 0) return showToast('PCS per kotak tidak valid!', 'error');
        total = kotak * pcs;
    } else {
        total = parseInt(document.getElementById('stockPcsLangsung').value);
        if (!total || total <= 0) return showToast('Jumlah PCS tidak valid!', 'error');
        kotak = 0; pcs = total; // simpan tanpa kotak
    }

    const existing = stockData.findIndex(s => s.nama === nama);

    // Cegah kehilangan data: produk sudah ada & sudah ada penjualan -> konfirmasi dulu sebelum reset terjual
    if (existing >= 0 && (stockData[existing].terjual || 0) > 0) {
        const terjual = stockData[existing].terjual;
        customConfirm(`Stok ${nama} sudah ada & sudah terjual ${terjual} pcs.\n\nSimpan ulang akan MERESET terjual jadi 0. Lanjut?\n\n(Untuk menambah stok tanpa reset, pakai tombol "➕ Tambah Stok" di kartu produk.)`, 'Timpa Stok?', '⚠️').then(ok => {
            if (!ok) return;
            _writeStock(existing, nama, kat, kotak, pcs, total);
        });
        return;
    }

    _writeStock(existing, nama, kat, kotak, pcs, total);
}

function _writeStock(existing, nama, kat, kotak, pcs, total) {
    if (existing >= 0) {
        Object.assign(stockData[existing], { jumlahKotak: kotak, pcsPerKotak: pcs, totalPcs: total, stockAwal: total, terjual: 0, sisa: total });
    } else {
        stockData.push({ id: ++stockCounter, nama, kategori: kat, jumlahKotak: kotak, pcsPerKotak: pcs, totalPcs: total, stockAwal: total, terjual: 0, sisa: total });
    }
    saveStockToStorage(); updateStockDisplay(); batalStock(); showToast('Stock berhasil disimpan!', 'success');
}

function showTransferForm(dari = 'Mutiara', ke = 'Mentai') {
    const src = stockData.find(x => x.nama === dari);
    const dst = stockData.find(x => x.nama === ke);
    if (!src) return showToast('Belum ada stok ' + dari + '!', 'error');
    if (!dst) return showToast('Belum ada stok ' + ke + '!', 'error');
    if (src.sisa <= 0) return showToast('Stok ' + dari + ' sudah habis!', 'error');

    transferDari = dari; transferKe = ke;
    const mDari = TRANSFER_META[dari] || { icon: '\ud83d\udce6', warna: '#22C55E' };
    const mKe   = TRANSFER_META[ke]   || { icon: '\ud83d\udce6', warna: '#F4622A' };

    document.getElementById('transferDesc').innerHTML = 'Pindahkan stok <strong style="color:' + mDari.warna + ';">' + dari + '</strong> ke <strong style="color:' + mKe.warna + ';">' + ke + '</strong> dengan rasio <strong style="color:var(--text);">1:1</strong>';
    document.getElementById('transferDariTitle').textContent = mDari.icon + ' ' + dari.toUpperCase() + ' (SISA)';
    document.getElementById('transferKeTitle').textContent = mKe.icon + ' ' + ke.toUpperCase() + ' (SISA)';
    const elDari = document.getElementById('transferDariSisa');
    const elKe = document.getElementById('transferKeSisa');
    elDari.textContent = src.sisa + ' pcs'; elDari.style.color = mDari.warna;
    elKe.textContent = dst.sisa + ' pcs'; elKe.style.color = mKe.warna;
    document.getElementById('transferJumlahLabel').textContent = 'Jumlah ' + dari + ' yang Dipindah (pcs)';
    document.getElementById('previewDariLabel').textContent = mDari.icon + ' ' + dari + ' setelah transfer';
    document.getElementById('previewKeLabel').textContent = mKe.icon + ' ' + ke + ' setelah transfer';
    document.getElementById('previewDari').style.color = mDari.warna;
    document.getElementById('previewKe').style.color = mKe.warna;

    document.getElementById('transferJumlah').value = '';
    document.getElementById('transferPreview').style.display = 'none';
    document.getElementById('stockMainSection').style.display = 'none';
    document.getElementById('stockTransferForm').style.display = 'block';
    document.getElementById('stockForm').style.display = 'none';
}

function batalTransfer() {
    document.getElementById('stockTransferForm').style.display = 'none';
    document.getElementById('stockMainSection').style.display = 'block';
}

function previewTransfer() {
    const jumlah = parseInt(document.getElementById('transferJumlah').value) || 0;
    const src = stockData.find(x => x.nama === transferDari);
    const dst = stockData.find(x => x.nama === transferKe);
    const preview = document.getElementById('transferPreview');
    if (!src || !dst || jumlah <= 0) { preview.style.display = 'none'; return; }
    document.getElementById('previewDari').textContent = (src.sisa - jumlah) + ' pcs';
    document.getElementById('previewKe').textContent = (dst.sisa + jumlah) + ' pcs';
    preview.style.display = 'block';
}

function eksekusiTransfer() {
    const jumlah = parseInt(document.getElementById('transferJumlah').value) || 0;
    if (jumlah <= 0) return showToast('Masukkan jumlah yang valid!', 'error');

    const src = stockData.find(x => x.nama === transferDari);
    const dst = stockData.find(x => x.nama === transferKe);
    if (!src || !dst) return showToast('Stok tidak ditemukan!', 'error');
    if (jumlah > src.sisa) return showToast('Jumlah melebihi sisa stok ' + transferDari + ' (' + src.sisa + ' pcs)!', 'error');

    // Snapshot SEBELUM diubah untuk keperluan undo (format baru: generik dua arah)
    const snapshot = {
        dari: { sisa: src.sisa, stockAwal: src.stockAwal, terjual: src.terjual },
        ke:   { sisa: dst.sisa, stockAwal: dst.stockAwal, terjual: dst.terjual }
    };

    // Transfer: kurangi sisa sumber, tambah sisa & stockAwal tujuan
    // terjual TIDAK diubah karena ini bukan penjualan
    src.sisa -= jumlah; src.stockAwal -= jumlah; src.totalPcs = src.stockAwal;
    dst.sisa += jumlah; dst.stockAwal += jumlah; dst.totalPcs = dst.stockAwal;

    const transferEntry = {
        id: Date.now(),
        jumlah: jumlah,
        dari: transferDari,
        ke: transferKe,
        waktu: new Date().toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        snapshot: snapshot
    };
    transferHistoryData.unshift(transferEntry);
    saveTransferHistory();

    saveStockToStorage();
    batalTransfer();
    updateStockDisplay();
    updateTransferHistoryDisplay();
    showToast('\u2705 Transfer ' + jumlah + ' pcs ' + transferDari + ' \u2192 ' + transferKe + ' berhasil!', 'success');
}

function saveTransferHistory() {
    try { localStorage.setItem('dimsumTransferHistory', JSON.stringify(transferHistoryData)); } catch {}
}
function loadTransferHistory() {
    try { transferHistoryData = JSON.parse(localStorage.getItem('dimsumTransferHistory') || '[]'); } catch { transferHistoryData = []; }
}
function clearTransferHistory() {
    if (transferHistoryData.length === 0) return;
    customConfirm('Hapus semua riwayat transfer?', 'Hapus Riwayat', '🗑️').then(ok => {
        if (!ok) return;
        transferHistoryData = [];
        saveTransferHistory();
        updateTransferHistoryDisplay();
        showToast('Riwayat transfer dihapus', 'info');
    });
}
function undoTransfer(id) {
    const entry = transferHistoryData.find(t => t.id === id);
    if (!entry) return showToast('Riwayat tidak ditemukan!', 'error');

    const namaDari = entry.dari || 'Mutiara';
    const namaKe = entry.ke || 'Mentai';
    const src = stockData.find(x => x.nama === namaDari);
    const dst = stockData.find(x => x.nama === namaKe);
    if (!src || !dst) return showToast('Stok tidak ditemukan!', 'error');

    customConfirm('Batalkan transfer ' + entry.jumlah + ' pcs ' + namaDari + ' \u2192 ' + namaKe + ' ini?', 'Undo Transfer', '\u21a9\ufe0f').then(ok => {
        if (!ok) return;
        const snap = entry.snapshot;
        if (snap.dari) {
            // Format baru (dua arah)
            src.sisa = snap.dari.sisa; src.stockAwal = snap.dari.stockAwal; src.terjual = snap.dari.terjual; src.totalPcs = snap.dari.stockAwal;
            dst.sisa = snap.ke.sisa; dst.stockAwal = snap.ke.stockAwal; dst.terjual = snap.ke.terjual; dst.totalPcs = snap.ke.stockAwal;
        } else {
            // Format lama (selalu Mutiara -> Mentai)
            src.sisa = snap.mutiaraSisa; src.stockAwal = snap.mutiaraStockAwal; src.terjual = snap.mutiaraTerjual; src.totalPcs = snap.mutiaraStockAwal;
            dst.sisa = snap.mentaiSisa; dst.stockAwal = snap.mentaiStockAwal; dst.terjual = snap.mentaiTerjual; dst.totalPcs = snap.mentaiStockAwal;
        }

        transferHistoryData = transferHistoryData.filter(t => t.id !== id);
        saveTransferHistory();
        saveStockToStorage();
        updateStockDisplay();
        updateTransferHistoryDisplay();
        showToast('\u21a9\ufe0f Transfer dibatalkan, stok dikembalikan!', 'success');
    });
}
function updateTransferHistoryDisplay() {
    const wrap = document.getElementById('transferHistoryWrap');
    const list = document.getElementById('transferHistoryList');
    if (!wrap || !list) return;

    if (transferHistoryData.length === 0) {
        wrap.style.display = 'none';
        return;
    }

    wrap.style.display = 'block';
    list.innerHTML = '';
    transferHistoryData.forEach(t => {
        const div = document.createElement('div');
        div.className = 'transfer-item';
        div.innerHTML = `
            <div class="transfer-item-icon">🔄</div>
            <div class="transfer-item-info">
                <div class="transfer-item-title">${t.dari || 'Mutiara'} → ${t.ke || 'Mentai'}</div>
                <div class="transfer-item-time">${t.waktu}</div>
            </div>
            <div class="transfer-item-pcs">+${t.jumlah} pcs</div>
            <button class="transfer-undo-btn" onclick="undoTransfer(${t.id})">↩️ Undo</button>`;
        list.appendChild(div);
    });
}

function toggleStockAddForm(id) {
    const form = document.getElementById('stock-add-form-' + id);
    if (!form) return;
    const isOpen = form.style.display !== 'none';
    // Close all other forms first (class adalah sc-add-form)
    document.querySelectorAll('.sc-add-form').forEach(f => f.style.display = 'none');
    if (!isOpen) {
        form.style.display = 'block';
        const kotakInput = document.getElementById('stock-add-kotak-' + id);
        if (kotakInput) setTimeout(() => kotakInput.focus(), 100);
    }
}

function previewStockAdd(id, defaultPcs, sisaSekarang) {
    const mode = document.querySelector(`input[name="stock-add-mode-${id}"]:checked`)?.value || 'kotak';
    const preview = document.getElementById('stock-add-preview-' + id);
    if (!preview) return;

    let tambah = 0;
    if (mode === 'kotak') {
        const kotak = parseInt(document.getElementById('stock-add-kotak-' + id)?.value) || 0;
        const pcs   = parseInt(document.getElementById('stock-add-pcs-' + id)?.value) || defaultPcs;
        if (kotak <= 0) { preview.textContent = ''; return; }
        tambah = kotak * pcs;
    } else {
        const langsung = parseInt(document.getElementById('stock-add-pcs-langsung-' + id)?.value) || 0;
        if (langsung <= 0) { preview.textContent = ''; return; }
        tambah = langsung;
    }
    preview.textContent = `+${tambah} pcs → Sisa jadi ${sisaSekarang + tambah} pcs`;
}

function switchStockAddMode(id, mode, defaultPcs, sisaSekarang) {
    const kotakRow = document.getElementById('stock-add-kotak-row-' + id);
    const pcsRow   = document.getElementById('stock-add-pcs-row-' + id);
    if (mode === 'kotak') {
        kotakRow.style.display = 'flex';
        pcsRow.style.display   = 'none';
    } else {
        kotakRow.style.display = 'none';
        pcsRow.style.display   = 'flex';
    }
    // Reset preview
    const preview = document.getElementById('stock-add-preview-' + id);
    if (preview) preview.textContent = '';
}

function konfirmasiTambahStok(id) {
    const item = stockData.find(s => s.id === id);
    if (!item) return showToast('Stok tidak ditemukan!', 'error');

    const mode = document.querySelector(`input[name="stock-add-mode-${id}"]:checked`)?.value || 'kotak';
    let tambahPcs = 0;

    if (mode === 'kotak') {
        const kotak = parseInt(document.getElementById('stock-add-kotak-' + id)?.value) || 0;
        const pcs   = parseInt(document.getElementById('stock-add-pcs-' + id)?.value) || item.pcsPerKotak;
        if (kotak <= 0) return showToast('Masukkan jumlah kotak!', 'error');
        tambahPcs = kotak * pcs;
        item.jumlahKotak += kotak;
    } else {
        const langsung = parseInt(document.getElementById('stock-add-pcs-langsung-' + id)?.value) || 0;
        if (langsung <= 0) return showToast('Masukkan jumlah pcs!', 'error');
        tambahPcs = langsung;
    }

    item.stockAwal  += tambahPcs;
    item.sisa       += tambahPcs;
    item.totalPcs    = item.stockAwal;

    saveStockToStorage();
    updateStockDisplay();
    showToast(`✅ +${tambahPcs} pcs ${item.nama} berhasil ditambahkan!`, 'success');
}

function updateStockDisplay() {
    const list = document.getElementById('stockList');
    if (stockData.length === 0) { list.innerHTML = `<div class="empty-state"><div class="es-icon">📦</div><div class="es-title">Belum Ada Stock</div><div class="es-msg">Tambahkan stock produk dulu</div></div>`; const tc = document.getElementById('stockTotalCard'); if(tc) tc.style.display='none'; return; }
    list.innerHTML = '';
    stockData.forEach((item, idx) => {
        const pct = item.stockAwal > 0 ? (item.sisa / item.stockAwal) * 100 : 0;
        const sisaPct = Math.round(pct);

        let cardClass = '', barClass = 'bar-ok', badgeClass = 'ok', badgeText = '✅ Aman', sisaClass = 'sisa-ok';
        if (pct <= 0)      { cardClass='stock-critical'; barClass='bar-habis';  badgeClass='habis';  badgeText='🚫 Habis';   sisaClass='sisa-danger'; }
        else if (pct < 25) { cardClass='stock-critical'; barClass='bar-danger'; badgeClass='danger'; badgeText='🔴 Kritis';  sisaClass='sisa-danger'; }
        else if (pct < 50) { cardClass='stock-warn';     barClass='bar-warn';   badgeClass='warn';   badgeText='⚠️ Sedikit'; sisaClass='sisa-warn'; }

        const katIcon = { Mentai:'⭐', Goreng:'🍳', Mutiara:'🥟' }[item.nama] || '📦';

        const div = document.createElement('div');
        div.className = 'stock-item ' + cardClass;
        div.style.animationDelay = (idx * 0.07) + 's';
        div.innerHTML = `
            <div class="sc-header">
                <div class="sc-title">${katIcon} ${item.nama}</div>
                <div class="sc-header-right">
                    <span class="sc-badge sc-badge-${badgeClass}">${badgeText}</span>
                    <button class="btn-remove" onclick="hapusStock(${item.id})">×</button>
                </div>
            </div>

            <div class="sc-body">
                <div class="sc-sisa-block">
                    <div class="sc-sisa-num ${sisaClass}">${item.sisa}</div>
                    <div class="sc-sisa-unit">pcs tersisa</div>
                </div>
                <div class="sc-ring-wrap">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface3)" stroke-width="8"/>
                        <circle cx="32" cy="32" r="26" fill="none"
                            stroke="${pct<=0?'var(--surface4)':pct<25?'#F43F5E':pct<50?'#FBBF24':'#22C55E'}"
                            stroke-width="8" stroke-linecap="round"
                            stroke-dasharray="${Math.round(2*Math.PI*26*sisaPct/100)} ${Math.round(2*Math.PI*26)}"
                            stroke-dashoffset="${Math.round(2*Math.PI*26*0.25)}"
                            style="transition:stroke-dasharray 0.6s ease;"/>
                        <text x="32" y="37" text-anchor="middle" font-size="13" font-weight="800"
                            fill="${pct<=0?'#6B7280':pct<25?'#F43F5E':pct<50?'#FBBF24':'#22C55E'}"
                            font-family="Sora,sans-serif">${sisaPct}%</text>
                    </svg>
                </div>
            </div>

            <div class="sc-bar-wrap">
                <div class="sc-bar-fill sc-bar-${barClass}" style="width:${sisaPct}%"></div>
            </div>

            <div class="sc-stats">
                <div class="sc-stat">
                    <span class="sc-stat-label">Awal</span>
                    <span class="sc-stat-val">${item.stockAwal} pcs</span>
                </div>
                <div class="sc-stat-dot">·</div>
                <div class="sc-stat">
                    <span class="sc-stat-label">Terjual</span>
                    <span class="sc-stat-val sc-terjual">${item.terjual} pcs</span>
                </div>
                <div class="sc-stat-dot">·</div>
                <div class="sc-stat">
                    <span class="sc-stat-label">Kotak</span>
                    <span class="sc-stat-val">${item.jumlahKotak} × ${item.pcsPerKotak}</span>
                </div>
            </div>

            <button class="sc-add-btn" onclick="toggleStockAddForm(${item.id})">
                ➕ Tambah Stok
            </button>
            <div class="sc-add-form" id="stock-add-form-${item.id}" style="display:none;">
                <div class="sc-add-form-title">📦 Tambah Stok ${item.nama}</div>

                <!-- Mode Toggle -->
                <div class="stock-add-mode-toggle">
                    <label class="stock-mode-label">
                        <input type="radio" name="stock-add-mode-${item.id}" value="kotak" checked
                            onchange="switchStockAddMode(${item.id}, 'kotak', ${item.pcsPerKotak}, ${item.sisa})">
                        <span>📦 Kotak</span>
                    </label>
                    <label class="stock-mode-label">
                        <input type="radio" name="stock-add-mode-${item.id}" value="pcs"
                            onchange="switchStockAddMode(${item.id}, 'pcs', ${item.pcsPerKotak}, ${item.sisa})">
                        <span>🔢 PCS Langsung</span>
                    </label>
                </div>

                <!-- Mode Kotak -->
                <div class="stock-add-row" id="stock-add-kotak-row-${item.id}">
                    <div class="stock-add-field">
                        <label>Kotak</label>
                        <input type="number" id="stock-add-kotak-${item.id}" placeholder="0" min="1"
                            oninput="previewStockAdd(${item.id}, ${item.pcsPerKotak}, ${item.sisa})"
                            onfocus="this.select()">
                    </div>
                    <div style="padding-bottom:8px; font-size:18px; color:var(--text3);">×</div>
                    <div class="stock-add-field">
                        <label>PCS/Kotak</label>
                        <input type="number" id="stock-add-pcs-${item.id}" placeholder="${item.pcsPerKotak}" value="${item.pcsPerKotak}" min="1"
                            oninput="previewStockAdd(${item.id}, ${item.pcsPerKotak}, ${item.sisa})"
                            onfocus="this.select()">
                    </div>
                </div>

                <!-- Mode PCS Langsung -->
                <div class="stock-add-row" id="stock-add-pcs-row-${item.id}" style="display:none;">
                    <div class="stock-add-field" style="flex:1;">
                        <label>Jumlah PCS</label>
                        <input type="number" id="stock-add-pcs-langsung-${item.id}" placeholder="0" min="1"
                            oninput="previewStockAdd(${item.id}, ${item.pcsPerKotak}, ${item.sisa})"
                            onfocus="this.select()">
                    </div>
                </div>

                <div class="stock-add-preview" id="stock-add-preview-${item.id}"></div>
                <div class="stock-add-actions">
                    <button class="btn-confirm" onclick="konfirmasiTambahStok(${item.id})">✅ Tambah</button>
                    <button class="btn-cancel" onclick="toggleStockAddForm(${item.id})">Batal</button>
                </div>
            </div>`;
        list.appendChild(div);
    });

    const totalCard = document.getElementById('stockTotalCard');
    if (totalCard) {
        const totalAwal = stockData.reduce((s, i) => s + i.stockAwal, 0);
        const totalTerjual = stockData.reduce((s, i) => s + i.terjual, 0);
        const totalSisa = stockData.reduce((s, i) => s + i.sisa, 0);
        totalCard.style.display = 'block';
        document.getElementById('stockTotalAwal').textContent = totalAwal + ' pcs';
        document.getElementById('stockTotalTerjual').textContent = totalTerjual + ' pcs';
        document.getElementById('stockTotalSisa').textContent = totalSisa + ' pcs';
    }
}

function hapusStock(id) { customConfirm('Hapus stock ini?', 'Hapus Stock', '📦').then(ok => { if (!ok) return; stockData = stockData.filter(s => s.id !== id); saveStockToStorage(); updateStockDisplay(); showToast('Stock dihapus', 'info'); }); }
function resetSemuaStock() {
    if (stockData.length === 0) return showToast('Belum ada stock!', 'error');
    customConfirm('Hapus SEMUA data stock?', 'Reset Stock', '🗑️').then(ok => { if (!ok) return; stockData = []; stockCounter = 0; localStorage.removeItem('dimsumStock'); updateStockDisplay(); showToast('Semua stock dihapus', 'info'); });
}
function updateStockTerjual(nama, pcs, kategori) {
    // bakar/mentai8/mentai20 → 'Mentai', goreng → 'Goreng', kukus → 'Mutiara'
    const keyMap = {};
    const key = keyMap[kategori];
    if (!key) return;
    const s = stockData.find(st => st.nama === key);
    if (s) { s.terjual = Math.max(0, s.terjual + pcs); s.sisa = Math.max(0, s.stockAwal - s.terjual); saveStockToStorage(); updateStockDisplay(); }
}

// ===== KAS =====
function showTambahKas() { document.getElementById('kasTambahForm').style.display = 'block'; document.getElementById('kasAmbilForm').style.display = 'none'; setTimeout(() => document.getElementById('kasTambahJumlah').focus(), 80); }
function showAmbilKas() { document.getElementById('kasAmbilForm').style.display = 'block'; document.getElementById('kasTambahForm').style.display = 'none'; setTimeout(() => document.getElementById('kasAmbilJumlah').focus(), 80); }
function batalKasForm() { document.getElementById('kasTambahForm').style.display = 'none'; document.getElementById('kasAmbilForm').style.display = 'none'; ['kasTambahJumlah','kasTambahKet','kasAmbilJumlah','kasAmbilUntuk'].forEach(id => document.getElementById(id).value = ''); }
function setKasQuick(n, type) { const id = type === 'tambah' ? 'kasTambahJumlah' : 'kasAmbilJumlah'; document.getElementById(id).value = n.toLocaleString('id-ID'); document.getElementById(id).focus(); }
function simpanTambahKas() {
    const jumlah = parseInt((document.getElementById('kasTambahJumlah').value || '').replace(/\D/g,''));
    if (!jumlah || jumlah <= 0) return showToast('Jumlah tidak valid!', 'error');
    const ket = document.getElementById('kasTambahKet').value || 'Tambah Kas';
    kasData.push({ id: ++kasCounter, type: 'tambah', jumlah, keterangan: ket, timestamp: new Date().toISOString() });
    kasSaldo += jumlah; saveKasToStorage(); updateKasDisplay(); batalKasForm();
    showToast(`+${formatRupiah(jumlah)} ditambahkan ke kas`, 'success');
}
function simpanAmbilKas() {
    const jumlah = parseInt((document.getElementById('kasAmbilJumlah').value || '').replace(/\D/g,''));
    const untuk = document.getElementById('kasAmbilUntuk').value.trim();
    if (!jumlah || jumlah <= 0) return showToast('Jumlah tidak valid!', 'error');
    if (!untuk) return showToast('Isi keterangan untuk apa!', 'error');
    if (jumlah > kasSaldo) {
        // Konfirmasi jika ambil melebihi saldo
        customConfirm(`Saldo kas hanya ${formatRupiah(kasSaldo)}, ambil ${formatRupiah(jumlah)} akan membuat saldo negatif. Lanjutkan?`, 'Saldo Kurang', '⚠️').then(ok => {
            if (!ok) return;
            _doAmbilKas(jumlah, untuk);
        });
        return;
    }
    _doAmbilKas(jumlah, untuk);
}
function _doAmbilKas(jumlah, untuk) {
    kasData.push({ id: ++kasCounter, type: 'ambil', jumlah, keterangan: untuk, timestamp: new Date().toISOString() });
    kasSaldo -= jumlah; saveKasToStorage(); updateKasDisplay(); batalKasForm();
    showToast(`-${formatRupiah(jumlah)} diambil dari kas`, 'success');
}
function updateKasDisplay() {
    const saldoEl = document.getElementById('kasSaldoDisplay');
    saldoEl.textContent = formatRupiah(kasSaldo);
    saldoEl.style.color = kasSaldo < 0 ? '#fca5a5' : 'white'; // UX: merah jika negatif
    document.getElementById('kasSaldoAkhir').textContent = formatRupiah(kasSaldo);
    const list = document.getElementById('kasRiwayatList');
    const section = document.getElementById('kasRiwayatSection');
    const empty = document.getElementById('kasEmptyState');
    if (kasData.length === 0) { section.style.display = 'none'; empty.style.display = 'block'; updateClosingSection(); return; }
    section.style.display = 'block'; empty.style.display = 'none';
    list.innerHTML = '';
    [...kasData].reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = `kas-item ${item.type}`;
        const sign = item.type === 'tambah' ? '+' : '-';
        const icon = item.type === 'tambah' ? '📥' : '📤';
        const time = new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `
            <div class="kas-item-info">
                <div class="kas-item-type ${item.type}">${icon} ${item.type === 'tambah' ? 'Tambah' : 'Ambil'} <span class="kas-time">${time}</span></div>
                <div class="kas-item-desc">${item.keterangan}</div>
            </div>
            <div class="kas-item-amount ${item.type}">${sign}${formatRupiah(item.jumlah)}</div>
            <button class="btn-remove" onclick="hapusKas(${item.id})">×</button>`;
        list.appendChild(div);
    });
    updateClosingSection();
}
function hapusKas(id) {
    customConfirm('Hapus transaksi kas ini?', 'Hapus Transaksi', '🗑️').then(ok => {
        if (!ok) return;
        const item = kasData.find(k => k.id === id);
        if (item) { kasSaldo += item.type === 'tambah' ? -item.jumlah : item.jumlah; kasData = kasData.filter(k => k.id !== id); saveKasToStorage(); updateKasDisplay(); showToast('Transaksi dihapus', 'info'); }
    });
}

// ===== LOCAL STORAGE =====
function scheduleSave() { clearTimeout(saveTimeout); saveTimeout = setTimeout(savePenjualanToStorage, 400); }
function savePenjualanToStorage() {
    try {
        const today = getTodayLocal();
        const str = JSON.stringify({ penjualanData, penjualanCounter, saveDate: today, lastUpdate: new Date().toISOString() });
        localStorage.setItem('dimsumData', str); localStorage.setItem('dimsumData_backup', str); localStorage.setItem('dimsumData_' + today, str);
    } catch(e) { console.error('Save error:', e); }
}
// FIX #1: Cek tanggal saat load
function loadPenjualanFromStorage() {
    try {
        const today = getTodayLocal();
        // Juga ambil tanggal UTC untuk kompatibilitas data lama yang disimpan sebelum fix timezone
        const todayUTC = new Date().toISOString().split('T')[0];
        let raw = localStorage.getItem('dimsumData') || localStorage.getItem('dimsumData_backup') || localStorage.getItem('dimsumData_' + today) || localStorage.getItem('dimsumData_' + todayUTC);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!Array.isArray(data.penjualanData)) return false;
        // Terima data jika saveDate cocok dengan tanggal lokal ATAU tanggal UTC (kompatibilitas)
        // Auto-reset berdasarkan tanggal DINONAKTIFKAN — user reset manual via tombol Reset
        // if (data.saveDate && data.saveDate !== today && data.saveDate !== todayUTC) {
        //     clearPenjualanStorage();
        //     return false;
        // }
        penjualanData = data.penjualanData; penjualanCounter = data.penjualanCounter || 0; return true;
    } catch { return false; }
}
// FIX #5: Bersihkan semua backup lama
function clearPenjualanStorage() {
    ['dimsumData','dimsumData_backup'].forEach(k => localStorage.removeItem(k));
    try { Object.keys(localStorage).filter(k => k.startsWith('dimsumData_')).forEach(k => localStorage.removeItem(k)); } catch {}
}
function saveStockToStorage() { try { localStorage.setItem('dimsumStock', JSON.stringify({ stockData, stockCounter, lastUpdate: new Date().toISOString() })); } catch {} }
function loadStockFromStorage() {
    try { const d = JSON.parse(localStorage.getItem('dimsumStock') || '{}'); stockData = (d.stockData || []).map(s => { if (s.nama === 'Mentai (Stock Mentah)' || s.nama === 'Mentai (Stock Mentai)') s.nama = 'Mentai'; if (s.nama === 'Goreng Keju Lumer') s.nama = 'Goreng'; return s; }); stockCounter = d.stockCounter || 0; } catch {}
}
function saveKasToStorage() { try { localStorage.setItem('dimsumKas', JSON.stringify({ kasData, kasCounter, kasSaldo, lastUpdate: new Date().toISOString() })); } catch {} }
function loadKasFromStorage() { try { const d = JSON.parse(localStorage.getItem('dimsumKas') || '{}'); kasData = d.kasData || []; kasCounter = d.kasCounter || 0; kasSaldo = d.kasSaldo || 0; } catch {} }


// ===== SETTINGS PANEL =====
function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
        const savedTheme = localStorage.getItem('accentTheme') || 'orange';
        document.querySelectorAll('.sp-theme-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.theme === savedTheme)
        );
    }
}

function setAccentTheme(theme) {
    const root = document.documentElement;
    const themes = {
        orange: { brand: '#F4622A', brand2: '#FF8050', brand3: '#FFB088', dark: '#C94A18', glow: 'rgba(244,98,42,0.25)', soft: 'rgba(244,98,42,0.12)', shadow: 'rgba(244,98,42,0.4)', border: 'rgba(244,98,42,0.3)' },
        green:  { brand: '#10B981', brand2: '#34D399', brand3: '#6EE7B7', dark: '#0A8E63', glow: 'rgba(16,185,129,0.22)',  soft: 'rgba(16,185,129,0.10)',  shadow: 'rgba(16,185,129,0.45)'  },
        blue:   { brand: '#3B82F6', brand2: '#60A5FA', brand3: '#93C5FD', dark: '#1D6FE8', glow: 'rgba(59,130,246,0.22)',  soft: 'rgba(59,130,246,0.10)',  shadow: 'rgba(59,130,246,0.45)'  },
        purple: { brand: '#8B5CF6', brand2: '#A78BFA', brand3: '#C4B5FD', dark: '#6D3FE0', glow: 'rgba(139,92,246,0.22)', soft: 'rgba(139,92,246,0.10)', shadow: 'rgba(139,92,246,0.45)' }
    };
    const t = themes[theme] || themes.orange;
    root.style.setProperty('--brand', t.brand);
    root.style.setProperty('--brand-2', t.brand2);
    root.style.setProperty('--brand-3', t.brand3);
    root.style.setProperty('--brand-dark', t.dark);
    root.style.setProperty('--brand-glow', t.glow);
    root.style.setProperty('--brand-soft', t.soft);
    root.style.setProperty('--brand-shadow', t.shadow);
    root.style.setProperty('--brand-border', t.border || t.glow);
    localStorage.setItem('accentTheme', theme);
    document.querySelectorAll('.sp-theme-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.theme === theme)
    );
    showToast('🎨 Tema ' + theme.charAt(0).toUpperCase() + theme.slice(1) + ' aktif', 'success');
}

function loadAccentTheme() {
    const saved = localStorage.getItem('accentTheme') || 'orange';
    setAccentTheme(saved);
}

function confirmResetAll() {
    customConfirm('Reset penjualan, stock, dan kas hari ini?\n\nHistory, rekap mingguan, gaji & riwayat kasir TIDAK ikut terhapus.', 'Reset Data Harian', '⚠️').then(ok => {
        if (!ok) return;
        // Data penting yang WAJIB dipertahankan (jangan sampai hilang saat reset)
        const preserveKeys = ['dimsumHistory', 'rekapMingguan', 'dimsumTransferHistory', 'dimsumKasirTrx', 'accentTheme', 'lastSeninNotif'];
        const backup = {};
        preserveKeys.forEach(k => { const v = localStorage.getItem(k); if (v !== null) backup[k] = v; });
        localStorage.clear();
        Object.keys(backup).forEach(k => localStorage.setItem(k, backup[k]));
        showToast('✅ Penjualan, stock & kas direset. History & gaji aman.', 'success');
        setTimeout(() => location.reload(), 1200);
    });
}

// ===== ANIMASI ANGKA =====
function animateNumber(el, target, isCurrency = false, suffix = ' pcs') {
    const start = parseFloat(el.dataset.val || 0);
    if (start === target) return;
    el.dataset.val = target;
    const duration = 450;
    const steps = 20;
    const diff = target - start;
    const stepTime = duration / steps;
    let i = 0;
    const timer = setInterval(() => {
        i++;
        const val = Math.round(start + (diff * (i / steps)));
        el.textContent = isCurrency ? formatRupiah(val) : val + suffix;
        if (i >= steps) { clearInterval(timer); el.textContent = isCurrency ? formatRupiah(target) : target + suffix; }
    }, stepTime);
}

// ===== HISTORY FILTER DROPDOWN =====
let hfLokasiVal = '', hfBulanVal = '';

function toggleHfDropdown(id) {
    const dropdown = document.getElementById(id + 'Dropdown');
    const trigger = document.getElementById(id + 'Trigger');
    const isOpen = dropdown.classList.contains('hf-open');
    closeAllHfDropdowns();
    if (!isOpen) {
        dropdown.classList.add('hf-open');
        trigger.classList.add('hf-open');
    }
}
function closeAllHfDropdowns() {
    ['hfLokasi','hfBulan'].forEach(id => {
        document.getElementById(id + 'Dropdown')?.classList.remove('hf-open');
        document.getElementById(id + 'Trigger')?.classList.remove('hf-open');
    });
}
function selectHfFilter(type, value, label) {
    if (type === 'hfLokasi') {
        hfLokasiVal = value;
        const trigger = document.getElementById('hfLokasiTrigger');
        document.getElementById('hfLokasiLabel').textContent = label;
        if (value) trigger.classList.add('hf-active');
        else trigger.classList.remove('hf-active');
    } else {
        hfBulanVal = value;
        const trigger = document.getElementById('hfBulanTrigger');
        document.getElementById('hfBulanLabel').textContent = label;
        if (value) trigger.classList.add('hf-active');
        else trigger.classList.remove('hf-active');
    }
    // Mark active items
    document.querySelectorAll('#' + type + 'Dropdown .hf-item').forEach(el => {
        el.classList.toggle('hf-item-active', el.dataset.val === value);
    });
    closeAllHfDropdowns();
    applyHistoryFilter();
}
document.addEventListener('click', function(e) {
    if (!e.target.closest('.hf-select-wrap')) closeAllHfDropdowns();
});

// ===== HISTORY HARIAN =====
let historyData = [];

function saveHistoryToStorage() {
    try { localStorage.setItem('dimsumHistory', JSON.stringify(historyData)); } catch {}
}
function loadHistoryFromStorage() {
    try { historyData = JSON.parse(localStorage.getItem('dimsumHistory') || '[]'); } catch { historyData = []; }
}
function simpanHariIni() {
    const totalOmset = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
    const totalPcs = penjualanData.reduce((s, i) => s + i.totalPcs, 0);
    if (totalOmset <= 0) return showToast('Belum ada data penjualan hari ini!', 'error');

    // App khusus stand Ramayana — lokasi otomatis
    const lokasi = 'Ramayana';

    const today = getTodayLocal();
    const existing = historyData.findIndex(h => h.tanggal === today);
    const entry = {
        tanggal: today,
        tanggalDisplay: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
        omset: totalOmset,
        pcs: totalPcs,
        items: penjualanData.length,
        lokasi: lokasi,
        savedAt: new Date().toISOString(),
        detail: penjualanData.map(i => ({
            nama: i.nama,
            kategori: i.kategori,
            jumlah: i.jumlah,
            harga: i.harga,
            pcs: i.pcs,
            totalHarga: i.totalHarga,
            totalPcs: i.totalPcs
        }))
    };

    if (existing >= 0) {
        customConfirm('Data hari ini sudah ada. Timpa dengan data terbaru?', 'Update History', '📅').then(ok => {
            if (!ok) return;
            historyData[existing] = entry;
            saveHistoryToStorage();
            updateHistoryDisplay();
            showToast('✅ History hari ini diperbarui!', 'success');
        });
    } else {
        historyData.unshift(entry);
        saveHistoryToStorage();
        updateHistoryDisplay();
        showToast('✅ Berhasil disimpan ke history!', 'success');
    }
}
function hapusHistory(tanggal) {
    customConfirm('Hapus history tanggal ini?', 'Hapus History', '🗑️').then(ok => {
        if (!ok) return;
        historyData = historyData.filter(h => h.tanggal !== tanggal);
        saveHistoryToStorage();
        updateHistoryDisplay();
        showToast('History dihapus', 'info');
    });
}
function resetSemuaHistory() {
    if (historyData.length === 0) return showToast('Belum ada history!', 'error');
    customConfirm('Reset history? Rekap minggu ini akan tersimpan otomatis.', 'Reset History', '🗑️').then(ok => {
        if (!ok) return;
        // Simpan rekap mingguan sebelum reset
        simpanRekapMingguan();
        historyData = [];
        saveHistoryToStorage();
        updateHistoryDisplay();
        showToast('History direset. Rekap tersimpan! ✅', 'success');
    });
}

function simpanRekapMingguan() {
    if (historyData.length === 0) return;
    const now = new Date();
    const totalOmset = historyData.reduce((s,h) => s + h.omset, 0);
    const totalGaji = historyData.reduce((s,h) => {
        const tier = BONUS_TIERS.find(t => h.omset >= t.min && h.omset <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
        return s + 65000 + tier.bonus;
    }, 0);
    const rekap = {
        minggu: getWeekNumber(now),
        tahun: now.getFullYear(),
        dari: historyData[historyData.length-1]?.tanggalDisplay || '',
        sampai: historyData[0]?.tanggalDisplay || '',
        totalHari: historyData.length,
        totalOmset,
        totalGaji,
        data: historyData
    };
    // Simpan ke array rekap mingguan
    let allRekap = JSON.parse(localStorage.getItem('rekapMingguan') || '[]');
    allRekap = allRekap.filter(r => !(r.minggu === rekap.minggu && r.tahun === rekap.tahun));
    allRekap.unshift(rekap);
    if (allRekap.length > 8) allRekap = allRekap.slice(0, 8); // simpan max 8 minggu
    localStorage.setItem('rekapMingguan', JSON.stringify(allRekap));
}

function getWeekNumber(d) {
    const date = new Date(d);
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function cekNotifikasiSenin() {
    const now = new Date();
    if (now.getDay() !== 1) return; // Hanya Senin
    const lastNotif = localStorage.getItem('lastSeninNotif');
    const todayStr = now.toISOString().split('T')[0];
    if (lastNotif === todayStr) return; // Sudah notif hari ini
    if (historyData.length === 0) return;
    localStorage.setItem('lastSeninNotif', todayStr);
    setTimeout(() => {
        showToast('📅 Selamat Senin! Jangan lupa reset history minggu lalu ya.', 'info');
    }, 2000);
}
function buildHistoryFilters() {
    const lokasiDd = document.getElementById('hfLokasiDropdown');
    const bulanDd = document.getElementById('hfBulanDropdown');
    if (!lokasiDd || !bulanDd) return;

    const lokasiSet = new Set();
    const bulanSet = new Set();
    historyData.forEach(h => {
        if (h.lokasi) lokasiSet.add(h.lokasi);
        bulanSet.add(h.tanggal.substring(0, 7));
    });

    // Build lokasi dropdown
    lokasiDd.innerHTML = '';
    const allLokasi = document.createElement('div');
    allLokasi.className = 'hf-item hf-placeholder' + (hfLokasiVal === '' ? ' hf-item-active' : '');
    allLokasi.dataset.val = '';
    allLokasi.textContent = '🏪 Semua Lokasi';
    allLokasi.onclick = () => selectHfFilter('hfLokasi', '', '🏪 Semua Lokasi');
    lokasiDd.appendChild(allLokasi);
    [...lokasiSet].sort().forEach(l => {
        const div = document.createElement('div');
        div.className = 'hf-item' + (hfLokasiVal === l ? ' hf-item-active' : '');
        div.dataset.val = l;
        div.textContent = l;
        div.onclick = () => selectHfFilter('hfLokasi', l, l);
        lokasiDd.appendChild(div);
    });

    // Build bulan dropdown
    bulanDd.innerHTML = '';
    const allBulan = document.createElement('div');
    allBulan.className = 'hf-item hf-placeholder' + (hfBulanVal === '' ? ' hf-item-active' : '');
    allBulan.dataset.val = '';
    allBulan.textContent = '📅 Semua Bulan';
    allBulan.onclick = () => selectHfFilter('hfBulan', '', '📅 Semua Bulan');
    bulanDd.appendChild(allBulan);
    [...bulanSet].sort().reverse().forEach(ym => {
        const [y, m] = ym.split('-');
        const label = new Date(y, m - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        const div = document.createElement('div');
        div.className = 'hf-item' + (hfBulanVal === ym ? ' hf-item-active' : '');
        div.dataset.val = ym;
        div.textContent = label;
        div.onclick = () => selectHfFilter('hfBulan', ym, label);
        bulanDd.appendChild(div);
    });
}

function applyHistoryFilter() {
    let filtered = historyData;
    if (hfLokasiVal) filtered = filtered.filter(h => h.lokasi === hfLokasiVal);
    if (hfBulanVal) filtered = filtered.filter(h => h.tanggal.startsWith(hfBulanVal));
    renderHistoryList(filtered);
}

function updateHistoryDisplay() {
    const listEl = document.getElementById('historyList');
    const emptyEl = document.getElementById('historyEmpty');
    const summaryEl = document.getElementById('historySummaryCard');
    const actionsEl = document.getElementById('historyActions');
    const saveBtnEl = document.getElementById('historySaveBtn');
    const filterBar = document.getElementById('historyFilterBar');

    listEl.innerHTML = '';

    if (historyData.length === 0) {
        emptyEl.style.display = 'block';
        summaryEl.style.display = 'none';
        actionsEl.style.display = 'none';
        saveBtnEl.style.display = 'block';
        if (filterBar) filterBar.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    summaryEl.style.display = 'block';
    actionsEl.style.display = 'block';
    saveBtnEl.style.display = 'none';
    if (filterBar) filterBar.style.display = 'block';

    buildHistoryFilters();
    applyHistoryFilter();
    renderHistoryChart();
    updateTotalGajiMinggu();
}

function renderHistoryChart() {
    const wrap = document.getElementById('historyChartWrap');
    const barsEl = document.getElementById('historyChartBars');
    if (!wrap || !barsEl) return;
    if (historyData.length === 0) { wrap.style.display = 'none'; return; }

    wrap.style.display = 'block';
    const data = [...historyData].sort((a,b) => new Date(a.tanggal)-new Date(b.tanggal)).slice(-14);
    const maxOmset = Math.max(...data.map(h => h.omset));
    if (maxOmset === 0) { wrap.style.display = 'none'; return; }
    barsEl.innerHTML = '';

    data.forEach(h => {
        const isBest = h.omset === maxOmset;
        const heightPct = Math.round((h.omset / maxOmset) * 100);
        const dayLabel = h.tanggalDisplay.split(',')[0].substring(0, 3);
        const tier = BONUS_TIERS.find(t => h.omset >= t.min && h.omset <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
        const gaji = 65000 + tier.bonus;

        const w = document.createElement('div');
        w.className = 'hc-bar-wrap';
        w.title = h.tanggalDisplay + '\nOmset: ' + formatRupiah(h.omset) + '\nGaji: ' + formatRupiah(gaji);
        w.innerHTML = `
            <div class="hc-bar-group">
                <div class="hc-bar ${isBest ? 'best' : 'normal'}" style="height:${heightPct}%"></div>
                <div class="hc-bar gaji-bar" style="height:${Math.min(100, Math.round((gaji/maxOmset)*100))}%;background:rgba(56,189,248,0.5);"></div>
            </div>
            <div class="hc-label">${dayLabel}</div>`;
        barsEl.appendChild(w);
    });
}

function renderHistoryList(data) {
    const listEl = document.getElementById('historyList');
    const filterInfo = document.getElementById('filterInfo');
    const isFiltered = hfLokasiVal || hfBulanVal;
    listEl.innerHTML = '';

    if (data.length === 0) {
        listEl.innerHTML = `
            <div class="history-filter-empty">
                <div class="hfe-icon">🔍</div>
                <div class="hfe-title">Tidak Ada Data</div>
                <div class="hfe-msg">Tidak ada history untuk filter yang dipilih</div>
                <button class="hfe-reset" onclick="resetHfFilter()">✕ Reset Filter</button>
            </div>`;
        document.getElementById('historyTotalHari').textContent = '0 hari';
        document.getElementById('historyTotalOmset').textContent = formatRupiah(0);
        document.getElementById('historyRataRata').textContent = formatRupiah(0);
        document.getElementById('historyBest').style.display = 'none';
        if (filterInfo) { filterInfo.style.display = 'none'; }
        return;
    }

    // Animate summary numbers
    const totalOmset = data.reduce((s, h) => s + h.omset, 0);
    const rataRata = Math.round(totalOmset / data.length);
    const best = data.reduce((max, h) => h.omset > max.omset ? h : max);
    animateNumber(document.getElementById('historyTotalHari'), data.length, false, ' hari');
    animateNumber(document.getElementById('historyTotalOmset'), totalOmset, true);
    animateNumber(document.getElementById('historyRataRata'), rataRata, true);
    document.getElementById('historyBest').style.display = 'flex';
    document.getElementById('historyBestVal').textContent = best.tanggalDisplay.split(',')[0] + ' · ' + formatRupiah(best.omset);

    if (filterInfo) {
        if (isFiltered) {
            filterInfo.style.display = 'block';
            filterInfo.textContent = `🔍 ${data.length} dari ${historyData.length} hari`;
        } else {
            filterInfo.style.display = 'none';
        }
    }

    const maxOmset = Math.max(...data.map(h => h.omset));
    const avgOmset = data.reduce((s, h) => s + h.omset, 0) / data.length;

    data.forEach((h, idx) => {
        const isBest = h.omset === maxOmset;
        const pct = Math.round((h.omset / maxOmset) * 100);
        const tier = BONUS_TIERS.find(t => h.omset >= t.min && h.omset <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
        const bonusText = tier.bonus > 0 ? '+' + formatRupiah(tier.bonus) : '—';

        // Warna kartu berdasarkan performa
        let cardColor, cardBadge;
        if (h.omset >= 800000) { cardColor = 'rgba(124,58,237,0.12)'; cardBadge = ''; }
        else if (h.omset >= 600000) { cardColor = 'rgba(34,197,94,0.08)'; cardBadge = ''; }
        else if (h.omset >= avgOmset) { cardColor = 'rgba(251,191,36,0.08)'; cardBadge = ''; }
        else { cardColor = 'rgba(244,63,94,0.06)'; cardBadge = ''; }

        const div = document.createElement('div');
        div.className = 'history-item' + (isBest ? ' history-best' : '');
        div.style.animationDelay = (idx * 0.05) + 's';
        div.style.background = cardColor;
        const detailId = 'hd-' + h.tanggal;
        const hasDetail = h.detail && h.detail.length > 0;
        div.innerHTML = `
            <div class="hi-header">
                <div class="hi-date">${h.tanggalDisplay}</div>
                <div class="hi-actions">
                    ${isBest ? '<span class="hi-badge-best">🏆 Terbaik</span>' : ''}
                    <button class="btn-remove" onclick="hapusHistory('${h.tanggal}')">×</button>
                </div>
            </div>
            ${h.lokasi ? `<div class="hi-lokasi">📍 ${h.lokasi}</div>` : ''}
            <div class="hi-omset">${formatRupiah(h.omset)}</div>
            <div class="hi-bar-wrap">
                <div class="hi-bar" style="width:${pct}%"></div>
            </div>
            <div class="hi-meta">
                <span>📦 ${h.pcs} pcs · ${h.items} menu</span>
            </div>
            <div class="hi-gaji-total" style="margin-top:6px;padding:8px 12px;background:rgba(56,189,248,0.08);border-radius:8px;border:1px solid rgba(56,189,248,0.2);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:12px;color:var(--text2);font-weight:600;">💰 Gaji Pokok</span>
                    <span style="font-size:13px;font-weight:700;color:var(--text);">Rp 65.000</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:12px;color:var(--text2);font-weight:600;">🎁 Bonus</span>
                    <span style="font-size:13px;font-weight:700;color:#22C55E;">${bonusText}</span>
                </div>
                <div style="height:1px;background:rgba(56,189,248,0.2);margin:6px 0;"></div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:12px;color:var(--text2);font-weight:600;">💼 Gaji Hari Ini</span>
                    <span style="font-size:15px;font-weight:800;color:var(--blue);">${formatRupiah(65000 + tier.bonus)}</span>
                </div>
            </div>
            ${hasDetail ? `
            <div class="hi-detail-toggle" id="toggle-${detailId}" onclick="toggleHistoryDetail('${detailId}')">
                <span>📋 Lihat Detail Laporan</span>
                <span class="hdt-arrow">▼</span>
            </div>
            <div class="hi-detail-panel" id="${detailId}"></div>` : ''}`;
        listEl.appendChild(div);
    });
}

function toggleHistoryDetail(id) {
    const panel = document.getElementById(id);
    const toggle = document.getElementById('toggle-' + id);
    const isOpen = panel.classList.contains('open');

    if (isOpen) {
        panel.classList.remove('open');
        toggle.classList.remove('open');
        toggle.querySelector('span:first-child').textContent = '📋 Lihat Detail Laporan';
        return;
    }

    const tanggal = id.replace('hd-', '');
    const h = historyData.find(x => x.tanggal === tanggal);
    if (!h || !h.detail) return;

    const katLabel = { kopi: '☕ Kopi', slowktail: '🥤 Slowktail', tea: '🍵 Tea', everydays: '🧋 Everydays', snack: '🍟 Snack & Makanan' };
    const sorted = [...h.detail].sort((a, b) => b.totalHarga - a.totalHarga);

    panel.innerHTML = sorted.map(item => `
        <div class="hi-detail-item">
            <span class="hi-di-kat ${item.kategori}">${katLabel[item.kategori] || item.kategori}</span>
            <div class="hi-di-info">
                <div class="hi-di-name">${item.nama}</div>
                <div class="hi-di-sub">${item.jumlah} ${item.pcs === 1 ? 'pcs' : 'porsi'} × ${formatRupiah(item.harga)} · ${item.totalPcs} pcs</div>
            </div>
            <div class="hi-di-total">${formatRupiah(item.totalHarga)}</div>
        </div>`).join('') +
        `<div class="hi-detail-footer">
            <span>📦 Total ${h.pcs} pcs · ${h.items} menu</span>
            <span>${formatRupiah(h.omset)}</span>
        </div>`;

    panel.classList.add('open');
    toggle.classList.add('open');
    toggle.querySelector('span:first-child').textContent = '📋 Sembunyikan Detail';
}

function resetHfFilter() {
    hfLokasiVal = ''; hfBulanVal = '';
    document.getElementById('hfLokasiLabel').textContent = '🏪 Semua Lokasi';
    document.getElementById('hfBulanLabel').textContent = '📅 Semua Bulan';
    document.getElementById('hfLokasiTrigger').classList.remove('hf-active');
    document.getElementById('hfBulanTrigger').classList.remove('hf-active');
    buildHistoryFilters();
    applyHistoryFilter();
}

function toggleQris() {
    const box = document.getElementById('qrisBox');
    if (!box) return;
    const isOpen = box.style.display !== 'none';
    box.style.display = isOpen ? 'none' : 'block';
    const btn = document.querySelector('.dev-support-qris');
    if (btn) btn.textContent = isOpen ? '📱 Bayar via QRIS' : '✕ Tutup QRIS';
}

// ===== QRIS FULLSCREEN =====

function bukaQrisFullscreen() {
    document.getElementById('qrisOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function tutupQrisFullscreen() {
    document.getElementById('qrisOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== KASIR (Point of Sale) =====
let kasirCart = [];
let kasirTrx = [];
let kasirTrxCounter = 0;
let kasirMetode = null;
let kasirView = 'katalog';
let kasirFilterKategori = '';

const KASIR_KAT = {
    kopi: { label: 'Kopi', icon: '☕' },
    slowktail: { label: 'Slowktail', icon: '🥤' },
    tea: { label: 'Tea', icon: '🍵' },
    everydays: { label: 'Everydays', icon: '🧋' },
    snack: { label: 'Snack & Makanan', icon: '🍟' }
};
const KASIR_METODE = {
    QRIS:     { icon: '\ud83d\udcf1', desc: 'Scan kode QR untuk bayar sesuai total.' },
    Tunai:    { icon: '\ud83d\udcb5', desc: 'Pelanggan bayar dengan uang tunai.' },
    Transfer: { icon: '\ud83c\udfe6', desc: 'Pembayaran transfer ke rekening.' }
};

function bukaKasir() {
    document.getElementById('kasirSearch').value = '';
    kasirFilterKategori = '';
    document.querySelectorAll('#kasirChips .kasir-chip').forEach(c => c.classList.toggle('active', c.dataset.kat === ''));
    kasirGoTo('katalog');
    document.getElementById('kasirOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function tutupKasir() {
    document.getElementById('kasirOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function kasirBack() {
    if (kasirView === 'detail') kasirGoTo('katalog');
    else if (kasirView === 'bayar') kasirGoTo('detail');
    else if (kasirView === 'sukses' || kasirView === 'riwayat') kasirGoTo('katalog');
    else tutupKasir();
}

function kasirGoTo(view) {
    kasirView = view;
    const titles = { katalog: '\ud83e\uddfe Kasir', detail: 'Detail Pesanan', bayar: 'Metode Pembayaran', sukses: 'Transaksi Berhasil', riwayat: 'Riwayat Transaksi' };
    document.getElementById('kasirTitle').textContent = titles[view] || 'Kasir';
    ['katalog','detail','bayar','sukses','riwayat'].forEach(v => {
        const el = document.getElementById('kasirView' + v.charAt(0).toUpperCase() + v.slice(1));
        if (el) el.style.display = v === view ? 'flex' : 'none';
    });
    const rwBtn = document.getElementById('kasirRiwayatBtn');
    if (rwBtn) rwBtn.style.visibility = view === 'katalog' ? 'visible' : 'hidden';
    if (view === 'katalog') { renderKasirKatalog(); updateKasirCartBar(); }
    if (view === 'detail') renderKasirDetail();
    if (view === 'bayar') renderKasirBayar();
    if (view === 'riwayat') renderKasirRiwayat();
}

function kasirFilterKat(kat, el) {
    kasirFilterKategori = kat;
    document.querySelectorAll('#kasirChips .kasir-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderKasirKatalog();
}

function kasirQty(kat, idx) {
    const it = kasirCart.find(c => c.kat === kat && c.idx === idx);
    return it ? it.jumlah : 0;
}

function renderKasirKatalog() {
    const list = document.getElementById('kasirProdukList');
    const q = (document.getElementById('kasirSearch').value || '').toLowerCase();
    let html = '';
    Object.keys(menuData).forEach(kat => {
        if (kasirFilterKategori && kat !== kasirFilterKategori) return;
        menuData[kat].forEach((m, idx) => {
            if (q && !m.nama.toLowerCase().includes(q)) return;
            const info = KASIR_KAT[kat] || { label: kat, icon: '\ud83e\udd5f' };
            const qty = kasirQty(kat, idx);
            const act = qty > 0
                ? `<div class="kasir-qty"><button class="kasir-qty-btn" onclick="kasirDec('${kat}',${idx})">\u2212</button><span class="kasir-qty-val">${qty}</span><button class="kasir-qty-btn plus" onclick="kasirInc('${kat}',${idx})">\uff0b</button></div>`
                : `<button class="kasir-tambah-btn" onclick="kasirInc('${kat}',${idx})">\uff0b Tambah</button>`;
            html += `<div class="kasir-produk">
                <div class="kasir-produk-icon">${info.icon}</div>
                <div class="kasir-produk-info">
                    <div class="kasir-produk-nama">${m.nama}</div>
                    <div class="kasir-produk-harga">${formatRupiah(m.harga)}</div>
                    <div class="kasir-produk-kat">${info.label} \u00b7 ${m.pcs} pcs/porsi</div>
                </div>
                <div class="kasir-produk-act">${act}</div>
            </div>`;
        });
    });
    list.innerHTML = html || `<div class="empty-state"><div class="es-icon">\ud83d\udd0d</div><div class="es-title">Produk tidak ditemukan</div><div class="es-msg">Coba kata kunci lain</div></div>`;
}

function kasirInc(kat, idx) {
    const m = menuData[kat][idx];
    const it = kasirCart.find(c => c.kat === kat && c.idx === idx);
    if (it) it.jumlah++;
    else kasirCart.push({ kat, idx, nama: m.nama, harga: m.harga, pcs: m.pcs, jumlah: 1, catatan: '' });
    if (kasirView === 'katalog') renderKasirKatalog();
    if (kasirView === 'detail') renderKasirDetail();
    updateKasirCartBar();
}

function kasirDec(kat, idx) {
    const i = kasirCart.findIndex(c => c.kat === kat && c.idx === idx);
    if (i < 0) return;
    kasirCart[i].jumlah--;
    if (kasirCart[i].jumlah <= 0) kasirCart.splice(i, 1);
    if (kasirView === 'katalog') renderKasirKatalog();
    if (kasirView === 'detail') renderKasirDetail();
    updateKasirCartBar();
}

function kasirSetCatatan(kat, idx, val) {
    const it = kasirCart.find(c => c.kat === kat && c.idx === idx);
    if (it) it.catatan = val;
}

function kasirTotal() { return kasirCart.reduce((s, i) => s + i.harga * i.jumlah, 0); }
function kasirTotalItem() { return kasirCart.reduce((s, i) => s + i.jumlah, 0); }

function updateKasirCartBar() {
    const bar = document.getElementById('kasirCartBar');
    if (!bar) return;
    if (kasirCart.length === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    document.getElementById('kasirCartBadge').textContent = kasirTotalItem();
    document.getElementById('kasirCartTotal').textContent = formatRupiah(kasirTotal());
}

function renderKasirDetail() {
    const list = document.getElementById('kasirDetailList');
    document.getElementById('kasirDetailCount').textContent = kasirCart.length ? kasirCart.length + ' Produk' : '';
    if (kasirCart.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="es-icon">\ud83d\uded2</div><div class="es-title">Keranjang Kosong</div><div class="es-msg">Tambahkan pesanan dulu</div></div>`;
    } else {
        list.innerHTML = kasirCart.map(it => `
            <div class="kasir-cart-item">
                <div class="kci-top"><div class="kci-nama">${it.nama}</div><div class="kci-harga">${formatRupiah(it.harga)}</div></div>
                <input type="text" class="kci-catatan" placeholder="Catatan (opsional)" maxlength="100" value="${(it.catatan || '').replace(/"/g, '&quot;')}" oninput="kasirSetCatatan('${it.kat}',${it.idx},this.value)">
                <div class="kci-bottom">
                    <div class="kci-sub">Subtotal: <b>${formatRupiah(it.harga * it.jumlah)}</b></div>
                    <div class="kasir-qty"><button class="kasir-qty-btn" onclick="kasirDec('${it.kat}',${it.idx})">\u2212</button><span class="kasir-qty-val">${it.jumlah}</span><button class="kasir-qty-btn plus" onclick="kasirInc('${it.kat}',${it.idx})">\uff0b</button></div>
                </div>
            </div>`).join('');
    }
    document.getElementById('kasirDetailSubtotal').textContent = formatRupiah(kasirTotal());
}

function renderKasirBayar() {
    if (kasirCart.length === 0) { kasirGoTo('katalog'); return showToast('Keranjang masih kosong!', 'error'); }
    const nama = (document.getElementById('kasirNamaPelanggan').value || '').trim() || 'Konsumen';
    const items = kasirCart.map(it => `<div class="kb-item"><span>${it.jumlah}x&nbsp;&nbsp;${it.nama}</span><b>${formatRupiah(it.harga * it.jumlah)}</b></div>`).join('');
    const metode = Object.keys(KASIR_METODE).map(m => `
        <div class="kasir-metode ${kasirMetode === m ? 'selected' : ''}" onclick="kasirPilihMetode('${m}')">
            <div class="kasir-metode-icon">${KASIR_METODE[m].icon}</div>
            <div class="kasir-metode-info"><div class="kasir-metode-nama">${m}</div><div class="kasir-metode-desc">${KASIR_METODE[m].desc}</div></div>
            <div class="kasir-radio ${kasirMetode === m ? 'on' : ''}"></div>
        </div>`).join('');
    document.getElementById('kasirBayarContent').innerHTML = `
        <div class="kasir-section-title">Data Pelanggan</div>
        <div class="kb-row"><span>Nama</span><b>${nama}</b></div>
        <div class="kasir-section-title" style="margin-top:16px;">Ringkasan</div>
        ${items}
        <div class="kb-row kb-line"><span>Sub Total</span><b>${formatRupiah(kasirTotal())}</b></div>
        <div class="kb-row kb-total"><span>TOTAL</span><b>${formatRupiah(kasirTotal())}</b></div>
        <div class="kasir-section-title" style="margin-top:16px;">Metode Pembayaran</div>
        <div class="kasir-metode-wrap">${metode}</div>`;
    document.getElementById('kasirBayarBtn').disabled = !kasirMetode;
}

function kasirPilihMetode(m) { kasirMetode = m; renderKasirBayar(); }

function kasirSelesaikanTransaksi() {
    if (kasirCart.length === 0) return showToast('Keranjang masih kosong!', 'error');
    if (!kasirMetode) return showToast('Pilih metode pembayaran dulu!', 'error');

    // Catat ke pembukuan lewat jalur yang sama dengan Catat Penjualan
    kasirCart.forEach(it => _recordSale({ nama: it.nama, harga: it.harga, pcs: it.pcs }, it.kat, it.jumlah));
    scheduleSave(); updateQuickSummary(); updateStockDisplay(); cekBonusTierNotif();

    const trx = {
        id: ++kasirTrxCounter,
        waktu: new Date().toISOString(),
        tanggal: getTodayLocal(),
        pelanggan: (document.getElementById('kasirNamaPelanggan').value || '').trim() || 'Konsumen',
        metode: kasirMetode,
        total: kasirTotal(),
        totalItem: kasirTotalItem(),
        items: kasirCart.map(it => ({ nama: it.nama, jumlah: it.jumlah, harga: it.harga, totalHarga: it.harga * it.jumlah, catatan: it.catatan || '' }))
    };
    kasirTrx.unshift(trx);
    saveKasirToStorage();

    const metodeTerpakai = kasirMetode;
    kasirCart = [];
    kasirMetode = null;
    document.getElementById('kasirNamaPelanggan').value = '';
    updateKasirCartBar();
    renderKasirSukses(trx, metodeTerpakai);
    kasirGoTo('sukses');
    showToast('\u2705 Transaksi tercatat ke pembukuan!', 'success');
}

function renderKasirSukses(trx, metode) {
    const qrisBtn = metode === 'QRIS' ? `<button class="kasir-primary-btn" onclick="bukaQrisFullscreen()">\ud83d\udcf1 Tampilkan QRIS</button>` : '';
    document.getElementById('kasirSuksesContent').innerHTML = `
        <div class="kasir-sukses-icon">\u2705</div>
        <div class="kasir-sukses-title">Transaksi Berhasil!</div>
        <div class="kasir-sukses-total">${formatRupiah(trx.total)}</div>
        <div class="kasir-sukses-meta">${trx.pelanggan} \u00b7 ${trx.totalItem} item \u00b7 ${(KASIR_METODE[metode] || {}).icon || ''} ${metode}</div>
        <div class="kasir-sukses-btns">
            ${qrisBtn}
            <button class="kasir-secondary-btn" onclick="kasirGoTo('katalog')">\ud83e\uddfe Transaksi Baru</button>
            <button class="kasir-ghost-btn" onclick="tutupKasir()">Tutup Kasir</button>
        </div>`;
}

function renderKasirRiwayat() {
    const el = document.getElementById('kasirRiwayatList');
    if (kasirTrx.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">\ud83e\uddfe</div><div class="es-title">Belum Ada Transaksi</div><div class="es-msg">Transaksi kasir akan muncul di sini</div></div>`;
        return;
    }
    el.innerHTML = kasirTrx.map(t => {
        const d = new Date(t.waktu);
        const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const items = t.items.map(i => `<div class="krw-item"><span>${i.jumlah}x ${i.nama}</span><span>${formatRupiah(i.totalHarga)}</span></div>`).join('');
        return `<div class="krw-card">
            <div class="krw-head">
                <div><div class="krw-nama">${t.pelanggan}</div><div class="krw-time">${tgl} \u00b7 ${jam}</div></div>
                <div class="krw-right"><div class="krw-total">${formatRupiah(t.total)}</div><span class="krw-metode">${(KASIR_METODE[t.metode] || { icon: '\ud83d\udcb3' }).icon} ${t.metode}</span></div>
            </div>
            <div class="krw-items">${items}</div>
        </div>`;
    }).join('');
}

function saveKasirToStorage() { try { localStorage.setItem('dimsumKasirTrx', JSON.stringify({ kasirTrx, kasirTrxCounter })); } catch {} }
function loadKasirFromStorage() { try { const d = JSON.parse(localStorage.getItem('dimsumKasirTrx') || '{}'); kasirTrx = d.kasirTrx || []; kasirTrxCounter = d.kasirTrxCounter || 0; } catch {} }

// ===== BONUS TIER NOTIFIKASI =====
let lastBonusTier = null;

function cekBonusTierNotif() {
    const omset = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
    const tier = BONUS_TIERS.find(t => omset >= t.min && omset <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
    if (lastBonusTier !== null && tier.bonus !== lastBonusTier && tier.bonus > lastBonusTier) {
        showToast('🎉 Bonus naik! Sekarang +' + formatRupiah(tier.bonus) + ' · ' + tier.label, 'success');
    }
    lastBonusTier = tier.bonus;
}

// ===== COPY REKAP =====
function copyRekapClipboard() {
    const now = new Date();
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][now.getMonth()];
    const tahun = now.getFullYear();

    if (historyData.length === 0) {
        showToast('Belum ada history untuk direkap!', 'error');
        return;
    }

    // Urutkan dari terlama ke terbaru
    const sorted = [...historyData].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    let totalOmset = 0;
    let totalGajiMinggu = 0;

    let teks = `📊 *Rekap Ramayana - ${bulan} ${tahun}*\n`;
    teks += `━━━━━━━━━━━━━━\n`;

    sorted.forEach(h => {
        const d = new Date(h.tanggal);
        const namaHari = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][d.getDay()];
        const tgl = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][d.getMonth()];
        const tier = BONUS_TIERS.find(t => h.omset >= t.min && h.omset <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
        const gaji = 65000 + tier.bonus;
        totalOmset += h.omset;
        totalGajiMinggu += gaji;

        teks += `📅 *${namaHari}, ${tgl}*\n`;
        teks += `🏪 Omset: ${formatRupiah(h.omset)} · 📦 ${h.pcs} pcs\n`;
        teks += `💼 Gaji: ${formatRupiah(gaji)}`;
        if (tier.bonus > 0) teks += ` (Bonus +${formatRupiah(tier.bonus)})`;
        teks += `\n━━━━━━━━━━━━━━\n`;
    });

    teks += `📦 Total Omset: *${formatRupiah(totalOmset)}*\n`;
    teks += `💼 Total Gaji: *${formatRupiah(totalGajiMinggu)}*\n`;
    teks += `━━━━━━━━━━━━━━\n`;
    teks += `_Pembukuan Dimsum · By Farrel_`;

    navigator.clipboard.writeText(teks)
        .then(() => showToast('📋 Rekap ' + sorted.length + ' hari berhasil dicopy!', 'success'))
        .catch(() => {
            const ta = document.createElement('textarea');
            ta.value = teks; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('📋 Rekap berhasil dicopy!', 'success');
        });
}

// ===== TOTAL GAJI MINGGUAN =====
function updateTotalGajiMinggu() {
    const row = document.getElementById('hscGajiRow');
    const el = document.getElementById('hscTotalGaji');
    if (!row || !el) return;
    if (historyData.length === 0) { row.style.display = 'none'; return; }
    const total = historyData.reduce((s, h) => {
        const tier = BONUS_TIERS.find(t => h.omset >= t.min && h.omset <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
        return s + 65000 + tier.bonus;
    }, 0);
    el.textContent = formatRupiah(total);
    row.style.display = 'block';
}



// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    function startApp() {
        loadTheme(); updateDate(); setInterval(updateDate, 60000);
        const jumlahEl = document.getElementById('jumlah');
        if (jumlahEl) { jumlahEl.addEventListener('input', updatePreviewTotal); jumlahEl.addEventListener('keydown', handleJumlahKeydown); }
        const hasData = loadPenjualanFromStorage();
        loadStockFromStorage(); loadKasFromStorage(); loadClosingInput(); loadHistoryFromStorage(); loadTransferHistory(); loadKasirFromStorage();
        updateQuickSummary(); updateStockDisplay(); updateKasDisplay();
        cekNotifikasiSenin();
        // init bonus tier tracker
        const omsetAwal = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
        const tierAwal = BONUS_TIERS.find(t => omsetAwal >= t.min && omsetAwal <= t.max) || BONUS_TIERS[BONUS_TIERS.length-1];
        lastBonusTier = tierAwal.bonus;
        if (hasData && penjualanData.length > 0) {
            const totalRp = penjualanData.reduce((s, i) => s + i.totalHarga, 0);
            showToast(`Data dimuat: ${penjualanData.length} item · ${formatRupiah(totalRp)}`, 'success');
            updateMiniStats(totalRp, penjualanData.reduce((s, i) => s + i.totalPcs, 0));
        }
        setInterval(() => { if (penjualanData.length > 0) savePenjualanToStorage(); }, 30000);
        setTimeout(() => document.getElementById('kategori')?.focus(), 300);
    }

    // Tunggu login anonim + restore data dari Firestore (kalau localStorage kosong) sebelum mulai
    if (window.__firebaseSync) {
        window.__firebaseSync.init(startApp);
    } else {
        startApp(); // fallback: Firebase gagal dimuat, tetap jalan pakai localStorage biasa
    }
});
