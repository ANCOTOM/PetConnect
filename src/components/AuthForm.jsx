import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { PawPrint } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { auth, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export function AuthForm({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [editForm, setEditForm] = useState({//Estado para el formulario de registro
    petType: ''
  });
  const [petTypeCustom, setPetTypeCustom] = useState('');

 
  const handleSignUp = async (e) => {//Función para manejar el registro de usuarios
    e.preventDefault();//Prevenir el comportamiento por defecto del formulario
    setIsLoading(true);//Indicar que se está procesando
    setError('');

    const formData = new FormData(e.currentTarget);//Obtener los datos del formulario
    //Declara todas las variables y sus gets de los campos de la Base de datos
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const petName = formData.get('petName');

    const petTypeFinal = editForm.petType === 'Otro' ? petTypeCustom : editForm.petType;

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Guardar usuario en Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        name: name || email.split('@')[0],
        profilePicture: "",
        petName: petName || "",
        petType: petTypeFinal || "",
        bio: "",
        location: "",
        email,
        createdAt: new Date()
      }, { merge: true });

      onSuccess?.(userCredential.user);
      toast.success('Registro exitoso');

    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleSignIn = async (e) => {//funcion para manejar el inciio de sesión
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);//Obtener los datos del formulario
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);//Iniciar sesión con email y contraseña
      
      // Verificar si el usuario está suspendido
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().suspended) {
        await signOut(auth);
        // El toast se maneja globalmente en App.jsx para evitar duplicados(lo que avisa que esta suspendido)
        return;
      }

      onSuccess(userCredential.user);
    } catch (err) {
      console.error('Sign in error:', err);
      // Evitar sobrescribir el error si ya lo establecimos manualmente
      if (!error) {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

 
  const handleOAuthSignIn = async (providerName) => {//Funcion para manejar el OAuth
    let provider;//Declarar variable provider
    switch (providerName) {
      //una instancia para cada tipo de proveedor segun nombre 
      case 'google': provider = new GoogleAuthProvider(); break;
      case 'facebook': provider = new FacebookAuthProvider(); break;
      case 'github': provider = new GithubAuthProvider(); break;
      default: return;
    }

    try {
      const result = await signInWithPopup(auth, provider);//un await que espera la respuesta para hacer la autenticación
      const user = result.user;//Obtener el usuario del resultado

      // Referencia al documento del usuario en Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // Verificar si el usuario está suspendido
      if (userSnap.exists() && userSnap.data().suspended) {
        await signOut(auth);
        // El toast se maneja globalmente en App.jsx para evitar duplicados
        return;
      }

      if (!userSnap.exists()) {//Si no existe el usuario en Firebase, creamos un nuevo documento
        await setDoc(userRef, {
          name: user.displayName || user.email.split('@')[0],
          profilePicture: user.photoURL || "",
          petName: "",
          petType: "",
          bio: "",
          location: "",
          email: user.email,
          createdAt: new Date()
        }, { merge: true });
      }

      onSuccess?.(user);
      toast.success('Login exitoso');

    } catch (err) {
      console.error('OAuth error:', err);
      toast.error(`Error al iniciar sesión con ${providerName}`);
    }
  };

 
  const handleResetPassword = async () => {//Funcion para manejar el reseteo de la contraseña
    if (!resetEmail) {//Validar que el email no esté vacío
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);//un await que espera la respuesta para enviar el correo de reseteo
      toast.success('Se ha enviado un correo de recuperación');
      setShowResetDialog(false);//Cerrar el diálogo
      setResetEmail('');//Limpiar el campo de email
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Error al enviar correo de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-yellow-50 to-amber-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-orange-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-full">
              <PawPrint className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-orange-600">PetConnect</CardTitle>
          <CardDescription>Red social para amantes de mascotas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>

            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Correo Electrónico</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="tu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Contraseña</Label>
                  <Input id="signin-password" name="password" type="password" placeholder="••••••••" required />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>

                <Button type="button" variant="link" className="w-full text-orange-600" onClick={() => setShowResetDialog(true)}>
                  ¿Olvidaste tu contraseña?
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O continúa con</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" onClick={() => handleOAuthSignIn('google')} disabled={isLoading}>Google</Button>
                  <Button type="button" variant="outline" onClick={() => handleOAuthSignIn('facebook')} disabled={isLoading}>Facebook</Button>
                  <Button type="button" variant="outline" onClick={() => handleOAuthSignIn('github')} disabled={isLoading}>GitHub</Button>
                </div>
              </form>
            </TabsContent>

           
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nombre Completo</Label>
                  <Input id="signup-name" name="name" type="text" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Correo Electrónico</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="tu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input id="signup-password" name="password" type="password" placeholder="••••••••" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-petName">Nombre de tu Mascota</Label>
                  <Input id="signup-petName" name="petName" type="text" placeholder="Max" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-petType">Tipo de Mascota</Label>
                  <select
                    id="signup-petType"
                    name="petType"
                    value={editForm.petType}
                    onChange={(e) => setEditForm({ ...editForm, petType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Pez">Pez</option>
                    <option value="Iguana">Iguana</option>
                    <option value="Otro">Otro</option>
                  </select>

                  {editForm.petType === 'Otro' && (
                    <Input
                      type="text"
                      placeholder="Escribe el tipo de mascota"
                      value={petTypeCustom}
                      onChange={(e) => setPetTypeCustom(e.target.value)}
                    />
                  )}
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Correo Electrónico</Label>
              <Input id="reset-email" type="email" placeholder="tu@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancelar</Button>
              <Button onClick={handleResetPassword} disabled={isLoading} className="bg-gradient-to-r from-orange-500 to-amber-500">
                {isLoading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
