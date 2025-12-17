"use client";

import { useState } from "react";

interface CepData {
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

interface CepResult {
  originalInput: string;
  valid: boolean;
  data?: CepData;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CepResult[]>([]);

  const validateCeps = async () => {
    setLoading(true);
    setResults([]);

    // Split by newlines, commas, or spaces and filter empty strings
    const cepsToCheck = input
      .split(/[\n,;]+/)
      .map((cep) => cep.trim())
      .filter((cep) => cep.length > 0);

    const validationPromises = cepsToCheck.map(async (cepInput) => {
      // Remove non-digits for the API call
      const cleanCep = cepInput.replace(/\D/g, "");

      if (cleanCep.length !== 8) {
        return {
          originalInput: cepInput,
          valid: false,
        };
      }

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`
        );

        if (!response.ok) {
          return {
            originalInput: cepInput,
            valid: false,
          };
        }

        const data: CepData = await response.json();

        if (data.erro) {
          return {
            originalInput: cepInput,
            valid: false,
          };
        }

        return {
          originalInput: cepInput,
          valid: true,
          data,
        };
      } catch (error) {
        return {
          originalInput: cepInput,
          valid: false,
        };
      }
    });

    const results = await Promise.all(validationPromises);
    setResults(results);
    setLoading(false);
  };

  const validCeps = results.filter((r) => r.valid);
  const invalidCeps = results.filter((r) => !r.valid);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full max-w-4xl flex-col gap-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Validador de CEP
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Digite uma sequência de CEPs abaixo para verificar quais são
            válidos.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <textarea
            className="w-full h-40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            placeholder="Ex: 30672-220, 01001-000, 12345-678"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={validateCeps}
            disabled={loading || !input.trim()}
            className="self-end px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Validando..." : "Validar CEPs"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Valid CEPs Column */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Existem ({validCeps.length})
              </h2>
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                {validCeps.length === 0 ? (
                  <p className="text-zinc-500 italic">
                    Nenhum CEP válido encontrado.
                  </p>
                ) : (
                  validCeps.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30"
                    >
                      <div className="font-bold text-green-900 dark:text-green-100">
                        {result.data?.cep}
                      </div>
                      <div className="text-sm text-green-800 dark:text-green-200/80">
                        {result.data?.logradouro}, {result.data?.bairro}
                        <br />
                        {result.data?.localidade} - {result.data?.uf}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Invalid CEPs Column */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Não Existem ({invalidCeps.length})
              </h2>
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                {invalidCeps.length === 0 ? (
                  <p className="text-zinc-500 italic">
                    Nenhum CEP inválido encontrado.
                  </p>
                ) : (
                  invalidCeps.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30"
                    >
                      <div className="font-bold text-red-900 dark:text-red-100">
                        {result.originalInput}
                      </div>
                      <div className="text-sm text-red-800 dark:text-red-200/80">
                        CEP não encontrado ou formato inválido
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="text-sm text-zinc-600 dark:text-zinc-400"> Feito para Jaqueline</footer>
      </main>
    </div>
  );
}
