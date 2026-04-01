/**
 * neu.d.ts — Official Type Definitions for Neu Runtime Engine
 * Framework: Vite + Vanilla + Capacitor v7
 * Author: @neufa by Ulywae
 */

export interface NeuRouterConfig {
    root: string;
    biosStyle?: boolean;
    loaderStyle?: number;
    fallback?: string;
}

export interface NeuEngine {
    /** Versi runtime Neu saat ini */
    version: string;
    /** Timestamp build saat ini */
    build: string;

    // --- Page System ---
    /** Ganti halaman aktif dengan data opsional */
    switchPage: (name: string, data?: any) => Promise<void>;
    /** Refresh halaman dengan menghancurkan instance lama (destroy + re-init) */
    coldRefreshPage: () => Promise<void>;
    /** Refresh halaman tanpa menghancurkan instance */
    hotRefreshPage: () => void;
    /** Normalisasi nama halaman agar sesuai standar Neu */
    normalizeName: (name: string) => string;
    /** Menetapkan nama halaman yang menjadi root/utama */
    setRootName: (name: string) => void;
    /** Mengambil nama halaman yang sedang aktif */
    getActivePage: () => string;
    /** Mengambil objek instance halaman saat ini */
    getCurrentPage: () => any;
    /** Mengambil nama root page yang terdaftar */
    getRootName: () => string;

    // --- Slot System ---
    /** Import slot DOM (otomatis ditangani oleh runtime) */
    importSlots: (slots: any[]) => void;

    // --- Engine & Loop ---
    /** Akses ke objek engine utama runtime */
    engine: any;
    /** Akses ke objek loop utama runtime */
    loop: any;
    /** Objek runtime internal */
    runtime: any;
    /** Mengambil waktu loop saat ini dalam milidetik (Arduino Style) */
    millis: () => number;
    /** Mengambil waktu loop saat ini dalam mikrodetik (High Precision) */
    micros: () => number;

    // --- Events ---
    /** Mendaftarkan event listener ke runtime atau halaman spesifik */
    on: (event: string, callback: (...args: any[]) => void, options?: { page?: string }) => void;
    /** Menghapus event listener */
    off: (event: string, callback: Function) => void;
    /** Memicu/Emit event manual ke sistem */
    emit: (event: string, ...args: any[]) => void;
    /** Event listener yang hanya berjalan satu kali saja */
    once: (event: string, callback: Function) => void;
    /** Menetapkan scope event ke halaman tertentu */
    setEventPage: (pageName: string) => void;
    /** Membersihkan semua listener yang terikat pada halaman tertentu */
    clearPageListeners: (pageName: string) => void;
    /** State global yang tersimpan di dalam runtime */
    state: any;
    /** Mendaftarkan daftar halaman yang tidak boleh dihancurkan (whitelist) */
    setWhitelist: (pages: string[]) => void;

    // --- Router Utilities ---
    /** Melakukan konfigurasi router (root, style, dll) */
    configRouter: (config: NeuRouterConfig) => void;
    /** Menyuntikkan/Inject halaman ke dalam router */
    injectPage: () => Promise<void>;
    /** Memulai ulang sistem router */
    routerRestart: () => void;
    /** Menjalankan router untuk pertama kali */
    routerStart: () => Promise<void>;
    /** Navigasi ke halaman tertentu berdasarkan nama/ID */
    navigate: (target: string) => void;
    /** Reload lokasi/halaman saat ini */
    locationReload: () => void;
    /** Mengambil konfigurasi router yang sedang aktif */
    getRouterConfig: () => NeuRouterConfig;
    /** Menambahkan middleware ke dalam jalur navigasi router */
    middleware: (fn: (ctx: any, next: Function) => void) => void;
    /** Navigasi ke halaman secara acak dari daftar yang tersedia */
    switcherRandomPage: () => void;

    // --- Cache / Page Memory ---
    /** Menyuntikkan halaman dengan sistem antrean (queue) */
    injectWithQueue: (pages: string[]) => void;
    /** Membersihkan seluruh cache halaman di memori */
    clearCache: () => void;
    /** Menetapkan daftar halaman yang diizinkan untuk di-cache */
    setCachePage: (pages: string[]) => void;
    /** Mengatur kapasitas maksimum cache halaman */
    setMaxCache: (limit: number) => void;

    // --- DOM Utilities ---
    /** Helper manipulasi DOM dengan scope halaman aktif */
    dom: any;
    /** Helper manipulasi DOM global (seperti jQuery/$$) */
    $$: any;

    // --- Debug & Logger ---
    debug: {
        /** Cek apakah mode debug sedang aktif */
        get: () => boolean;
        /** Mengaktifkan atau menonaktifkan mode debug floating console */
        set: (value: boolean) => void;
        /** Mencetak log standar ke konsol Neu */
        log: (...args: any[]) => void;
        /** Mencetak log informasi (biru) */
        info: (...args: any[]) => void;
        /** Mencetak log peringatan (kuning) */
        warn: (...args: any[]) => void;
        /** Mencetak log error (merah) */
        error: (...args: any[]) => void;
    };

    // --- Plugin System ---
    /** Memasang plugin tambahan ke dalam Neu Engine */
    use: (plugin: any) => void;

    // --- Lifecycle ---
    /** Callback yang akan dieksekusi saat runtime Neu sudah siap */
    ready: (callback: () => Promise<void>) => void;

    /** Menampilkan bantuan/daftar API yang tersedia di konsol */
    help: () => void;
}

/** Global Instance of Neu Engine */
declare const neu: NeuEngine;
/** Global DOM Scoped Helper */
export const dom: any;
/** Global DOM Selector Helper ($$) */
export const $$: any;
/** Current Router Instance */
export const router: any;
/** Current App Instance */
export const app: any;

export default neu;
