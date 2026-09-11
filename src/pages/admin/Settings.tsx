import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Gear as SettingsIcon,
  WhatsappLogo as MessageCircle,
  FloppyDisk as Save,
  CheckCircle as CheckCircle2,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  Buildings as Building2,
  Phone,
  Question as HelpCircle,
  ShieldCheck,
} from '@phosphor-icons/react';
import { settingsService } from '@/services/settings.service';

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Cargar Configuración Actual
  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => settingsService.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsapp_number);
      setStoreName(settings.store_name || 'ConstruCenter');
    }
  }, [settings]);

  // 2. Mutación para Guardar
  const saveMutation = useMutation({
    mutationFn: () => settingsService.updateWhatsAppNumber(whatsappNumber, storeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      setSuccessToast(true);
      setErrorMessage(null);
      setTimeout(() => setSuccessToast(false), 3500);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Error al guardar la configuración');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim() || whatsappNumber.replace(/[^0-9]/g, '').length < 8) {
      setErrorMessage('Por favor ingresa un número de WhatsApp válido (código de país + número).');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-constru-primary" />
            </div>
            <h1 className="text-2xl font-black text-constru-dark tracking-tight">Configuración Comercial</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Define el canal oficial de WhatsApp y parámetros operativos de la plataforma
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-constru-accent flex-shrink-0" />
          <span>¡Configuración comercial actualizada correctamente en la base de datos!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark pb-3 border-b border-gray-100 flex items-center gap-2">
          <MessageCircle weight="fill" className="w-4 h-4 text-green-600" />
          Canal Oficial de WhatsApp para Ventas
        </h2>

        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-constru-primary animate-spin" />
            <p className="text-xs text-gray-400">Cargando parámetros...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Campo WhatsApp */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700" htmlFor="whatsapp">
                  Número Telefónico de WhatsApp *
                </label>
                <span className="text-[11px] text-gray-400">Incluir código de país sin signo +</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-green-600 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="whatsapp"
                  type="text"
                  placeholder="50688888888"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Ejemplo para Costa Rica: <code className="font-mono font-bold text-constru-dark">50688888888</code> &bull; Ejemplo para México: <code className="font-mono font-bold text-constru-dark">5215512345678</code>
              </p>
            </div>

            {/* Campo Nombre Comercial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5" htmlFor="storeName">
                Nombre Comercial de la Tienda
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  id="storeName"
                  type="text"
                  placeholder="ConstruCenter"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-bold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary"
                />
              </div>
            </div>

            {/* Explicación de Funcionamiento Dinámico */}
            <div className="p-4 bg-green-50/70 border border-green-200 rounded-2xl text-xs text-green-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-constru-primary">
                <ShieldCheck className="w-4 h-4 text-constru-accent" />
                <span>¿Dónde se refleja este cambio en tiempo real?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11.5px] text-green-900 leading-relaxed">
                <li>En la pantalla de confirmación de pedido (<code className="font-mono font-bold">/pedido-confirmado</code>) para el botón gigante de WhatsApp.</li>
                <li>En todas las tarjetas de catálogos PDF (<code className="font-mono font-bold">/catalogos</code>) en el botón de consulta.</li>
                <li>En las fichas de detalle de producto (<code className="font-mono font-bold">/producto/:slug</code>) en el botón de consulta directa.</li>
              </ul>
            </div>

            {/* Botón Guardar */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-constru-primary hover:bg-constru-primary-hover shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-constru-accent" />
                )}
                <span>Guardar Configuración Comercial</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
export default AdminSettings;
