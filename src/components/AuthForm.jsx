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
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export function AuthForm({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

const handleSignUp = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  const formData = new FormData(e.currentTarget);
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');
  const petName = formData.get('petName');
  const petType = formData.get('petType');

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(' Usuario creado en Auth:', userCredential.user.uid);

   
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      name,
      petName,
      petType,
      email,
      createdAt: new Date()
    });
    console.log(' Usuario guardado en Firestore:', userRef.id);

  } catch (err) {
    console.error(' No funciona:', err);
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onSuccess(userCredential.user);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (providerName) => {
    let provider;
    switch (providerName) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'facebook':
        provider = new FacebookAuthProvider();
        break;
      case 'github':
        provider = new GithubAuthProvider();
        break;
      default:
        return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      onSuccess(result.user);
    } catch (err) {
      console.error('OAuth error:', err);
      toast.error(`Error al iniciar sesión con ${providerName}`);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Se ha enviado un correo de recuperación');
      setShowResetDialog(false);
      setResetEmail('');
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
                  <Input id="signup-petType" name="petType" type="text" placeholder="Perro, Gato, etc." />
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

      {/* Reset Password Dialog */}
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
