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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export function AdminPanel({ currentUserId, onUserClick }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [reportFilter, setReportFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      await Promise.all([loadStats(), loadReports(), loadUsers(), loadAllPosts()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllPosts = async () => {
    try {
      const postsSnapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar publicaciones');
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
      loadAllPosts();
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
        <Card 
          className={`border-2 border-blue-200 cursor-pointer transition-all hover:scale-105 ${activeTab === 'users' && userFilter === 'all' ? 'ring-2 ring-blue-400' : ''}`}
          onClick={() => {
            setActiveTab('users');
            setUserFilter('all');
          }}
        >
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

        <Card 
          className={`border-2 border-green-200 cursor-pointer transition-all hover:scale-105 ${activeTab === 'posts' ? 'ring-2 ring-green-400' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
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

        <Card 
          className={`border-2 border-yellow-200 cursor-pointer transition-all hover:scale-105 ${activeTab === 'reports' && reportFilter === 'all' ? 'ring-2 ring-yellow-400' : ''}`}
          onClick={() => {
            setActiveTab('reports');
            setReportFilter('all');
          }}
        >
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

        <Card 
          className={`border-2 border-red-200 cursor-pointer transition-all hover:scale-105 ${activeTab === 'reports' && reportFilter === 'pending' ? 'ring-2 ring-red-400' : ''}`}
          onClick={() => {
            setActiveTab('reports');
            setReportFilter('pending');
          }}
        >
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

        <Card 
          className={`border-2 border-purple-200 cursor-pointer transition-all hover:scale-105 ${activeTab === 'users' && userFilter === 'suspended' ? 'ring-2 ring-purple-400' : ''}`}
          onClick={() => {
            setActiveTab('users');
            setUserFilter('suspended');
          }}
        >
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
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
                  {reports
                    .filter(report => reportFilter === 'all' || report.status === reportFilter)
                    .map((report) => (
                    <Card key={report.id} className="border border-orange-200">
                      <CardContent className="py-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                report.status === 'pending'
                                  ? 'destructive'
                                  : report.status === 'resolved'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {report.status === 'pending'
                                ? 'Pendiente'
                                : report.status === 'resolved'
                                ? 'Resuelto'
                                : 'Rechazado'}
                            </Badge>

                            <div>
                              <p className="font-medium text-orange-900">
                                Reporte #{report.id.slice(0, 6)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {report.createdAt?.toDate?.().toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium text-orange-800">
                              {report.type === 'user' ? 'Usuario' : 'Publicación'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Por: {report.reporter?.name || 'Desconocido'}
                            </p>
                          </div>
                        </div>

                        {/* Contenido Expandible */}
                        {selectedReport === report.id && (
                          <div className="mt-4 pt-4 border-t border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-orange-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-orange-800 mb-1">
                                Motivo del reporte:
                              </p>
                              <p className="text-sm text-orange-700">
                                {report.reason}
                              </p>
                            </div>

                            {report.type === 'post' && report.reported && (
                              <div className="bg-white border border-orange-100 p-3 rounded-md">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Contenido reportado:
                                </p>
                                <p className="text-sm">{report.reported.content}</p>
                                {report.reported.imageUrl && (
                                  <img
                                    src={report.reported.imageUrl}
                                    alt="Reported content"
                                    className="mt-2 h-32 w-auto rounded-md object-cover"
                                  />
                                )}
                              </div>
                            )}

                            {report.type === 'user' && report.reported && (
                              <div className="flex items-center gap-3 bg-white border border-orange-100 p-3 rounded-md">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={report.reported.profilePicture} />
                                  <AvatarFallback>{report.reported.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{report.reported.name}</p>
                                  <p className="text-xs text-muted-foreground">{report.reported.email}</p>
                                </div>
                              </div>
                            )}

                            {report.status === 'pending' && (
                              <div className="flex gap-2 justify-end pt-2">
                                {/* Acciones de resolución */}
                                {report.type === 'user' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                                      >
                                        <Ban className="h-4 w-4 mr-1" />
                                        Suspender Usuario
                                      </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          ¿Suspender usuario reportado?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          El usuario será suspendido y el reporte marcado
                                          como resuelto.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async () => {
                                            await handleSuspendUser(
                                              report.reportedUserId
                                            );
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

                                {report.type === 'post' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Eliminar Post
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
                        )}
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
                {users
                  .filter(user => userFilter === 'all' || (userFilter === 'suspended' && user.suspended))
                  .map((user) => (
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

        {/* PUBLICACIONES */}
        <TabsContent value="posts" className="space-y-4">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <FileText className="h-5 w-5" />
                Gestión de Publicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay publicaciones</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="border border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {post.imageUrl && (
                            <img 
                              src={post.imageUrl} 
                              alt="Post content" 
                              className="h-24 w-24 object-cover rounded-md bg-gray-100"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-orange-900">{post.authorName || 'Usuario desconocido'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {post.createdAt?.toDate?.().toLocaleDateString() || 'Fecha desconocida'}
                                </p>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive" className="h-8 bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePost(post.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                              <span>❤️ {post.likesCount || 0}</span>
                              <span>💬 {post.commentsCount || 0}</span>
                              <span>🔄 {post.sharesCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}