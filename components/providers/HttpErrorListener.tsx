'use client';

import { useEffect, useState, useCallback } from 'react';
import { httpErrorEmitter, HttpErrorData } from '@/lib/services/httpErrorEmitter';
import AlertModal, { AlertVariant } from '@/components/ui/AlertModal';

/** Maps HTTP status codes to user-friendly Spanish messages and AlertModal variants */
function mapHttpError(data: HttpErrorData): { title: string; message: string; variant: AlertVariant } {
  const { status, message } = data;

  // Network / connectivity errors
  if (status === 0) {
    return {
      title: 'Sin conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.',
      variant: 'error',
    };
  }

  // Status code mapping
  switch (status) {
    case 400:
      return {
        title: 'Datos inválidos',
        message: 'Los datos enviados no son correctos. Revisa la información e inténtalo de nuevo.',
        variant: 'warning',
      };
    case 403:
      return {
        title: 'Acceso denegado',
        message: 'No tienes permisos para realizar esta acción.',
        variant: 'warning',
      };
    case 404:
      return {
        title: 'No encontrado',
        message: 'El recurso solicitado no existe o fue eliminado.',
        variant: 'info',
      };
    case 408:
      return {
        title: 'Tiempo agotado',
        message: 'La solicitud tardó demasiado. Verifica tu conexión e inténtalo de nuevo.',
        variant: 'warning',
      };
    case 409:
      return {
        title: 'Conflicto',
        message: 'Ya existe un registro con esos datos. Intenta con información diferente.',
        variant: 'warning',
      };
    case 422:
      return {
        title: 'Datos incompletos',
        message: 'Faltan campos obligatorios o el formato no es válido.',
        variant: 'warning',
      };
    case 429:
      return {
        title: 'Demasiadas solicitudes',
        message: 'Has enviado muchas solicitudes en poco tiempo. Espera un momento e inténtalo de nuevo.',
        variant: 'warning',
      };
    case 500:
      return {
        title: 'Error del servidor',
        message: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde.',
        variant: 'error',
      };
    case 502:
    case 503:
      return {
        title: 'Servicio no disponible',
        message: 'El servidor no está disponible en este momento. Inténtalo más tarde.',
        variant: 'error',
      };
    default:
      return {
        title: 'Error inesperado',
        message: message || 'Ocurrió un error inesperado. Inténtalo de nuevo.',
        variant: 'error',
      };
  }
}

export default function HttpErrorListener() {
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: AlertVariant;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error',
  });

  const handleHttpError = useCallback((data: HttpErrorData) => {
    const mapped = mapHttpError(data);
    setAlert({
      isOpen: true,
      ...mapped,
    });
  }, []);

  useEffect(() => {
    httpErrorEmitter.on(handleHttpError);
    return () => httpErrorEmitter.off(handleHttpError);
  }, [handleHttpError]);

  return (
    <AlertModal
      isOpen={alert.isOpen}
      onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
      title={alert.title}
      message={alert.message}
      variant={alert.variant}
    />
  );
}
