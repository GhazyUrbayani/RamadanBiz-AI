// ============================================================
// MOCK DATA SINTETIS — RamadanBiz AI Demo Mode
// Semua data di bawah adalah FIKTIF untuk keperluan demo
// ============================================================

export const MOCK_BALANCE = {
  balance: 5230000,
  currency: "IDR",
  last_updated: "2026-03-17T07:00:00+07:00",
};

export const MOCK_PRODUCTS = [
  { id: "prod_001", name: "Hampers Lebaran Premium", price: 350000, type: "physical", status: "active", sold: 47 },
  { id: "prod_002", name: "Hampers Lebaran Standard", price: 150000, type: "physical", status: "active", sold: 89 },
  { id: "prod_003", name: "Katering Sahur (10 pax)", price: 380000, type: "service", status: "active", sold: 23 },
  { id: "prod_004", name: "Katering Ifthar (10 pax)", price: 450000, type: "service", status: "active", sold: 31 },
  { id: "prod_005", name: "E-Book Resep Ramadan 2026", price: 75000, type: "digital", status: "active", sold: 134 },
  { id: "prod_006", name: "Kelas Memasak Online", price: 199000, type: "digital", status: "active", sold: 28 },
  { id: "prod_007", name: "Komunitas Premium UMKM", price: 99000, type: "membership", status: "active", sold: 56 },
  { id: "prod_008", name: "Kurma Ajwa Premium 500gr", price: 120000, type: "physical", status: "active", sold: 62 },
];

export const MOCK_CUSTOMERS = [
  { id: "cust_001", name: "Budi Santoso", email: "budi@gmail.com", phone: "08111234567", membership: "Komunitas Premium UMKM", tier: "Gold", total_transactions: 4, total_spent: 1175000 },
  { id: "cust_002", name: "Siti Rahayu", email: "siti@gmail.com", phone: "08222345678", membership: null, tier: null, total_transactions: 2, total_spent: 500000 },
  { id: "cust_003", name: "Ahmad Fauzi", email: "ahmad@yahoo.com", phone: "08333456789", membership: "Komunitas Premium UMKM", tier: "Silver", total_transactions: 3, total_spent: 828000 },
  { id: "cust_004", name: "Rina Dewi", email: "rina@gmail.com", phone: "08444567890", membership: null, tier: null, total_transactions: 5, total_spent: 1750000 },
  { id: "cust_005", name: "Yusuf Hakim", email: "yusuf@gmail.com", phone: "08555678901", membership: "Komunitas Premium UMKM", tier: "Gold", total_transactions: 6, total_spent: 2280000 },
  { id: "cust_006", name: "Diana Putri", email: "diana@gmail.com", phone: "08666789012", membership: null, tier: null, total_transactions: 1, total_spent: 199000 },
  { id: "cust_007", name: "Hendra Wijaya", email: "hendra@gmail.com", phone: "08777890123", membership: "Komunitas Premium UMKM", tier: "Basic", total_transactions: 2, total_spent: 449000 },
  { id: "cust_008", name: "Lestari Kusuma", email: "lestari@gmail.com", phone: "08888901234", membership: null, tier: null, total_transactions: 3, total_spent: 675000 },
];

export const MOCK_TRANSACTIONS = [
  { id: "trx_001", customer_name: "Rina Dewi", customer_email: "rina@gmail.com", product: "Hampers Lebaran Premium", amount: 350000, status: "paid", date: "2026-03-17T08:30:00+07:00" },
  { id: "trx_002", customer_name: "Yusuf Hakim", customer_email: "yusuf@gmail.com", product: "Katering Sahur (10 pax)", amount: 380000, status: "paid", date: "2026-03-17T07:15:00+07:00" },
  { id: "trx_003", customer_name: "Lestari Kusuma", customer_email: "lestari@gmail.com", product: "E-Book Resep Ramadan 2026", amount: 75000, status: "paid", date: "2026-03-17T06:45:00+07:00" },
  { id: "trx_004", customer_name: "Budi Santoso", customer_email: "budi@gmail.com", product: "Hampers Lebaran Standard", amount: 150000, status: "paid", date: "2026-03-16T20:00:00+07:00" },
  { id: "trx_005", customer_name: "Siti Rahayu", customer_email: "siti@gmail.com", product: "Katering Ifthar (10 pax)", amount: 450000, status: "paid", date: "2026-03-16T17:30:00+07:00" },
  { id: "trx_006", customer_name: "Ahmad Fauzi", customer_email: "ahmad@yahoo.com", product: "Kelas Memasak Online", amount: 199000, status: "paid", date: "2026-03-16T14:20:00+07:00" },
  { id: "trx_007", customer_name: "Hendra Wijaya", customer_email: "hendra@gmail.com", product: "Kurma Ajwa Premium 500gr", amount: 120000, status: "paid", date: "2026-03-15T11:00:00+07:00" },
  { id: "trx_008", customer_name: "Rina Dewi", customer_email: "rina@gmail.com", product: "Komunitas Premium UMKM", amount: 99000, status: "paid", date: "2026-03-15T09:30:00+07:00" },
  { id: "trx_009", customer_name: "Yusuf Hakim", customer_email: "yusuf@gmail.com", product: "Hampers Lebaran Premium", amount: 350000, status: "paid", date: "2026-03-14T16:00:00+07:00" },
  { id: "trx_010", customer_name: "Lestari Kusuma", customer_email: "lestari@gmail.com", product: "Hampers Lebaran Standard", amount: 150000, status: "paid", date: "2026-03-14T13:45:00+07:00" },
  { id: "trx_011", customer_name: "Budi Santoso", customer_email: "budi@gmail.com", product: "Katering Sahur (10 pax)", amount: 380000, status: "paid", date: "2026-03-13T08:00:00+07:00" },
  { id: "trx_012", customer_name: "Diana Putri", customer_email: "diana@gmail.com", product: "Kelas Memasak Online", amount: 199000, status: "paid", date: "2026-03-12T19:00:00+07:00" },
  { id: "trx_013", customer_name: "Siti Rahayu", customer_email: "siti@gmail.com", product: "E-Book Resep Ramadan 2026", amount: 75000, status: "paid", date: "2026-03-11T10:00:00+07:00" },
  { id: "trx_014", customer_name: "Yusuf Hakim", customer_email: "yusuf@gmail.com", product: "Kurma Ajwa Premium 500gr", amount: 120000, status: "paid", date: "2026-03-10T15:30:00+07:00" },
  { id: "trx_015", customer_name: "Ahmad Fauzi", customer_email: "ahmad@yahoo.com", product: "Hampers Lebaran Standard", amount: 150000, status: "paid", date: "2026-03-09T12:00:00+07:00" },
];

export const MOCK_UNPAID = [
  { id: "inv_001", customer_name: "Ahmad Fauzi", customer_email: "ahmad@yahoo.com", product: "Katering Ifthar (10 pax)", amount: 450000, status: "unpaid", created_at: "2026-03-12T10:00:00+07:00", due_date: "2026-03-19T10:00:00+07:00" },
  { id: "inv_002", customer_name: "Budi Santoso", customer_email: "budi@gmail.com", product: "Hampers Lebaran Premium", amount: 350000, status: "unpaid", created_at: "2026-03-14T14:00:00+07:00", due_date: "2026-03-21T14:00:00+07:00" },
  { id: "inv_003", customer_name: "Diana Putri", customer_email: "diana@gmail.com", product: "Komunitas Premium UMKM", amount: 99000, status: "unpaid", created_at: "2026-03-16T09:00:00+07:00", due_date: "2026-03-23T09:00:00+07:00" },
];

export const MOCK_MEMBERSHIP = [
  { customer_name: "Budi Santoso", email: "budi@gmail.com", product: "Komunitas Premium UMKM", tier: "Gold", joined: "2026-02-01", status: "active" },
  { customer_name: "Yusuf Hakim", email: "yusuf@gmail.com", product: "Komunitas Premium UMKM", tier: "Gold", joined: "2026-01-15", status: "active" },
  { customer_name: "Ahmad Fauzi", email: "ahmad@yahoo.com", product: "Komunitas Premium UMKM", tier: "Silver", joined: "2026-02-10", status: "active" },
  { customer_name: "Hendra Wijaya", email: "hendra@gmail.com", product: "Komunitas Premium UMKM", tier: "Basic", joined: "2026-03-01", status: "active" },
];
