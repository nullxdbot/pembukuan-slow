// ===== FIREBASE CONFIG & SYNC HELPER (versi compat, aman untuk WebView Android) =====
// Project: pembukuan-slow
// Wajib load setelah: firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js

// ===== SAFE INIT: kalau CDN Firebase gagal dimuat (no internet / diblokir),
// jangan crash — biarkan window.__firebaseSync gak ke-set, script.js otomatis fallback offline =====
try {
    if (typeof firebase === 'undefined') {
        throw new Error('SDK Firebase tidak termuat (kemungkinan tidak ada koneksi internet).');
    }

    const firebaseConfig = {
        apiKey: "AIzaSyDmQ2eVxc-WxpcrpV9vA2FSPuQxEinqb-A",
        authDomain: "pembukuan-slow.firebaseapp.com",
        projectId: "pembukuan-slow",
        storageBucket: "pembukuan-slow.firebasestorage.app",
        messagingSenderId: "858515183995",
        appId: "1:858515183995:web:cf03959081509228c345de"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Semua key localStorage yang dipakai app ini, akan disinkronkan ke Firestore
    const SYNCED_KEYS = [
        'dimsumData', 'dimsumStock', 'dimsumKas', 'dimsumHistory',
        'dimsumKasirTrx', 'dimsumClosing',
        'rekapMingguan', 'accentTheme', 'lastSeninNotif'
    ];

    let currentUid = null;
    let syncReady = false;
    let pendingWrites = {};
    let debounceTimer = null;

    // ===== INIT: login anonim, lalu restore data kalau localStorage kosong =====
    function initFirebaseSync(onDoneCallback) {
        // Timeout jaga-jaga: kalau auth gak respon dalam 8 detik (koneksi lambat/mati),
        // tetap lanjut jalanin app pakai localStorage aja, jangan biarin user nunggu selamanya
        let doneCalled = false;
        const safeDone = () => { if (!doneCalled) { doneCalled = true; if (onDoneCallback) onDoneCallback(); } };
        const timeoutId = setTimeout(safeDone, 8000);

        try {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    currentUid = user.uid;
                    await restoreFromFirestoreIfNeeded();
                    syncReady = true;
                    syncAllToFirestore(); // dorong semua data lokal ke cloud sekali tiap start
                    clearTimeout(timeoutId);
                    safeDone();
                } else {
                    auth.signInAnonymously().catch((err) => {
                        console.error('Firebase anonymous sign-in gagal:', err);
                        clearTimeout(timeoutId);
                        safeDone(); // tetap jalan pakai localStorage aja
                    });
                }
            });
        } catch (err) {
            console.error('Firebase auth error:', err);
            clearTimeout(timeoutId);
            safeDone();
        }
    }

    // ===== RESTORE: kalau localStorage kosong tapi Firestore ada data =====
    async function restoreFromFirestoreIfNeeded() {
        for (const key of SYNCED_KEYS) {
            const localVal = localStorage.getItem(key);
            if (localVal !== null) continue;

            try {
                const snap = await db.collection('users').doc(currentUid).collection('data').doc(key).get();
                if (snap.exists) {
                    const remoteVal = snap.data().value;
                    if (remoteVal !== undefined && remoteVal !== null) {
                        localStorage.setItem(key, remoteVal);
                    }
                }
            } catch (err) {
                console.error('Gagal restore key ' + key + ':', err);
            }
        }
    }

    // ===== SYNC: dipanggil tiap kali ada perubahan data, dengan debounce 800ms =====
    function syncToFirestore(key) {
        if (!syncReady || !currentUid) return;
        if (!SYNCED_KEYS.includes(key)) return;

        pendingWrites[key] = true;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(flushPendingWrites, 800);
    }

    async function flushPendingWrites() {
        const keys = Object.keys(pendingWrites);
        pendingWrites = {};
        for (const key of keys) {
            const val = localStorage.getItem(key);
            if (val === null) continue;
            try {
                await db.collection('users').doc(currentUid).collection('data').doc(key).set({
                    value: val,
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Gagal sync key ' + key + ' ke Firestore:', err);
            }
        }
    }

    function syncAllToFirestore() {
        SYNCED_KEYS.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                pendingWrites[key] = true;
            }
        });
        clearTimeout(debounceTimer);
        flushPendingWrites();
    }

    window.__firebaseSync = {
        init: initFirebaseSync,
        syncKey: syncToFirestore,
        syncAll: syncAllToFirestore,
        isReady: () => syncReady
    };

    // ===== AUTO-SYNC: tiap kali script.js manggil localStorage.setItem, otomatis ke-push ke Firestore =====
    const _origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
        _origSetItem(key, value);
        syncToFirestore(key);
    };

} catch (fatalErr) {
    // CDN gagal load / init gagal total → biarkan window.__firebaseSync tetap undefined.
    // script.js akan otomatis fallback ke mode localStorage biasa (offline), tanpa error ke user.
    console.warn('Firebase sync tidak aktif (mode offline):', fatalErr.message);
}
