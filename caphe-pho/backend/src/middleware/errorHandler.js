function errorHandler(err, req, res, next) {
  console.error('❌', err.message);
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Request body không hợp lệ' });
  res.status(err.status || 500).json({ error: err.message || 'Lỗi server' });
}
module.exports = errorHandler;
