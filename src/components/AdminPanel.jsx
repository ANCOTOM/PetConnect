import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Ban,
  CheckCircle,
  Trash2,
  UserCog,
} from 'lucide-react';

// Firebase imports
import { db } from '../firebase/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

export function AdminPanel({ currentUserId, onUserClick }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      await Promise.all([loadStats(), loadReports(), loadUsers()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Contar usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      const suspendedUsers = usersSnapshot.docs.filter(
        doc => doc.data().suspended === true
      ).length;

      // Contar posts
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const totalPosts = postsSnapshot.size;

      // Contar reportes
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const totalReports = reportsSnapshot.size;
      const pendingReports = reportsSnapshot.docs.filter(
        doc => doc.data().status === 'pending'
      ).length;

      setStats({
        totalUsers,
        totalPosts,
        totalReports,
        pendingReports,
        suspendedUsers
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas');
    }
  };

  const loadReports = async () => {
    try {
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const reportsData = [];

      for (const reportDoc of reportsSnapshot.docs) {
        const reportData = { id: reportDoc.id, ...reportDoc.data() };

        // Cargar info del reportador
        if (reportData.reporterId) {
          const reporterDoc = await getDoc(doc(db, 'users', reportData.reporterId));
          reportData.reporter = reporterDoc.exists() ? reporterDoc.data() : null;
        }

        // Cargar info del reportado
        if (reportData.reportedUserId) {
          const reportedDoc = await getDoc(doc(db, 'users', reportData.reportedUserId));
          reportData.reported = reportedDoc.exists() ? reportedDoc.data() : null;
          reportData.type = 'user';
        } else if (reportData.reportedPostId) {
          const postDoc = await getDoc(doc(db, 'posts', reportData.reportedPostId));
          reportData.reported = postDoc.exists() ? postDoc.data() : null;
          reportData.type = 'post';
        }

        reportsData.push(reportData);
      }

      // Ordenar por fecha (más recientes primero)
      reportsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });

      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar reportes');
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar: admins primero, luego por nombre
      usersData.sort((a, b) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status,
        resolvedAt: serverTimestamp(),
        resolvedBy: currentUserId
      });

      toast.success('Reporte actualizado');
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Error al actualizar reporte');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        suspended: true,
        suspendedAt: serverTimestamp()
      });

      toast.success('Usuario suspendido');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Error al suspender usuario');
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        suspended: false,
        unsuspendedAt: serverTimestamp()
      });

      toast.success('Suspensión removida');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Error al remover suspensión');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      // Eliminar el post
      await deleteDoc(doc(db, 'posts', postId));

      toast.success('Publicación eliminada');
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar publicación');
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isAdmin: true,
        madeAdminAt: serverTimestamp()
      });

      toast.success('Usuario convertido en administrador');
      loadUsers();
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Error al hacer administrador');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    
    // Manejar tanto Timestamp de Firestore como strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-orange-700">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-orange-600" />
        <h2 className="text-orange-700">Panel de Administración</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Usuarios</p>
                <p className="text-blue-600">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
                <p className="text-green-600">{stats?.totalPosts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reportes Totales</p>
                <p className="text-yellow-600">{stats?.totalReports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reportes Pendientes</p>
                <p className="text-red-600">{stats?.pendingReports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Suspendidos</p>
                <p className="text-purple-600">{stats?.suspendedUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        {/* REPORTES */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Reportes de Usuarios y Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay reportes</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="border border-orange-200">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {/* Encabezado reporte */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    report.status === 'pending'
                                      ? 'default'
                                      : report.status === 'resolved'
                                      ? 'secondary'
                                      : 'secondary'
                                  }
                                >
                                  {report.status === 'pending'
                                    ? 'Pendiente'
                                    : report.status === 'resolved'
                                    ? 'Resuelto'
                                    : 'Rechazado'}
                                </Badge>

                                <Badge variant="outline">
                                  {report.type === 'user' ? 'Usuario' : 'Publicación'}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground">
                                Reportado por:{' '}
                                <span className="text-orange-700">
                                  {report.reporter?.name || 'Desconocido'}
                                </span>
                              </p>

                              <p className="text-sm text-muted-foreground">
                                Fecha: {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Motivo */}
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-sm">
                              <span className="text-orange-700">Motivo:</span> {report.reason}
                            </p>
                          </div>

                          {/* Si es reporte de usuario */}
                          {report.type === 'user' && report.reported && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Avatar className="h-8 w-8 border-2 border-orange-300">
                                {report.reported.profilePicture && (
                                  <AvatarImage
                                    src={report.reported.profilePicture}
                                    alt={report.reported.name}
                                  />
                                )}
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                                  {report.reported.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p
                                  className="text-sm cursor-pointer text-orange-700 hover:underline"
                                  onClick={() => onUserClick(report.reportedUserId)}
                                >
                                  {report.reported.name}
                                </p>

                                {report.reported.suspended && (
                                  <Badge variant="destructive" className="text-xs">
                                    Suspendido
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Si es reporte de publicación */}
                          {report.type === 'post' && report.reported && (
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-sm line-clamp-2">
                                {report.reported.content || 'Contenido multimedia'}
                              </p>
                            </div>
                          )}

                          {/* Acciones de admin */}
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              {/* Suspender usuario */}
                              {report.type === 'user' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspender Usuario
                                    </Button>
                                  </AlertDialogTrigger>

                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        ¿Suspender usuario?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        El usuario será suspendido y no podrá acceder a su
                                        cuenta.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          await handleSuspendUser(report.reportedUserId);
                                          await handleResolveReport(
                                            report.id,
                                            'resolved'
                                          );
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Suspender
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Eliminar publicación */}
                              {report.type === 'post' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar Publicación
                                    </Button>
                                  </AlertDialogTrigger>

                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        ¿Eliminar publicación?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        La publicación será eliminada permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          await handleDeletePost(
                                            report.reportedPostId
                                          );
                                          await handleResolveReport(
                                            report.id,
                                            'resolved'
                                          );
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Rechazar */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleResolveReport(report.id, 'rejected')
                                }
                              >
                                Rechazar Reporte
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USUARIOS */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {users.map((user) => (
                  <Card key={user.id} className="border border-orange-200">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-orange-300">
                          {user.profilePicture && (
                            <AvatarImage
                              src={user.profilePicture}
                              alt={user.name}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p
                            className="text-orange-700 cursor-pointer hover:underline"
                            onClick={() => onUserClick(user.id)}
                          >
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          {user.isAdmin && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                          {user.suspended && (
                            <Badge variant="destructive">Suspendido</Badge>
                          )}
                          {user.deactivated && (
                            <Badge variant="outline">Desactivado</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!user.isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMakeAdmin(user.id)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Hacer Admin
                          </Button>
                        )}

                        {user.suspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnsuspendUser(user.id)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Reactivar
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Suspender
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Suspender a {user.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  El usuario será suspendido y no podrá acceder a su
                                  cuenta.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Suspender
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}