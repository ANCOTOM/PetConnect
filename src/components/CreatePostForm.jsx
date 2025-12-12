import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Send, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Firebase imports
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function CreatePostForm({ userName, userProfilePicture, onPostCreated }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  //INTEGRACIÓN CON CLOUDINARY para subir imágenes
  // Esta función maneja la subida de archivos directamente desde el navegador a Cloudinary
  // usando "Unsigned Uploads" (Subidas sin firma), lo que evita necesitar un backend.
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    //'upload_preset' es una configuración en Cloudinary que define cómo se procesa la imagen.
    // Uno lo que hace es crear un upload preset en la pagina y de ahí le pone que sea unassigned 
    // los parametros son el preset name que en este caso es 'petconnect_posts'
    formData.append('upload_preset', 'petconnect_posts');

    try {
      // URL de la API de Cloudinary: https://api.cloudinary.com/v1_1/<el-nombre-de-la-nube-propia>/image/upload
      // 'dz5kj8xph' es el que usamos en el proyecto
      const response = await fetch('https://api.cloudinary.com/v1_1/dz5kj8xph/image/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const data = await response.json();
      
      // Cloudinary devuelve la URL pública de la imagen en 'secure_url'
      // Lo que hacemos es guardar esta URL en el estado para luego enviarla a Firebase
      setImageUrl(data.secure_url);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !imageUrl && !videoUrl) {
      toast.error('Agrega contenido, una imagen o un video');
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast.error('Debes iniciar sesión para publicar');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content: content.trim(),
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        visibility,
        userId: currentUser.uid,
        authorName: userName,
        authorProfilePicture: userProfilePicture || null,
        createdAt: serverTimestamp(),
        likesCount: 0,
        sharesCount: 0,
        commentsCount: 0
      });

      toast.success('Publicación creada exitosamente');
      setContent('');
      setImageUrl('');
      setVideoUrl('');
      setVisibility('public');
      onPostCreated?.();
    } catch (err) {
      console.error('Error creando publicación:', err);
      toast.error('Error al crear la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border-2 border-orange-300">
              {userProfilePicture ? (
                <AvatarImage src={userProfilePicture} alt={userName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                  {userName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="¿Qué está haciendo tu mascota hoy?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-orange-200 focus:border-orange-400 bg-white"
              />

              <div className="space-y-2">
                {/* Input de archivo oculto */}
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />

                {/* Botón para seleccionar imagen y URL */}
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50 whitespace-nowrap"
                    onClick={() => document.getElementById('image-upload').click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Subiendo...' : 'Subir Foto'}
                  </Button>

                  <span className="text-xs text-muted-foreground">o</span>

                  <input
                    type="text"
                    placeholder="Pegar URL de imagen..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 text-sm border border-orange-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    disabled={isUploading}
                  />
                </div>

                {imageUrl && (
                  <div className="relative">
                    <img src={imageUrl} alt="Preview" className="w-full rounded-lg max-h-60 object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setImageUrl('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Link del video"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-orange-200 rounded px-2 py-1"
                />
                {videoUrl && (
                  <div className="relative">
                    <video src={videoUrl} controls className="w-full rounded-lg max-h-60" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setVideoUrl('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-between">
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="w-32 border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="friends">Amigos</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && !imageUrl && !videoUrl)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
