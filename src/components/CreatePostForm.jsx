import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Send, X } from 'lucide-react';
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
                <input
                  type="text"
                  placeholder="Link de la imagen"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-orange-200 rounded px-2 py-1"
                />
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
