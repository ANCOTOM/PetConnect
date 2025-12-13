import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Heart, MessageCircle, Trash2, Share2, Edit2, Globe, Users, Flag, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, increment } from 'firebase/firestore';
import { createNotification } from '../utils/notifications'

export function PostCard({ post, currentUserId, onDelete, onComment, onHashtagClick, onUserClick }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const postRef = doc(db, 'posts', post.id);

  // Desde desde Firestore
  useEffect(() => {
    const fetchLikesShares = async () => {
      try {
        const likesSnapshot = await getDocs(collection(db, 'posts', post.id, 'likes'));// obtener los likes de la publicacion
        const sharesSnapshot = await getDocs(collection(db, 'posts', post.id, 'shares'));// obtener los shares de la publicacion

        setLikesCount(likesSnapshot.size);// establecer el conteo de likes por la cantidad de documentos obtenidos
        setSharesCount(sharesSnapshot.size);// establecer el conteo de shares por la cantidad de documentos obtenidos

        setIsLiked(likesSnapshot.docs.some(doc => doc.data().userId === currentUserId));// verificar si el usuario actual ha dado like
        setIsShared(sharesSnapshot.docs.some(doc => doc.data().userId === currentUserId));// verificar si el usuario actual ha compartido
      } catch (error) {
        console.error('Error fetching likes/shares:', error);
      }
    };
    fetchLikesShares();// llamar a la funcion de fetchLikesShares
  }, [post.id, currentUserId]);// el efecto se vuelve a ejecutar si cambia el ID del post o el ID del usuario actual

  const handleLike = async () => {// Maneja los likes en las publicaciones
    try {
      const likesRef = collection(db, 'posts', post.id, 'likes');// referencia a la coleccion de likes de la publicacion

      if (isLiked) {// si ya esta likeado
        const likeDocs = await getDocs(query(likesRef, where('userId', '==', currentUserId)));// obtener los documentos de like del usuario actual
        for (let docSnap of likeDocs.docs) {// iterar sobre los documentos obtenidos
          await deleteDoc(doc(db, 'posts', post.id, 'likes', docSnap.id));// eliminar cada documento de like
        }
        await updateDoc(postRef, { likesCount: increment(-1) });// decrementar el contador de likes en la publicacion
        setIsLiked(false);// actualizar el estado de isLiked para digamos si se quita el like
        setLikesCount(prev => Math.max(prev - 1, 0));// decrementar el contador de likes en el estado
        toast.success('Ya no te gusta la publicación');
      } else {
        await addDoc(likesRef, { userId: currentUserId, createdAt: new Date() });// agregar un nuevo documento de like para el usuario actual en caso de que sea like
        await updateDoc(postRef, { likesCount: increment(1) });// incrementar el contador de likes en la publicacion
        setIsLiked(true);// actualizar el estado de isLiked para decir que le di like
        setLikesCount(prev => prev + 1);// incrementar el contador de likes en el estado
        toast.success('Te gusta la publicación');

        if (post.userId !== currentUserId) {// crear notificacion solo si no es el mismo usuario
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUserId));// Obtener el documento del usuario actual
            const fromUserName = userDoc.exists() ? userDoc.data().name : 'Usuario';// nombre del usuario actual

            await createNotification({// crear la notificacion de like
              toUserId: post.userId,
              type: 'like',
              fromUserId: currentUserId,
              fromUserName,
              postId: post.id
            });
          } catch (error) {
            console.error('Error creando la notificación de like:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al dar like:', error);
      toast.error('Error al dar like');
    }
  };

  const handleShare = async () => {// se encarga de manejar los compartidos de las publicaciones
    try {
      const sharesRef = collection(db, 'posts', post.id, 'shares');

      if (isShared) {// si ya esta compartido
        const shareDocs = await getDocs(query(sharesRef, where('userId', '==', currentUserId)));// obtener los documentos de share del usuario actual
        for (let docSnap of shareDocs.docs) {// iterar sobre los documentos obtenidos
          await deleteDoc(doc(db, 'posts', post.id, 'shares', docSnap.id));// eliminar cada documento de share
        }
        await updateDoc(postRef, { sharesCount: increment(-1) });// bajar el contador de shares en la publicacion
        setIsShared(false);// actualizar el estado de isShared para decir que ya no esta compartido
        setSharesCount(prev => Math.max(prev - 1, 0));// bajar el contador de shares en el estado
        toast.success('Dejaste de compartir la publicación');
      } else {//ahora si, al compartir
        await addDoc(sharesRef, { userId: currentUserId, createdAt: new Date() });// agregar un nuevo documento de share para el usuario actual
        await updateDoc(postRef, { sharesCount: increment(1) });// incrementar el contador de shares en la publicacion
        setIsShared(true);//ahora si esta compartido
        setSharesCount(prev => prev + 1);//aumenta en el contador de shares en el estado
        toast.success('Publicación compartida');

        if (post.userId !== currentUserId) {// crear notificacion solo si no es el mismo usuario
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUserId));// Obtener el documento del usuario actual
            const fromUserName = userDoc.exists() ? userDoc.data().name : 'Usuario';//obtener el nombre

            await createNotification({// crear la notificacion de share en bd
              toUserId: post.userId,
              type: 'share',
              fromUserId: currentUserId,
              fromUserName,
              postId: post.id
            });
          } catch (error) {
            console.error('Error creando la notificación de share:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      toast.error('Error al compartir');
    }
  };

  const handleEdit = async () => {// Maneja la edicion de las publicaciones
    try {
      await updateDoc(postRef, { content: editContent });// actualizar el contenido de la publicacion en la bd
      post.content = editContent;// actualizar el contenido del post localmente
      setIsEditing(false);// cerrar el dialogo de edicion
      toast.success('Publicación actualizada');
      onDelete?.();// llamar a la funcion onDelete para refrescar la lista de publicaciones
    } catch (error) {
      console.error('Error al editar:', error);
      toast.error('Error al editar');
    }
  };

  const handleDelete = async () => {// Maneja la eliminacion de las publicaciones
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;//confirmacion
    setIsDeleting(true);// poner el estado de eliminacion en true
    try {
      await deleteDoc(postRef);// eliminar el documento de la publicacion en la bd
      toast.success('Publicación eliminada');
      onDelete?.();// llamar a la funcion onDelete para refrescar la lista de publicaciones
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportPost = async () => {// Maneja el reporte de publicaciones
    if (!reportReason.trim()) {//verifica que no este vacio
      toast.error('Describe el motivo del reporte');
      return;
    }
    try {
      await addDoc(collection(db, 'reports'), {// agregar un nuevo reporte en la coleccion reports
        reportedPostId: post.id,// ID de la publicacion reportada
        reason: reportReason,// motivo del reporte
        reportedBy: currentUserId,// ID del usuario que reporta
        status: 'pending',// estado del reporte
        createdAt: new Date()// fecha de creacion
      });
      toast.success('Publicación reportada correctamente');
      setReportReason('');
      setShowReportDialog(false);
    } catch (error) {
      console.error('Error al reportar:', error);
      toast.error('Error al reportar publicación');
    }
  };

  const formatDate = (timestamp) => {//funcion como las de otros componentes para hacer un objeto de fecha y calcular dependiendo de cuanto haya pasado el mensaje
    if (!timestamp) return 'Ahora';
    let date;
    if (timestamp.toDate) date = timestamp.toDate();
    else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
    else date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderContentWithHashtags = (content) => {// Renderiza el contenido del post con hashtags clickeables
    if (!content) return null;// si no hay contenido, retornar null
    const parts = content.split(/(#[\w\u00C0-\u017F]+)/g);// dividir el contenido en partes, separando los hashtags
    return (
      <p className="mb-3 whitespace-pre-wrap">
        {parts.map((part, index) =>// mapear cada parte
          part.startsWith('#') ? (// si la parte es un hashtag
            <span
              key={index}
              className="text-orange-600 hover:text-orange-700 cursor-pointer hover:underline font-medium"
              onClick={() => onHashtagClick?.(part)}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </p>
    );
  };

  return (
    <>
      <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          <Avatar className="h-10 w-10 border-2 border-orange-300 cursor-pointer" onClick={() => onUserClick?.(post.userId)}>
            {post.author?.profilePicture && <AvatarImage src={post.author.profilePicture} alt={post.author.name} />}
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
              {post.author?.name.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
       <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Nombre clickeable */}
            <span
              className="text-orange-700 cursor-pointer hover:underline"
              onClick={() => onUserClick?.(post.userId)}
            >
              {post.author?.name || 'Usuario'}
            </span>

            {/* Texto con el nombre de la mascota */}
            {post.author?.petName && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                con {post.author.petName}

                {/* Foto de la mascota justo después del nombre */}
                {post.author?.petPicture && (
                  <Avatar className="h-9 w-9 border-2 border-orange-300">
                    <AvatarImage src={post.author.petPicture} alt={post.author.petName} />
                    <AvatarFallback className="bg-orange-300 text-white">P</AvatarFallback>
                  </Avatar>
                )}

                {/* Tipo de mascota */}
                {post.author.petType && `(${post.author.petType})`}
              </span>
            )}

            {/* Iconos de visibilidad */}
            {post.visibility === 'friends' && <Users className="h-3 w-3 text-muted-foreground" title="Solo amigos" />}
            {post.visibility === 'public' && <Globe className="h-3 w-3 text-muted-foreground" title="Público" />}
          </div>
        </div>


          {post.userId === currentUserId ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-orange-600 hover:bg-orange-50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Reportar publicación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          {post.content && renderContentWithHashtags(post.content)}
          {post.imageUrl && <img src={post.imageUrl} alt="Post image" className="w-full rounded-lg object-cover max-h-96" />}
          {post.videoUrl && <video src={post.videoUrl} controls className="w-full rounded-lg max-h-96" />}
        </CardContent>

        <CardFooter className="flex gap-2 pt-3 border-t border-orange-100">
          <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}>
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onComment(post.id)} className="hover:text-orange-500">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.commentsCount || 0}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className={isShared ? 'text-green-500 hover:text-green-600' : 'hover:text-green-500'}>
            <Share2 className={`h-4 w-4 mr-1 ${isShared ? 'fill-current' : ''}`} />
            {sharesCount}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Publicación</DialogTitle>
            <DialogDescription>Modifica el contenido de tu publicación</DialogDescription>
          </DialogHeader>
          <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[150px]" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button onClick={handleEdit} className="bg-gradient-to-r from-orange-500 to-amber-500">Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Publicación</DialogTitle>
            <DialogDescription>Describe por qué esta publicación viola las reglas de la comunidad</DialogDescription>
          </DialogHeader>
          <Textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe el motivo del reporte..." className="min-h-[150px]" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancelar</Button>
            <Button onClick={handleReportPost} variant="destructive">Enviar Reporte</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
