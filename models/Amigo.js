const mongoose = require('mongoose');

const amigoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  siguiendo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }]
});

module.exports = mongoose.model('Amigo', amigoSchema);
