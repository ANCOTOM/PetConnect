import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send } from 'lucide-react';
import { auth, db } from '../firebase/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { createNotification } from '../utils/notifications';


export function CommentsDialog({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {// useEffect para cargar los comentarios en el momento 
    if (!postId) return;// si no hay post, no hacer nada

    const q = query(//Query para obtener los comentarios de la BD
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')// ordenar por fecha de creacion ascendente
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {// Escuchar cambios en tiempo real
      const fetchedComments = snapshot.docs.map(doc => ({// mapeo de los documentos obtenidos
        id: doc.id,// id del comentario
        ...doc.data()// resto de datos del comentario
      }));
      setComments(fetchedComments);// setea el estado de los comentarios como los recibidos
    }, (error) => {
      console.error('Error loading comments:', error);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e) => {//handle de nuevos comentarios en las publicaciones
  e.preventDefault();
  if (!newComment.trim() || !auth.currentUser) return;// Validar que el comentario no esté vacío y que el usuario esté autenticado

  setIsSubmitting(true);
  try {
    //  desde Firestore
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));// Obtener datos del usuario actual
    const userName = userDoc.exists() ? userDoc.data().name : 'Usuario';// nombre de usuario
    const userPhoto = userDoc.exists() ? userDoc.data().profilePicture : '';// foto de perfil

    //  comentario
    // añade el doc a firebase, digamos como hacer un post o un INSERT si fuera SQL
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      content: newComment.trim(),
      authorId: auth.currentUser.uid,
      authorName: userName,
      authorPhoto: userPhoto,
      createdAt: serverTimestamp()
    });

    // INCREMENTAR CONTADOR DE COMENTARIOS
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    
    // Notificacion 
    const postDoc = await getDoc(postRef);// Obtener el documento de la publicación comentada
    const postAuthorId = postDoc.exists() ? postDoc.data().userId : null;// ID del autor de la publicación
    if (postAuthorId && postAuthorId !== auth.currentUser.uid) { // Evitar notificarse a uno mismo
      await createNotification({// Crear una notificación para el autor de la publicación
        toUserId: postAuthorId,
        type: 'comment',
        fromUserId: auth.currentUser.uid,
        fromUserName: userName,
        postId: postId
      });
    }
    setNewComment('');// Limpiar el campo del nuevo comentario
  } catch (error) {
    console.error('Error creating comment:', error);
  } finally {
    setIsSubmitting(false);// Siempre desactivar el estado de envío
  }
};
  const formatDate = (timestamp) => {// Formatear la fecha del comentario
    if (!timestamp) return '';// Si no hay timestamp, retornar cadena vacía
    const date = timestamp.toDate();// convertir el timestamp a objeto Date
    const now = new Date();// obtener la fecha actual
    const diffMs = now.getTime() - date.getTime();// diferencia en milisegundos
    const diffMins = Math.floor(diffMs / 60000);// diferencia en minutos
    const diffHours = Math.floor(diffMs / 3600000);// diferencia en horas

    if (diffMins < 1) return 'Ahora';// menos de un minuto
    if (diffMins < 60) return `Hace ${diffMins}m`;// menos de una hora
    if (diffHours < 24) return `Hace ${diffHours}h`;// menos de un día
    return date.toLocaleDateString();// más de un día, mostrar fecha completa
  };

  return (
    <Dialog open={!!postId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comentarios</DialogTitle>
          <DialogDescription>Lee y escribe comentarios en esta publicación</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay comentarios aún</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border-2 border-orange-300">
                  {comment.authorPhoto ? (
                    <AvatarImage src={comment.authorPhoto} alt={comment.authorName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                      {comment.authorName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-orange-700">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none border-orange-200 focus:border-orange-400"
            rows={2}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
