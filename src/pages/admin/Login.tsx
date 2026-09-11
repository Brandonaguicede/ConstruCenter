import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Buildings as Building2, EnvelopeSimple as Mail, LockSimple as Lock, Eye, EyeSlash as EyeOff, WarningCircle as AlertCircle, CircleNotch as Loader2, Sparkle as Sparkles } from '@phosphor-icons/react';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/useAuthStore';
import { SupabaseStatusAlert } from '@/components/ui/SupabaseStatusAlert';
import construLogo from '@/img/ConstruCenter_Nicoya_logo_transparente.svg';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginDemo, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir a la ubicación previa o a /admin si ya está autenticado
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      clearError();
      await login(data);
      navigate(from, { replace: true });
    } catch {
      // El error ya queda almacenado en el store
    }
  };

  const handleDemoAccess = () => {
    loginDemo();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-constru-offwhite px-4 sm:px-6 lg:px-8 py-12">
      <div className="admin-login-panel max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-constru-line">
        {/* Encabezado con Logo Oficial */}
        <div className="text-center">
          <img
            src={construLogo}
            alt="ConstruCenter Nicoya"
            className="h-16 w-auto mx-auto object-contain mb-3 drop-shadow"
          />
          <h2 className="mt-2 text-2xl font-black text-constru-dark tracking-tight">
            Panel Administrativo
          </h2>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Gestión de catálogo, inventario y cotizaciones
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-constru-primary border border-green-200">
            <span className="w-2 h-2 rounded-full bg-constru-accent animate-pulse"></span>
            Portal Administrativo Seguro
          </div>
        </div>

        {/* Diagnóstico Interactivo de Conexión a Supabase */}
        <SupabaseStatusAlert />

        {/* Alerta de Error de Autenticación */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold">Error de Acceso</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-semibold text-constru-dark mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="administrador@construcenter.com"
                {...register('email')}
                className={`block w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20'
                    : 'border-gray-300 focus:ring-constru-primary focus:border-constru-primary'
                } focus:outline-none focus:ring-2 transition-colors`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Password */}
          <div>
            <label className="block text-sm font-semibold text-constru-dark mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                {...register('password')}
                className={`block w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border ${
                  errors.password
                    ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20'
                    : 'border-gray-300 focus:ring-constru-primary focus:border-constru-primary'
                } focus:outline-none focus:ring-2 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-constru-primary hover:bg-constru-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-constru-accent disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al Panel con Supabase'
            )}
          </button>

          {/* Botón de Modo Demostración */}
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200"
          >
            <Sparkles className="w-4 h-4 text-constru-accent" />
            <span>Explorar Panel en Modo Demo Local</span>
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          ConstruCenter E-Commerce Platform &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;
