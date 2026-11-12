export function notFound(req, res) {
  res.status(404).json({ error: 'No encontramos el recurso solicitado.' });
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  if (error?.code === '23505') return res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
  if (error?.code === '23503') return res.status(400).json({ error: 'La referencia seleccionada no existe o no se puede eliminar.' });
  if (error?.code === '23514') return res.status(400).json({ error: 'Los datos no cumplen las reglas del sistema.' });
  const status = Number(error.status) || 500;
  res.status(status).json({ error: status === 500 ? 'Ocurrió un error inesperado. Intentá nuevamente.' : error.message });
}
