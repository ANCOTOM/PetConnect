const mongoose = require('mongoose');

const mascotaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especie: { type: String, required: true },
  raza: { type: String },
  edad: { type: Number },
  fotoMascota: { type: String }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena_hash: { type: String, required: true },  // cambiar contraseña a hash
  foto_perfil: { type: String },
  biografia: { type: String },
  fecha_creacion: { type: Date, default: Date.now },  // para que coincida con GET
  mascotas: [mascotaSchema]
});

module.exports = mongoose.model('Usuario', usuarioSchema);
