import React, { useState, useEffect } from 'react';
import {
  Warning as AlertTriangle,
  CheckCircle as CheckCircle2,
  Database,
  ArrowClockwise as RefreshCw,
  ArrowSquareOut as ExternalLink,
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  Key as KeyRound,
  FileCode,
} from '@phosphor-icons/react';
import { supabaseDiagnostic, type DiagnosticResult } from '@/services/supabaseDiagnostic.service';

export const SupabaseStatusAlert: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const runDiagnostic = async () => {
    setIsChecking(true);
    try {
      const res = await supabaseDiagnostic.checkConnection();
      setResult(res);
    } catch {
      setResult({
        ok: false,
        code: 'NETWORK_ERROR',
        title: 'Error Inesperado',
        message: 'No fue posible completar el diagnóstico de Supabase.',
        solution: 'Revisa tu consola de desarrollador para más detalles.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (!result) return null;

  // Estado Conectado OK
  if (result.ok) {
    if (compact) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-constru-accent" />
          <span>Supabase Conectado</span>
        </div>
      );
    }
    return (
      <div className="p-3 bg-green-50/80 border border-green-200 rounded-xl flex items-center justify-between text-xs text-green-800">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-constru-accent flex-shrink-0" />
          <span>
            <strong>Supabase Conectado:</strong> Tablas y políticas RLS verificadas con éxito.
          </span>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={isChecking}
          className="text-green-700 hover:text-green-900 flex items-center gap-1 font-semibold"
          title="Verificar de nuevo"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>Reverificar</span>
        </button>
      </div>
    );
  }

  // Estado con advertencia / desconectado
  return (
    <div className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl shadow-xs text-amber-900 space-y-3 animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <span>{result.title}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-200/80 rounded-md font-bold">
                {result.code}
              </span>
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">{result.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runDiagnostic}
            disabled={isChecking}
            className="p-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            title="Reintentar conexión"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Probar</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Solución rápida */}
      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60 text-xs flex items-start gap-2">
        <KeyRound className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-amber-950 font-medium">
          <strong>Solución:</strong> {result.solution}
        </p>
      </div>

      {/* Instrucciones desplegables paso a paso */}
      {expanded && (
        <div className="pt-2 border-t border-amber-200/60 text-xs space-y-2.5 text-amber-900">
          <p className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
            Guía de Configuración Rápida en 3 Pasos:
          </p>

          <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11.5px] leading-relaxed">
            <li>
              Abre tu proyecto en{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-constru-primary inline-flex items-center gap-0.5"
              >
                Supabase Dashboard <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              y ve a <strong>Project Settings &gt; API</strong>.
            </li>
            <li>
              Copia el <strong>Project URL</strong> y el <strong>anon public API key</strong>.
            </li>
            <li>
              Pégalos en tu archivo <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">.env</code> en la raíz del proyecto:
            </li>
          </ol>

          <div className="bg-constru-offwhite text-constru-dark font-mono text-[11px] p-3 rounded-xl overflow-x-auto select-all">
            VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co<br />
            VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
          </div>

          <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
            <FileCode className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">¿Aún no has creado las tablas en Supabase?</p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Copia y ejecuta el archivo <code className="font-mono bg-blue-100 px-1 rounded">supabase/schema.sql</code> en el <strong>SQL Editor</strong> de Supabase para generar las tablas, relaciones y políticas RLS.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 italic">
            * Recuerda reiniciar el servidor de desarrollo (<code className="font-mono bg-gray-100 px-1 py-0.5 rounded">npm run dev</code>) para que Vite cargue las nuevas variables.
          </p>
        </div>
      )}
    </div>
  );
};
export default SupabaseStatusAlert;

