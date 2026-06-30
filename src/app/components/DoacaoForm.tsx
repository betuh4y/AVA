"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Heart, Loader2, PawPrint, QrCode } from "lucide-react";
import { createPixPayment, checkPixPayment } from "@/app/actions/pix";

// ── Valores de doação ─────────────────────────────────────────────────────────
const VALORES = [
  { valor: 10,  label: ,   emoji: "😻" },
  { valor: 25,  label: ,     emoji: "😻" },
  { valor: 50,  label: ,       emoji: "😻" },
  { valor: 100, label: ,    emoji: "😻" },
  { valor: 200, label: , emoji: "😻" },
  { valor: 0,   label: ,     emoji: "😻" },
];

type PixData = {
  qrCode: string;
  qrBase64: string;
  paymentId: number;
  expiresAt: string;
};

export function DoacaoForm() {
  const [valorSel, setValorSel]   = useState(25);
  const [customVal, setCustomVal] = useState("");
  const [mensagem, setMensagem]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState("");
  const [pix, setPix]             = useState<PixData | null>(null);
  const [pago, setPago]           = useState(false);
  const [copiado, setCopiado]     = useState(false);

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const getValor = () => {
    if (valorSel === 0) {
      const v = parseFloat(customVal);
      return isNaN(v) || v <= 0 ? null : v;
    }
    return valorSel;
  };

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPoll = useCallback((paymentId: number) => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      try {
        const res = await checkPixPayment(paymentId);
        if (res.ok && res.approved) {
          stopPoll();
          setPago(true);
        }
      } catch (_) {}
    }, 6000);
  }, [stopPoll]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  async function handleGerar() {
    const v = getValor();
    if (!v) { setErro("Por favor informe um valor válido."); return; }

    setLoading(true);
    setErro("");
    setPix(null);
    setPago(false);
    stopPoll();

    const res = await createPixPayment(
      v,
      mensagem.trim() || "Doação para a gatinha"
    );

    setLoading(false);

    if (!res.ok) { setErro(res.error); return; }

    setPix({
      qrCode:    res.qrCode,
      qrBase64:  res.qrBase64,
      paymentId: res.paymentId,
      expiresAt: res.expiresAt,
    });

    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    startPoll(res.paymentId);
  }

  function handleCopiar() {
    if (!pix) return;
    navigator.clipboard.writeText(pix.qrCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const qrSrc = pix?.qrBase64
    ? `data:image/png;base64,${pix.qrBase64}`
    : pix?.qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pix.qrCode)}`
    : "";

  const validade = pix?.expiresAt
    ? (() => {
        const d = new Date(pix.expiresAt);
        return `Válido até ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · ${d.toLocaleDateString("pt-BR")}`;
      })()
    : "";

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* ── HEADER ── */}
        <div className="relative bg-gradient-to-br from-rose-400 to-pink-600 px-8 pt-10 pb-8 text-center text-white overflow-hidden">
          <PawPrint className="absolute top-4 left-5 w-7 h-7 opacity-20 -rotate-12" />
          <PawPrint className="absolute top-4 right-5 w-7 h-7 opacity-20 rotate-12" />
          <PawPrint className="absolute bottom-3 left-12 w-5 h-5 opacity-10 rotate-6" />
          <PawPrint className="absolute bottom-3 right-12 w-5 h-5 opacity-10 -rotate-6" />

          <img
  src="https://i.postimg.cc/0y9JMsrz/Whats-App-Image-2026-06-30-at-09-37-32.jpg"
  alt="Foto da Ava"
  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-3 inline-block animate-float"
/>
          <h1 className="text-2xl font-black tracking-tight mb-1.5">
            Ajude Ava com sua doação ❤️ !
          </h1>
          <p className="text-pink-100 text-sm leading-relaxed">
            Sua doação vai direto para os cuidados dela ❤️
          </p>
        </div>

        {/* ── BODY ── */}
        <div className="px-7 py-7 space-y-5">

          {/* Chips de valor */}
          <div>
            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mb-3">
              Escolha um valor
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {VALORES.map(({ valor, label, emoji }) => (
                <button
                  key={valor}
                  onClick={() => { setValorSel(valor); if (valor !== 0) setCustomVal(""); }}
                  className={[
                    "rounded-2xl py-3 px-2 text-center transition-all duration-150 border-2 cursor-pointer",
                    valorSel === valor
                      ? "bg-rose-500 border-rose-500 text-white shadow-lg scale-[1.04]"
                      : "bg-rose-50 border-transparent text-rose-800 hover:border-rose-300 hover:bg-rose-100",
                  ].join(" ")}
                >
                  <span className="block text-[17px] font-black">
                    {valor === 0 ? "Outro" : `R$${valor}`}
                  </span>
                  <span className={`block text-[11px] mt-0.5 ${valorSel === valor ? "opacity-90" : "opacity-55"}`}>
                    {label} {emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo personalizado */}
          {valorSel === 0 && (
            <div className="flex items-center border-2 border-rose-200 focus-within:border-rose-500 rounded-2xl overflow-hidden transition-colors">
              <span className="px-4 py-3 bg-rose-50 text-rose-500 font-black text-xl border-r border-rose-200 select-none">
                R$
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Digite o valor"
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                className="flex-1 px-4 py-3 text-xl font-bold text-gray-800 outline-none bg-transparent placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>
          )}

          {/* Mensagem */}
          <div>
            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mb-2">
              Mensagem (opcional)
            </p>
            <textarea
              rows={2}
              placeholder="Ex: Boa sorte para a sua gatinha! 🐾"
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              className="w-full border-2 border-rose-100 focus:border-rose-400 rounded-2xl px-4 py-3 text-sm text-gray-700 resize-none outline-none transition-colors placeholder:text-gray-300"
            />
          </div>

          {/* Botão gerar */}
          <button
            onClick={handleGerar}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-rose-400 to-pink-600 hover:from-rose-500 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-base rounded-2xl py-4 transition-all duration-150 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando PIX...</>
              : <><QrCode className="w-5 h-5" /> Gerar QR Code PIX</>
            }
          </button>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 leading-relaxed">
              ❌ {erro}
            </div>
          )}

          {/* ── RESULTADO ── */}
          {pix && (
            <div
              ref={resultRef}
              className="pt-5 border-t-2 border-dashed border-rose-100 space-y-4 text-center"
            >
              {/* Banner sucesso */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl py-3.5 px-4 font-black text-[15px] flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 fill-white" />
                QR Code gerado! Escaneie para doar
              </div>

              {/* QR Code */}
              <div className="inline-block bg-white border-[3px] border-rose-400 rounded-3xl p-4 shadow-xl">
                <img
                  src={qrSrc}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="rounded-xl block"
                />
              </div>

              {/* Copia e Cola */}
              <div className="bg-rose-50 rounded-2xl p-4 text-left space-y-3">
                <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">
                  PIX Copia e Cola
                </p>
                <p className="text-[10.5px] text-gray-500 font-mono leading-relaxed break-all line-clamp-3">
                  {pix.qrCode}
                </p>
                <button
                  onClick={handleCopiar}
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl px-4 py-2 transition-colors cursor-pointer"
                >
                  {copiado
                    ? <><Check className="w-4 h-4" /> Copiado!</>
                    : <><Copy className="w-4 h-4" /> Copiar código</>
                  }
                </button>
              </div>

              {/* Validade */}
              {validade && (
                <p className="text-xs text-gray-400">{validade}</p>
              )}

              {/* Status: aguardando / pago */}
              {!pago ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 dot-pulse" />
                  <span className="w-2 h-2 rounded-full bg-rose-400 dot-pulse-2" />
                  <span className="w-2 h-2 rounded-full bg-rose-400 dot-pulse-3" />
                  <span className="ml-1">Aguardando pagamento...</span>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl py-4 px-5 text-green-700 font-bold text-[15px]">
                  ✅ Pagamento confirmado! Muito obrigada! 🐱❤️
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-300 pb-6">
          Pagamento seguro via{" "}
          <span className="font-semibold text-rose-400">Mercado Pago</span>
          {" "}· PIX instantâneo
        </p>
      </div>
    </div>
  );
}
