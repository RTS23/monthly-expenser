export const id = {
    // Navigasi
    nav: {
        dashboard: 'Beranda',
        expenses: 'Pengeluaran',
        budget: 'Kelola Anggaran',
        settings: 'Pengaturan'
    },

    // Beranda
    dashboard: {
        title: 'Beranda',
        subtitle: 'Lacak pengeluaranmu dengan efektif.',
        monthlyBudget: 'Anggaran Bulanan',
        totalSpent: 'Total Terpakai',
        remaining: 'Sisa',
        definedLimit: 'Batas yang ditentukan',
        budgetUsed: 'anggaran terpakai',
        recentActivity: 'Aktivitas Terakhir Saya',
        addExpense: 'Tambah Pengeluaran',
        recentGroupActivity: 'Aktivitas Grup Terbaru'
    },

    // Pengeluaran
    expenses: {
        title: 'Semua Pengeluaran',
        recentTransactions: 'Transaksi Terbaru',
        items: 'item',
        export: 'Ekspor',
        noExpenses: 'Belum ada pengeluaran',
        noExpensesDesc: 'Mulai lacak pengeluaranmu dengan menambahkan pengeluaran pertama.',
        deleteExpense: 'Hapus pengeluaran'
    },

    // Form Tambah Pengeluaran
    addExpenseForm: {
        title: 'Tambah Pengeluaran',
        amount: 'Jumlah',
        category: 'Kategori',
        description: 'Deskripsi',
        addButton: 'Tambah Pengeluaran',
        placeholder: {
            amount: 'Masukkan jumlah',
            description: 'Untuk apa pengeluaranmu?'
        }
    },

    // Kategori
    categories: {
        Food: 'Makanan',
        Shopping: 'Belanja',
        Housing: 'Tempat Tinggal',
        Transport: 'Transportasi',
        Utilities: 'Utilitas',
        Entertainment: 'Hiburan',
        Other: 'Lainnya'
    },

    // Anggaran
    budget: {
        title: 'Pengaturan Anggaran',
        currentBudget: 'Anggaran Saat Ini',
        newBudget: 'Anggaran Baru',
        updateButton: 'Perbarui Anggaran',
        perMonth: 'per bulan',
        addTitle: 'Tambah Anggaran',
        editTitle: 'Edit Anggaran',
        noBudget: 'Belum ada anggaran',
        cancel: 'Batal',
        save: 'Simpan',
        setMode: 'Atur Anggaran',
        addMode: 'Tambah Dana',
        current: 'Saat Ini',
        add: 'Tambah',
        newTotal: 'Total Baru'
    },

    // Pengaturan
    settings: {
        title: 'Pengaturan',
        language: 'Bahasa',
        currency: 'Mata Uang',
        english: 'Inggris',
        indonesian: 'Indonesia'
    },

    // Analitik
    analytics: {
        spendingByCategory: 'Pengeluaran per Kategori',
        spendingTrend: 'Tren Pengeluaran (Kumulatif)',
        topSpenders: 'Penghabis Terbanyak',
        groupSpending: 'Pengeluaran Grup',
        categories: 'Kategori',
        totalSpent: 'Total Terpakai'
    },

    // Auth
    auth: {
        tagline: 'Lacak pengeluaran. Sinkron dengan Discord. Tetap sesuai anggaran.',
        loginWithDiscord: 'Masuk dengan Discord',
        signedInAs: 'Masuk sebagai',
        logOut: 'Keluar',
        online: 'Aktif'
    },

    // Filter
    filters: {
        allTime: 'Semua Waktu',
        allUsers: 'Semua Pengguna',
        today: 'Hari Ini',
        thisWeek: 'Minggu Ini',
        thisMonth: 'Bulan Ini',
        last30Days: '30 Hari Terakhir',
        allCategories: 'Semua Kategori',
        category: 'Kategori',
        dateRange: 'Rentang Tanggal',
        amountRange: 'Rentang Jumlah',
        clearAll: 'Hapus Semua',
        filters: 'Filter',
        search: 'Cari pengeluaran...'
    },

    // Notifikasi
    toasts: {
        budgetWarning: 'Kamu sudah menggunakan 80% anggaran bulan ini.',
        budgetExceeded: 'Kamu sudah melebihi anggaran bulan ini!'
    },

    // Tur Aplikasi
    tour: {
        welcome: 'Selamat Datang di Etoile! 👋',
        intro: 'Mari ikuti tur singkat.',
        mobile: {
            step1: '👋 Halo! Tekan tombol + untuk catat pengeluaran.',
            step2: '📊 Statistik anggaranmu ada di atas.',
            step3: '🔍 Gunakan pencarian untuk filter. Selesai!'
        },
        desktop: {
            add: '➕ Klik di sini untuk tambah pengeluaran.',
            stats: '📊 Ringkasan pengeluaranmu sekilas.',
            budget: '💰 Atur batas anggaranmu di sini.',
            filters: '🔍 Cari dan filter pengeluaran. Selesai!'
        }
    }
};
