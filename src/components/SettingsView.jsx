import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Lock, Shield, UserX, Trash2, UserMinus } from 'lucide-react';
import { getAuth, updatePassword, deleteUser } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export function SettingsView({ onAccountDeleted, onUserClick }) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileVisibility, setProfileVisibility] = useState('public');
  const [postsVisibility, setPostsVisibility] = useState('public');
  const [friendsVisibility, setFriendsVisibility] = useState('public');
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true);

  useEffect(() => {// cargar configuraciones de privacidad y usuarios bloqueados al montar
    if (!currentUser) return;
    loadPrivacySettings();
    loadBlockedUsers();
  }, [currentUser]);

  const handleChangePassword = async () => {// Maneja el cambio de contraseña del usuario
    if (!newPassword || newPassword.length < 6) {// Validar que la nueva contraseña tenga al menos 6 caracteres
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {// Validar que las contraseñas coincidan
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsChangingPassword(true);// poner el estado de cambio en true
    try {
      await updatePassword(currentUser, newPassword);// actualizar la contraseña con Firebase Auth
      toast.success('Contraseña actualizada exitosamente');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);//cuando termina, setea que ya no estamos cambiando nada
    }
  };

  const loadPrivacySettings = async () => {// Cargar configuraciones de privacidad desde Firestore
    try {
      const userRef = doc(db, 'users', currentUser.uid);// referencia al documento del usuario
      const userSnap = await getDocs(userRef);
      if (userSnap.exists()) {// si el documento existe
        const data = userSnap.data();// obtener los datos
        setProfileVisibility(data.profileVisibility || 'public');// setear los estados con los datos obtenidos o valores por defecto
        setPostsVisibility(data.postsVisibility || 'public');
        setFriendsVisibility(data.friendsVisibility || 'public');
      }
    } catch (error) {}
  };

  const handleSavePrivacy = async () => {// Maneja el guardado de configuraciones de privacidad
    setIsSavingPrivacy(true);// poner el estado de guardado en true
    try {
      const userRef = doc(db, 'users', currentUser.uid);// referencia al documento del usuario
      await updateDoc(userRef, { profileVisibility, postsVisibility, friendsVisibility });//update en la BD
      toast.success('Configuración de privacidad actualizada');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const loadBlockedUsers = async () => {// Cargar la lista de usuarios bloqueados desde Firestore
    setIsLoadingBlocked(true);
    try {
      const blockedRef = collection(db, 'blockedUsers');// referencia a la coleccion de usuarios bloqueados
      const q = query(blockedRef, where('blockerId', '==', currentUser.uid));// consulta para obtener los usuarios bloqueados por el usuario actual
      const snapshot = await getDocs(q);// ejecutar la consulta
      const users = [];// array para almacenar los usuarios bloqueados
      snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));// mapear los documentos obtenidos y pushearlos al array de una vez
      setBlockedUsers(users);// setear el estado con los usuarios bloqueados
    } catch (error) {} finally {
      setIsLoadingBlocked(false);
    }
  };

  const handleUnblockUser = async (userId, docId) => {// Maneja el desbloqueo de un usuario
    try {
      await deleteDoc(doc(db, 'blockedUsers', docId));// eliminar el documento de la coleccion blockedUsers
      toast.success('Usuario desbloqueado');
      setBlockedUsers(prev => prev.filter(u => u.id !== docId));
    } catch (error) {
      toast.error('Error al desbloquear usuario');
    }
  };

  const handleDeactivateAccount = async () => {// Maneja la desactivacion de la cuenta del usuario
    try {
      const userRef = doc(db, 'users', currentUser.uid);// referencia al documento del usuario
      await updateDoc(userRef, { isActive: false });// actualizar el campo isActive a false
      toast.success('Cuenta desactivada exitosamente');
      setTimeout(() => onAccountDeleted(), 2000);
    } catch (error) {
      toast.error('Error al desactivar la cuenta');
    }
  };

  const handleDeleteAccount = async () => {// Maneja la eliminacion permanente de la cuenta del usuario
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid));// eliminar el documento del usuario
      await deleteUser(currentUser);// eliminar el usuario de Firebase Auth
      toast.success('Cuenta eliminada exitosamente');
      
      setTimeout(() => {
        if (onAccountDeleted) onAccountDeleted();// llamar al callback si existe
        window.location.href = '/';// redirigir al usuario a la pagina principal
      }, 2000);// esperar 2 segundos para que vea el mensaje de exito
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Por seguridad, cierra sesión y vuelve a entrar para eliminar tu cuenta');
      } else {
        toast.error(error.message || 'Error al eliminar la cuenta');
      }
    }
  };

  if (!currentUser) {
    return <div className="text-center py-8">Debes iniciar sesión</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-orange-700">Configuración</h2>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="blocked">Bloqueados</TabsTrigger>
          <TabsTrigger value="danger">Zona Peligrosa</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva Contraseña</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Contraseña</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Shield className="h-5 w-5" />
                Configuración de Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>¿Quién puede ver tu perfil?</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Todos (Público)</SelectItem>
                    <SelectItem value="friends">Solo Amigos</SelectItem>
                    <SelectItem value="private">Solo Yo (Privado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>¿Quién puede ver tus publicaciones?</Label>
                <Select value={postsVisibility} onValueChange={setPostsVisibility}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Todos (Público)</SelectItem>
                    <SelectItem value="friends">Solo Amigos</SelectItem>
                    <SelectItem value="private">Solo Yo (Privado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>¿Quién puede ver tu lista de amigos?</Label>
                <Select value={friendsVisibility} onValueChange={setFriendsVisibility}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Todos (Público)</SelectItem>
                    <SelectItem value="friends">Solo Amigos</SelectItem>
                    <SelectItem value="private">Solo Yo (Privado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSavePrivacy}
                disabled={isSavingPrivacy}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {isSavingPrivacy ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <UserMinus className="h-5 w-5" />
                Usuarios Bloqueados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBlocked ? (
                <p className="text-center text-muted-foreground">Cargando...</p>
              ) : blockedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">No has bloqueado a ningún usuario</p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg">
                      <div className="flex-1 cursor-pointer" onClick={() => onUserClick(user.id)}>
                        <p className="text-orange-700">{user.name}</p>
                        {user.petName && <p className="text-sm text-muted-foreground">{user.petName} {user.petType && `(${user.petType})`}</p>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockUser(user.id, user.id)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Desbloquear
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <UserX className="h-5 w-5" />
                Zona Peligrosa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-red-600">Desactivar Cuenta</h4>
                <p className="text-sm text-muted-foreground">Tu cuenta será desactivada temporalmente. Puedes reactivarla iniciando sesión nuevamente.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Desactivar Cuenta</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>Tu cuenta será desactivada temporalmente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeactivateAccount} className="bg-red-600 hover:bg-red-700">Desactivar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-red-600 flex items-center gap-2"><Trash2 className="h-4 w-4" />Eliminar Cuenta</h4>
                <p className="text-sm text-muted-foreground">Tu cuenta y todos tus datos serán eliminados permanentemente.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Eliminar Cuenta Permanentemente</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>Esto eliminará permanentemente tu cuenta y toda la información asociada.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">Sí, eliminar mi cuenta</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
