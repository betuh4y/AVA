"use server";

import { MercadoPagoConfig, Payment } from "mercadopago";

function getMPClient() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado.");
  return new MercadoPagoConfig({ accessToken: token });
}

export type PixResult =
  | { ok: true; qrCode: string; qrBase64: string; paymentId: number; expiresAt: string }
  | { ok: false; error: string };

export type StatusResult =
  | { ok: true; status: string; approved: boolean }
  | { ok: false; error: string };

// ── Cria pagamento PIX ───────────────────────────────────────────────────────
export async function createPixPayment(
  amount: number,
  description: string
): Promise<PixResult> {
  try {
    const payment = new Payment(getMPClient());

    const result = await payment.create({
      body: {
        transaction_amount: amount,
        description: description || "Doação para a gatinha",
        payment_method_id: "pix",
        payer: {
          email: "doador@email.com",
          first_name: "Doador",
          last_name: "Anonimo",
          identification: { type: "CPF", number: "00000000000" },
        },
      },
      requestOptions: {
        idempotencyKey: `gatinha-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    });

    const tx = result.point_of_interaction?.transaction_data;
    if (!tx?.qr_code) throw new Error("QR Code não retornado. Use token de PRODUÇÃO.");

    return {
      ok: true,
      qrCode:    tx.qr_code,
      qrBase64:  tx.qr_code_base64 ?? "",
      paymentId: result.id!,
      expiresAt: result.date_of_expiration ?? "",
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}

// ── Consulta status do pagamento ─────────────────────────────────────────────
export async function checkPixPayment(paymentId: number): Promise<StatusResult> {
  try {
    const payment = new Payment(getMPClient());
    const result  = await payment.get({ id: paymentId });

    return {
      ok:       true,
      status:   result.status ?? "pending",
      approved: result.status === "approved",
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}
