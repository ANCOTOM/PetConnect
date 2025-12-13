import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Edit2, MapPin, PawPrint, Flag, UserPlus, UserMinus } from 'lucide-react';
import { PostCard } from './PostCard';
import { toast } from 'sonner';
import { createNotification } from '../utils/notifications';
import { uploadToCloudinary } from '../utils/cloudinary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog';
import { db } from '../firebase/firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function ProfileView({ userId, isOwnProfile, onCommentClick }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportReason, setReportReason] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);

  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [isUploadingPetPic, setIsUploadingPetPic] = useState(false);

  const [listType, setListType] = useState(null); // 'followers' | 'following'
  const [listUsers, setListUsers] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [editForm, setEditForm] = useState({
    name: '',
    petName: '',
    petType: '',
    petPicture: '',
    bio: '',
    location: '',
    profilePicture: '',
  });

  useEffect(() => {// useEffect para cargar el perfil y las publicaciones cuando el componente se monta o cambia el userId
    loadProfile();
    loadPosts();
    if (!isOwnProfile) checkFollowStatus();
  }, [userId]);

  // Cargar perfil
  const loadProfile = async () => {// funcion asincrona para cargar el perfil del usuario
    try {
      const docRef = doc(db, 'users', userId);// referencia al documento del usuario en la coleccion users
      const docSnap = await getDoc(docRef);// obtener el documento
      if (docSnap.exists()) {// si el documento existe
        const data = docSnap.data();// obtener los datos del documento
        setProfile(data);// setear el estado del perfil con los datos obtenidos

        // Stats
        const postsSnap = await getDocs(query(collection(db, 'posts'), where('userId', '==', userId)));
        const followersSnap = await getDocs(query(collection(db, 'follows'), where('followingId', '==', userId)));
        const followingSnap = await getDocs(query(collection(db, 'follows'), where('followerId', '==', userId)));

        setStats({
          postsCount: postsSnap.size,
          followersCount: followersSnap.size,
          followingCount: followingSnap.size
        });

        setEditForm({
          name: data.name || '',
          petName: data.petName || '',
          petType: data.petType || '',
          bio: data.bio || '',
          location: data.location || '',
          profilePicture: data.profilePicture || '',
          petPicture: data.petPicture || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar posts
  const loadPosts = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'posts'), where('userId', '==', userId)));// consulta para obtener las publicaciones del usuario
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));// mapeo de los documentos obtenidos

      postsData.sort((a, b) => {// ordenar las publicaciones por fecha de creacion descendente
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);// convertir a objeto Date
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);// convertir a objeto Date
        return dateB - dateA;// ordenar de mas reciente a mas antiguo
      });

      if (currentUser) {// verificar si hay un usuario autenticado
        await Promise.all(postsData.map(async (post) => {// para cada publicacion, verificar si el usuario le dio like o share
          const likesRef = collection(db, 'posts', post.id, 'likes');// referencia a la subcoleccion de likes
          const likeSnap = await getDocs(query(likesRef, where('userId', '==', currentUser.uid)));// consulta para verificar si el usuario le dio like
          post.isLiked = !likeSnap.empty;// setear isLiked segun el resultado de la consulta

          //Lo mismo pero para shares o compartidos
          const sharesRef = collection(db, 'posts', post.id, 'shares');
          const shareSnap = await getDocs(query(sharesRef, where('userId', '==', currentUser.uid)));
          post.isShared = !shareSnap.empty;
        }));
      }

      setPosts(postsData);// setea los posts con los datos obtenidos
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar publicaciones');
    }
  };

  // Checkea el status del follow
  const checkFollowStatus = async () => {
    if (!currentUser) return;
    try {
      const snapshot = await getDocs(query(//query para verificar si el usuario actual sigue al usuario del perfil
        collection(db, 'follows'),
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', userId)
      ));
      setIsFollowing(!snapshot.empty);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // Follow / Unfollow
  const handleFollow = async () => {// Maneja el follow y unfollow de usuarios
    if (!currentUser) return;
    try {
      if (isFollowing) {// si ya esta siguiendo, hacer unfollow
        const snapshot = await getDocs(query(//query para obtener el documento de follow
          collection(db, 'follows'),
          where('followerId', '==', currentUser.uid),
          where('followingId', '==', userId)
        ));
        for (const docSnap of snapshot.docs) {// eliminar cada documento encontrado (deberia ser solo uno)
          await deleteDoc(doc(db, 'follows', docSnap.id));// delete del documento en la bd
        }
        setIsFollowing(false);// actualizar el estado a no siguiendo
        setStats(prev => ({ ...prev, followersCount: Math.max(prev.followersCount - 1, 0) }));// bajar el contador de seguidores en el estado
        toast.success('Dejaste de seguir');
      } else {//esta parte es cuando uno sigue a otro usuario
        await addDoc(collection(db, 'follows'), {// agregar un nuevo documento de follow en la bd
          followerId: currentUser.uid,
          followingId: userId,
          createdAt: serverTimestamp()
        });
        setIsFollowing(true);//setea que ahora si lo sigue 
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));// aumentar el contador de seguidores en el estado
        toast.success('Ahora sigues a este usuario');
        await createNotification({//ahí un await para crear la notificacion de follow en la bd
          toUserId: userId,
          type: 'follow',
          fromUserId: currentUser.uid,
          fromUserName: currentUser.displayName || 'Usuario'
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Error al actualizar seguimiento');
    }
  };

  // Upload foto perfil
  const handleUploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingProfilePic(true);// poner el estado de subida en true
    try {
      const url = await uploadToCloudinary(file, 'petconnect_posts');// subir la imagen a cloudinary y obtener la URL
      setEditForm(prev => ({ ...prev, profilePicture: url }));// setear la URL de la imagen en el estado del formulario de edicion
      toast.success('Foto de perfil subida correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al subir la foto de perfil');
    } finally {
      setIsUploadingProfilePic(false);// poner el estado de subida en false
    }
  };

  // Upload foto mascota
  const handleUploadPetPicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingPetPic(true);
    try {
      const url = await uploadToCloudinary(file, 'petconnect_posts');// subir la imagen a cloudinary y obtener la URL
      setEditForm(prev => ({ ...prev, petPicture: url }));// setear la URL de la imagen en el estado del formulario de edicion
      toast.success('Foto de mascota subida correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al subir la foto de mascota');
    } finally {
      setIsUploadingPetPic(false);
    }
  };

  // Guardar perfil
  const handleSaveProfile = async () => {// Maneja la actualizacion del perfil del usuario
    try {
      const docRef = doc(db, 'users', userId);// referencia al documento del usuario en la coleccion users
      await updateDoc(docRef, { ...editForm });// actualizar el documento con los datos del formulario de edicion
      setProfile({ ...profile, ...editForm });// actualizar el estado del perfil con los nuevos datos, por eso es un set
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  // Reportar usuario
  const handleReportUser = async () => {
    if (!reportReason.trim()) {//que no este vacio
      toast.error('Por favor describe el motivo del reporte');
      return;
    }
    try {
      await addDoc(collection(db, 'reports'), {// agregar un nuevo reporte en la coleccion reports
        reporterId: currentUser.uid,
        reportedUserId: userId,
        reason: reportReason,
        type: 'user',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setReportReason('');
      setShowReportDialog(false);
      toast.success('Usuario reportado');
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Error al reportar usuario');
    }
  };

  // Abrir lista de seguidores / siguiendo
  const openList = async (type) => {
    setListType(type);
    setIsListOpen(true);

    try {
      let userIds = [];
      if (type === 'followers') {
        const snap = await getDocs(query(collection(db, 'follows'), where('followingId', '==', userId)));
        userIds = snap.docs.map(doc => doc.data().followerId);
      } else if (type === 'following') {
        const snap = await getDocs(query(collection(db, 'follows'), where('followerId', '==', userId)));
        userIds = snap.docs.map(doc => doc.data().followingId);
      }

      const usersData = await Promise.all(
        userIds.map(async id => {
          const docSnap = await getDoc(doc(db, 'users', id));
          return { id, ...docSnap.data() };
        })
      );

      setListUsers(usersData);
    } catch (err) {
      console.error('Error fetching list:', err);
      toast.error('Error al cargar la lista');
    }
  };

  if (isLoading) return <div className="text-center py-8">Cargando perfil...</div>;
  if (!profile) return <div className="text-center py-8">Perfil no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Perfil */}
      <Card className="border-2 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex gap-6 items-center">
            {/* Avatar Usuario */}
            <Avatar className="h-32 w-32 border-4 border-orange-300">
              {profile.profilePicture ? (
                <AvatarImage src={profile.profilePicture} alt={profile.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-4xl">
                  {profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Nombre, bio y mascota */}
            <div className="flex-1 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-orange-700">{profile.name}</h2>
                {profile.bio && <p className="mt-1 text-muted-foreground">{profile.bio}</p>}
                {profile.location && (
                  <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {profile.location}
                  </p>
                )}
              </div>

              {profile.petName && profile.petPicture && (
                <div className="flex flex-col items-center ml-6">
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <PawPrint className="h-4 w-4" /> {profile.petName} {profile.petType && `(${profile.petType})`}
                  </p>
                  <img
                    src={profile.petPicture}
                    alt={`${profile.petName} foto`}
                    className="w-24 h-24 rounded-full mt-2 object-cover border-2 border-orange-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center">
              {/* Stats: publicaciones, seguidores, siguiendo */}
              <div className="flex gap-6 flex-1">
                <div className="text-center cursor-pointer" onClick={() => openList('posts')}>
                  <p className="font-bold text-orange-700">{stats.postsCount}</p>
                  <p className="text-sm text-muted-foreground">Publicaciones</p>
                </div>
                <div className="text-center cursor-pointer" onClick={() => openList('followers')}>
                  <p className="font-bold text-orange-700">{stats.followersCount}</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center cursor-pointer" onClick={() => openList('following')}>
                  <p className="font-bold text-orange-700">{stats.followingCount}</p>
                  <p className="text-sm text-muted-foreground">Siguiendo</p>
                </div>
              </div>

              {/* Botón de editar o seguir */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={() => setIsEditing(!isEditing)} className="bg-gradient-to-r from-orange-500 to-amber-500">
                    <Edit2 className="h-4 w-4 ml-2" />
                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      className={isFollowing ? "bg-gray-500 hover:bg-gray-600" : "bg-gradient-to-r from-orange-500 to-amber-500"}
                    >
                      {isFollowing ? <><UserMinus className="h-4 w-4 mr-2" />Dejar de seguir</> : <><UserPlus className="h-4 w-4 mr-2" />Seguir</>}
                    </Button>
                    <Button variant="outline" onClick={() => setShowReportDialog(true)} className="border-red-300 text-red-700">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>


          {/* Editar perfil */}
          {isEditing && (
            <div className="mt-6 space-y-4 border-t pt-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}/>
              </div>

              {/* Foto Perfil */}
              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <input type="file" accept="image/*" className="hidden" id="profile-pic-upload" onChange={handleUploadProfilePicture} disabled={isUploadingProfilePic} />
                <div className="flex gap-2 items-center">
                  <Button type="button" onClick={() => document.getElementById('profile-pic-upload').click()} disabled={isUploadingProfilePic} className="bg-gradient-to-r from-orange-500 to-amber-500">
                    {isUploadingProfilePic ? 'Subiendo...' : 'Subir Foto'}
                  </Button>
                  <span className="text-xs text-muted-foreground">o</span>
                  <Input type="text" placeholder="Pegar URL..." value={editForm.profilePicture} onChange={e => setEditForm({...editForm, profilePicture: e.target.value})} />
                </div>
                {editForm.profilePicture && <img src={editForm.profilePicture} alt="Perfil" className="w-32 h-32 rounded-full mt-2 object-cover" />}
              </div>

              {/* Nombre Mascota */}
              <div className="space-y-2">
                <Label>Nombre de tu Mascota</Label>
                <Input value={editForm.petName} onChange={e => setEditForm({...editForm, petName: e.target.value})}/>
              </div>

              {/* Tipo Mascota */}
              <div className="space-y-2">
                <Label>Tipo de Mascota</Label>
                <Input placeholder="Perro, Gato..." value={editForm.petType} onChange={e => setEditForm({...editForm, petType: e.target.value})}/>
              </div>

              {/* Foto Mascota */}
              <div className="space-y-2">
                <Label>Foto de Mascota</Label>
                <input type="file" accept="image/*" className="hidden" id="pet-pic-upload" onChange={handleUploadPetPicture} disabled={isUploadingPetPic} />
                <div className="flex gap-2 items-center">
                  <Button type="button" onClick={() => document.getElementById('pet-pic-upload').click()} disabled={isUploadingPetPic} className="bg-gradient-to-r from-orange-500 to-amber-500">
                    {isUploadingPetPic ? 'Subiendo...' : 'Subir Foto'}
                  </Button>
                  <span className="text-xs text-muted-foreground">o</span>
                  <Input type="text" placeholder="Pegar URL..." value={editForm.petPicture} onChange={e => setEditForm({...editForm, petPicture: e.target.value})} />
                </div>
                {editForm.petPicture && <img src={editForm.petPicture} alt="Mascota" className="w-32 h-32 rounded-full mt-2 object-cover" />}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea placeholder="Cuéntanos sobre ti..." value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})}/>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input placeholder="Ciudad, País" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})}/>
              </div>

              <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-orange-500 to-amber-500">Guardar Cambios</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-orange-700">Publicaciones</h3>
        {posts.length === 0 ? (
          <Card className="border-2 border-orange-200">
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay publicaciones aún
            </CardContent>
          </Card>
        ) : posts.map(post => (
          <PostCard key={post.id} post={{...post, author: profile}} currentUserId={currentUser?.uid} onDelete={loadPosts} onComment={onCommentClick} />
        ))}
      </div>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reportar Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Describe por qué este usuario viola las reglas de la comunidad
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="Motivo del reporte..." className="min-h-[100px]" value={reportReason} onChange={e => setReportReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReportUser} className="bg-red-600 hover:bg-red-700">Enviar Reporte</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lista Seguidores / Siguiendo */}
      <AlertDialog open={isListOpen} onOpenChange={setIsListOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{listType === 'followers' ? 'Seguidores' : 'Siguiendo'}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto mt-2">
            {listUsers.length === 0 ? (
              <p className="text-muted-foreground text-center">No hay usuarios</p>
            ) : listUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded cursor-pointer">
                <Avatar className="h-8 w-8 border-2 border-orange-300">
                  {user.profilePicture ? (
                    <AvatarImage src={user.profilePicture} />
                  ) : (
                    <AvatarFallback className="bg-orange-300 text-white">{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-orange-700">{user.name}</p>
                  {user.petName && <p className="text-sm text-muted-foreground">con {user.petName}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsListOpen(false)}>Cerrar</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
