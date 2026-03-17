import {
  MOCK_BALANCE,
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_TRANSACTIONS,
  MOCK_UNPAID,
  MOCK_MEMBERSHIP,
} from "./mock-data";

type ToolInput = Record<string, unknown>;

const fmt = (n: number) =>
  `Rp ${n.toLocaleString("id-ID")}`;

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
};

const filterByPeriod = (period: string) => {
  const now = new Date("2026-03-17T14:00:00+07:00");
  const start = new Date(now);
  if (period === "day") start.setHours(0, 0, 0, 0);
  else if (period === "week") { start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0); }
  else if (period === "month") start.setDate(1);
  else if (period === "year") { start.setMonth(0); start.setDate(1); }
  return MOCK_TRANSACTIONS.filter(t => new Date(t.date) >= start);
};

const filterByRange = (start_date: string, end_date: string) =>
  MOCK_TRANSACTIONS.filter(t => {
    const d = new Date(t.date);
    return d >= new Date(start_date) && d <= new Date(end_date + "T23:59:59");
  });

const filterUnpaidByRange = (start_date: string, end_date: string) =>
  MOCK_UNPAID.filter(t => {
    const d = new Date(t.created_at);
    return d >= new Date(start_date) && d <= new Date(end_date + "T23:59:59");
  });

const matchCustomer = (identifier: string) =>
  MOCK_TRANSACTIONS.filter(
    t =>
      t.customer_name.toLowerCase().includes(identifier.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(identifier.toLowerCase())
  );

const summarizeTrx = (trxList: typeof MOCK_TRANSACTIONS) => {
  const total = trxList.reduce((s, t) => s + t.amount, 0);
  return { transactions: trxList, total_amount: total, count: trxList.length };
};

let invoiceCounter = 100;

export async function executeMayarToolMock(
  toolName: string,
  input: ToolInput
): Promise<string> {
  await new Promise(r => setTimeout(r, 300)); // simulasi latency

  switch (toolName) {
    case "get_balance":
      return JSON.stringify({
        success: true,
        data: {
          balance: fmt(MOCK_BALANCE.balance),
          raw: MOCK_BALANCE.balance,
          currency: "IDR",
          last_updated: fmtDate(MOCK_BALANCE.last_updated),
          note: "[DEMO MODE — Data sintetis]",
        },
      });

    case "get_products":
      return JSON.stringify({
        success: true,
        data: MOCK_PRODUCTS.map(p => ({
          ...p,
          price_formatted: fmt(p.price),
        })),
        total: MOCK_PRODUCTS.length,
        note: "[DEMO MODE]",
      });

    case "get_customer_detail": {
      const q = ((input.name || input.email) as string || "").toLowerCase();
      const found = MOCK_CUSTOMERS.find(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
      if (!found)
        return JSON.stringify({ success: false, error: "Customer tidak ditemukan.", note: "[DEMO MODE]" });
      return JSON.stringify({ success: true, data: { ...found, total_spent_formatted: fmt(found.total_spent) }, note: "[DEMO MODE]" });
    }

    case "send_portal_link": {
      const email = input.customer_email as string;
      const cust = MOCK_CUSTOMERS.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (!cust)
        return JSON.stringify({ success: false, error: `Email ${email} tidak ditemukan.`, note: "[DEMO MODE]" });
      return JSON.stringify({
        success: true,
        message: `Portal link berhasil dikirim ke ${email}`,
        portal_url: `https://mayar.id/portal/demo-${cust.id}`,
        note: "[DEMO MODE — link tidak aktif]",
      });
    }

    case "create_invoice": {
      invoiceCounter++;
      const invId = `INV-DEMO-${invoiceCounter}`;
      return JSON.stringify({
        success: true,
        data: {
          invoice_id: invId,
          customer_name: input.customer_name,
          customer_email: input.customer_email || "-",
          product_name: input.product_name,
          amount: fmt(input.amount as number),
          raw_amount: input.amount,
          status: "unpaid",
          invoice_url: `https://mayar.id/invoice/${invId}`,
          created_at: fmtDate(new Date().toISOString()),
        },
        note: "[DEMO MODE — invoice tidak nyata]",
      });
    }

    case "get_latest_transactions": {
      const limit = (input.limit as number) || 10;
      const list = MOCK_TRANSACTIONS.slice(0, limit);
      const { total_amount, count } = summarizeTrx(list);
      return JSON.stringify({
        success: true,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_latest_transactions_by_customer": {
      const id = input.customer_identifier as string;
      const limit = (input.limit as number) || 10;
      const list = matchCustomer(id).slice(0, limit);
      if (!list.length)
        return JSON.stringify({ success: false, error: `Tidak ada transaksi untuk customer "${id}".`, note: "[DEMO MODE]" });
      const { total_amount, count } = summarizeTrx(list);
      return JSON.stringify({
        success: true,
        customer: id,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_transactions_by_time_period": {
      const period = input.period as string;
      const list = filterByPeriod(period);
      const { total_amount, count } = summarizeTrx(list);
      const label: Record<string,string> = { day: "Hari Ini", week: "Minggu Ini", month: "Bulan Ini", year: "Tahun Ini" };
      return JSON.stringify({
        success: true,
        period: label[period] || period,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_transactions_by_time_range": {
      const list = filterByRange(input.start_date as string, input.end_date as string);
      const { total_amount, count } = summarizeTrx(list);
      return JSON.stringify({
        success: true,
        range: `${input.start_date} s/d ${input.end_date}`,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_transactions_by_customer_and_time_range": {
      const id = input.customer_identifier as string;
      const list = matchCustomer(id).filter(t => {
        const d = new Date(t.date);
        return d >= new Date(input.start_date as string) && d <= new Date((input.end_date as string) + "T23:59:59");
      });
      const { total_amount, count } = summarizeTrx(list);
      return JSON.stringify({
        success: true,
        customer: id,
        range: `${input.start_date} s/d ${input.end_date}`,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_transactions_by_customer_and_time_period": {
      const id = input.customer_identifier as string;
      const periodTrx = filterByPeriod(input.period as string);
      const list = periodTrx.filter(
        t =>
          t.customer_name.toLowerCase().includes(id.toLowerCase()) ||
          t.customer_email.toLowerCase().includes(id.toLowerCase())
      );
      const { total_amount, count } = summarizeTrx(list);
      return JSON.stringify({
        success: true,
        customer: id,
        period: input.period,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_transactions_by_specific_product": {
      const pname = (input.product_name as string).toLowerCase();
      const limit = (input.limit as number) || 20;
      const list = MOCK_TRANSACTIONS.filter(t => t.product.toLowerCase().includes(pname)).slice(0, limit);
      const { total_amount, count } = summarizeTrx(list);
      return JSON.stringify({
        success: true,
        product: input.product_name,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), date_formatted: fmtDate(t.date) })),
        total_amount: fmt(total_amount),
        count,
        note: "[DEMO MODE]",
      });
    }

    case "get_membership_customer_by_specific_product": {
      const pname = (input.product_name as string).toLowerCase();
      const list = MOCK_MEMBERSHIP.filter(m => m.product.toLowerCase().includes(pname));
      return JSON.stringify({
        success: true,
        product: input.product_name,
        data: list,
        count: list.length,
        note: "[DEMO MODE]",
      });
    }

    case "get_membership_customer_by_specific_product_and_tier": {
      const pname = (input.product_name as string).toLowerCase();
      const tier = (input.tier as string).toLowerCase();
      const list = MOCK_MEMBERSHIP.filter(
        m => m.product.toLowerCase().includes(pname) && m.tier.toLowerCase() === tier
      );
      return JSON.stringify({
        success: true,
        product: input.product_name,
        tier: input.tier,
        data: list,
        count: list.length,
        note: "[DEMO MODE]",
      });
    }

    case "get_latest_unpaid_transactions": {
      const limit = (input.limit as number) || 10;
      const list = MOCK_UNPAID.slice(0, limit);
      const total = list.reduce((s, t) => s + t.amount, 0);
      return JSON.stringify({
        success: true,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), created_formatted: fmtDate(t.created_at) })),
        total_unpaid: fmt(total),
        count: list.length,
        note: "[DEMO MODE]",
      });
    }

    case "get_unpaid_transactions_by_time_range": {
      const list = filterUnpaidByRange(input.start_date as string, input.end_date as string);
      const total = list.reduce((s, t) => s + t.amount, 0);
      return JSON.stringify({
        success: true,
        range: `${input.start_date} s/d ${input.end_date}`,
        data: list.map(t => ({ ...t, amount_formatted: fmt(t.amount), created_formatted: fmtDate(t.created_at) })),
        total_unpaid: fmt(total),
        count: list.length,
        note: "[DEMO MODE]",
      });
    }

    default:
      return JSON.stringify({ success: false, error: `Tool "${toolName}" tidak dikenali.`, note: "[DEMO MODE]" });
  }
}
