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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
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
  orderBy,
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

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [editForm, setEditForm] = useState({
    name: '',
    petName: '',
    petType: '',
    bio: '',
    location: '',
    profilePicture: '',
  });

  useEffect(() => {
    loadProfile();
    loadPosts();
    if (!isOwnProfile) checkFollowStatus();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        
        // Calcular stats
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
        const postsSnap = await getDocs(postsQuery);
        
        const followersQuery = query(collection(db, 'follows'), where('followingId', '==', userId));
        const followersSnap = await getDocs(followersQuery);
        
        const followingQuery = query(collection(db, 'follows'), where('followerId', '==', userId));
        const followingSnap = await getDocs(followingQuery);
        
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
          profilePicture: data.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar publicaciones');
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser) return;
    try {
      const followQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', userId)
      );
      const snapshot = await getDocs(followQuery);
      setIsFollowing(!snapshot.empty);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      if (isFollowing) {
        // Unfollow
        const followQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', currentUser.uid),
          where('followingId', '==', userId)
        );
        const snapshot = await getDocs(followQuery);
        
        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, 'follows', docSnap.id));
        }
        
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followersCount: Math.max(prev.followersCount - 1, 0) }));
        toast.success('Dejaste de seguir');
      } else {
        // Follow
        await addDoc(collection(db, 'follows'), {
          followerId: currentUser.uid,
          followingId: userId,
          createdAt: serverTimestamp()
        });
        
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
        toast.success('Ahora sigues a este usuario');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Error al actualizar seguimiento');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { ...editForm });
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      toast.error('Por favor describe el motivo del reporte');
      return;
    }
    
    try {
      await addDoc(collection(db, 'reports'), {
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

  if (isLoading) {
    return <div className="text-center py-8">Cargando perfil...</div>;
  }
  
  if (!profile) {
    return <div className="text-center py-8">Perfil no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-2 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-orange-300">
                {profile.profilePicture ? (
                  <AvatarImage src={profile.profilePicture} alt={profile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-4xl">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-orange-700">{profile.name}</h2>
                  {profile.petName && (
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      <PawPrint className="h-4 w-4" />
                      {profile.petName} {profile.petType && `(${profile.petType})`}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancelar' : 'Editar Perfil'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleFollow}
                        className={isFollowing 
                          ? "bg-gray-500 hover:bg-gray-600" 
                          : "bg-gradient-to-r from-orange-500 to-amber-500"
                        }
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Dejar de seguir
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Seguir
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowReportDialog(true)}
                        className="border-red-300 text-red-700"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="font-bold text-orange-700">{stats.postsCount}</p>
                  <p className="text-sm text-muted-foreground">Publicaciones</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-orange-700">{stats.followersCount}</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-orange-700">{stats.followingCount}</p>
                  <p className="text-sm text-muted-foreground">Siguiendo</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-muted-foreground">{profile.bio}</p>
              )}
              
              {profile.location && (
                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="font-bold text-orange-700">Editar Perfil</h3>
              
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>URL de Foto de Perfil</Label>
                <Input
                  value={editForm.profilePicture}
                  onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Nombre de tu Mascota</Label>
                <Input
                  value={editForm.petName}
                  onChange={(e) => setEditForm({ ...editForm, petName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Mascota</Label>
                <Input
                  value={editForm.petType}
                  onChange={(e) => setEditForm({ ...editForm, petType: e.target.value })}
                  placeholder="Perro, Gato, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti y tu mascota..."
                />
              </div>

              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Ciudad, País"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                className="bg-gradient-to-r from-orange-500 to-amber-500"
              >
                Guardar Cambios
              </Button>
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
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={{ ...post, author: profile }}
              currentUserId={currentUser?.uid}
              onDelete={loadPosts}
              onComment={onCommentClick}
            />
          ))
        )}
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
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe el motivo del reporte..."
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReportUser} className="bg-red-600 hover:bg-red-700">
              Enviar Reporte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}