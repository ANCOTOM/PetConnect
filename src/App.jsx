import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { CreatePostForm } from './components/CreatePostForm';
import { PostCard } from './components/PostCard';
import { ProfileView } from './components/ProfileView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { AdminPanel } from './components/AdminPanel';
import { CommentsDialog } from './components/CommentsDialog';
import { Card, CardContent } from './components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Toaster } from './components/ui/sonner';
import './styles/Loader.css';

// Firebase imports
import { auth, db } from './firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  orderBy, 
  limit,
  getDocs,
  doc,
  getDoc,
  where
} from 'firebase/firestore';

/**
 * PetConnect - Red Social para Amantes de Mascotas
 * 
 * Aplicación completa con React + Firebase
 * Incluye: OAuth, Recuperación de contraseña, Posts,
 * Notificaciones, Panel de administración
 */

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchType, setSearchType] = useState('users');
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [trendingHashtags, setTrendingHashtags] = useState([]);

  const navigate = useNavigate();

  //Maneja la autenticación del usuario y verifica si la cuenta está suspendida
  //Inicia cuando la app empieza o se monta el componente
  useEffect(() => {
    //Esta funcion escucha los cambios en el estado de auth del usuario
    //Si el usuario inicia sesión o cierra sesión, se ejecuta esta función
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) { //Si hay un usuario logueado
        try {
          // Verificar suspensión antes de dar acceso
        const userDocRef = doc(db, 'users', currentUser.uid); //Construye userDocRef: Que se fija en el documento de Firebase(db) en users y busca el uid del usuario actual 
        const userDocSnap = await getDoc(userDocRef);//hace el getDoc para obtener el snapshot del documento

          if (userDocSnap.exists() && userDocSnap.data().suspended) {//condiciones pa checkear si está suspendido
            await signOut(auth);//fuerza logout
            setUser(null);//limpia el estado del usuario
            setProfile(null);//limpia el estado del perfil
            toast.error('CUENTA SUSPENDIDA: Tu cuenta ha sido suspendida por violar las normas.', {//Mensajito de tipo toast
              duration: 10000,
              action: {
                label: 'Entendido',
                onClick: () => console.log('Undo')
              },
            });
          } else {//Si no esta suspendido
            setUser(currentUser);//setea el estado del usuario
            if (userDocSnap.exists()) {//si el snapshot del doc existe
              setProfile({ id: userDocSnap.id, ...userDocSnap.data() });//setea el perfil con la info del doc
            }
          }
        } catch (error) {//Checkeos de errores
          console.error('Error checking suspension:', error);
          setUser(currentUser);
          await loadProfile(currentUser.uid);
        }
      } else {//Pues si no funciona del todo, limpia y queda en nulo
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  //Si hay usuario, carga el feed
  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user]);
  //Funcion que carga el perfil del usuario, recibe como parametro el userId
  const loadProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));//agarra el doc del usuario
      if (userDoc.exists()) {//si existe, setea el perfil con la info del doc
        setProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadFeed = async () => {//Funcion para cargar el feed
    if (!user) return;//Si no hay usuario, no hace nada

    try {
      // 1. Obtener lista de seguidos para filtrar privacidad
      const followsQuery = query(//Comprueba a ver a quién sigue el usuario actual con respecto a la BD
        collection(db, 'follows'),
        where('followerId', '==', user.uid)
      );
      const followsSnapshot = await getDocs(followsQuery);//Igual que anteriormente con el usuario, obtiene el snapshot
      const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);//Crea un array con los IDs de los usuarios que el usuario actual sigue

      // 2. Cargar posts ordenados por fecha
    
      const postsQuery = query(//Query simple para obtener los posts
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(postsQuery);//Obtiene el snapshot de los posts
      const postsData = [];//Array vacio para guardar los posts que se van a mostrar

      for (const docSnap of snapshot.docs) {//Recorre cada post
        const postData = { id: docSnap.id, ...docSnap.data() };//Crea un objeto (postData) con la info del post

        // FILTRO DE PRIVACIDAD
        // Si es público: mostrar
        // Si es amigos: mostrar solo si soy el autor O sigo al autor
        const isMyPost = postData.userId === user.uid;
        const isFollowingAuthor = followingIds.includes(postData.userId);
        
        if (postData.visibility === 'friends' && !isMyPost && !isFollowingAuthor) {//Si la visibilidad es "amigos" y no soy el autor ni sigo al autor
          continue; // No mostrar este post
        }

       
        if (postData.userId) {//Si el post tiene userId
          const authorDoc = await getDoc(doc(db, 'users', postData.userId));//Obtiene el doc del autor
          postData.author = authorDoc.exists() ? authorDoc.data() : null;//Si existe, añade la info del autor al postData
        }

      
        const likesQuery = query(//Chequea si el usuario le dio like al post con la BD
          collection(db, 'posts', docSnap.id, 'likes'),
          where('userId', '==', user.uid)
        );
        const likesSnapshot = await getDocs(likesQuery);//Obtiene el snapshot de los likes
        postData.isLiked = !likesSnapshot.empty;//Si el snapshot no está vacío, significa que el usuario le dio like

     
        const sharesQuery = query(//Chequea si el usuario compartió el post con la BD
          collection(db, 'posts', docSnap.id, 'shares'),
          where('userId', '==', user.uid)
        );
        const sharesSnapshot = await getDocs(sharesQuery);//Obtiene el snapshot de los shares
        postData.isShared = !sharesSnapshot.empty;//Si el snapshot no está vacío, significa que el usuario compartió el post

        postsData.push(postData);//Finalmente, añade el postData al array de postsData
      }

      setPosts(postsData);//Setea el estado de posts con los postsData filtrados y procesados en temas de los likes y shares o compartidos
    } catch (error) {
      console.error('Error Cargando el feed:', error);
    }
  };

  const handleSearch = async (searchQuery, type) => {//funcion para hacer busquedas, de tipo usuarios o posts
    if (!user) return;//Si no hay usuario, no hace nada

    try {
      if (type === 'users') {//Si es usuario lo que va a buscar
       
        const usersSnapshot = await getDocs(collection(db, 'users'));//Obtiene el snapshot de los usuarios
        const results = usersSnapshot.docs//Se hace la variable que es igual al snapshot de los usuarios
          .map(doc => ({ id: doc.id, ...doc.data() }))//Mapea cada doc a un objeto con la info del usuario
          .filter(u => //Filtra los usuarios cuyo nombre o email coincida con la búsqueda
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||//Si el nombre del usuario incluye la búsqueda
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())//Si el email del usuario incluye la búsqueda
          );

        setSearchResults(results);//Setea el estado de searchResults con los resultados
        setSearchType('users');//Setea el tipo de búsqueda como 'users'
        navigate('/search');//Navega a la página de búsqueda
      } else {//Si no son usuarios, son posts lo que se va a buscar
        
        const postsSnapshot = await getDocs(collection(db, 'posts'));//Obtiene el snapshot de los posts
        const results = [];//Array vacío para guardar los resultados

        for (const docSnap of postsSnapshot.docs) {//Ciclo para recorrer cada post
          const postData = { id: docSnap.id, ...docSnap.data() };//Crea un objeto (postData) con la info del post
          
          if (postData.content?.toLowerCase().includes(searchQuery.toLowerCase())) {//Si el contenido del post incluye la búsqueda
         
            if (postData.userId) {//Si el post tiene userId
              const authorDoc = await getDoc(doc(db, 'users', postData.userId));//Obtiene el doc del autor
              postData.author = authorDoc.exists() ? authorDoc.data() : null;//Si existe, añade la info del autor al postData
            }
            results.push(postData);//Añade el postData a los resultados
          }
        }

        setPosts(results);//Setea el estado de posts con los resultados, o sea lo que se pushea en el array 
        setSearchType('posts');//Setea el tipo de búsqueda como 'posts'
        navigate('/search');//Navega a la página de búsqueda
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const loadFollowing = async () => {//Función para cargar los usuarios que el usuario actual sigue
    if (!user) return;

    try {
      const followsQuery = query(//query para obtener los follows
        collection(db, 'follows'),
        where('followerId', '==', user.uid)//filtro para que solo traiga los follows del usuario actual
      );

      const snapshot = await getDocs(followsQuery);//Obtiene el snapshot de los follows
      const followingData = [];//Array vacío para guardar los datos de los usuarios que sigue

      for (const docSnap of snapshot.docs) {
        const followData = docSnap.data();
        const userDoc = await getDoc(doc(db, 'users', followData.followingId));
        
        if (userDoc.exists()) {
          followingData.push({ id: userDoc.id, ...userDoc.data() });
        }
      }

      setFollowingUsers(followingData);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const handleLogout = async () => {//Función para cerrar sesión
    try {
      await auth.signOut();//Cierra sesión con Firebase Auth
      setUser(null);//Limpia el estado del usuario
      setProfile(null);//Limpia el estado del perfil
      setPosts([]);//Limpia el estado de los posts
      navigate('/');//Navega a la página principal
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const loadRecommendations = async () => {//Función para cargar recomendaciones de usuarios para seguir
    if (!user) return;

    try {
    
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const followsQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', user.uid)
      );
      const followsSnapshot = await getDocs(followsQuery);
      
      const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);
      
      const recommendations = usersSnapshot.docs //Array de usuarios recomendados
        .map(doc => ({ id: doc.id, ...doc.data() }))//Mapea cada doc a un objeto con la info del usuario
        .filter(u => u.id !== user.uid && !followingIds.includes(u.id))//Filtra para excluir al usuario actual y a los que ya sigue
        .slice(0, 10); //Limita a 10 recomendaciones

      setRecommendedUsers(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadTrendingHashtags = async () => {
    if (!user) return;

    try {
   
      const hashtagsQuery = query(
        collection(db, 'hashtags'),
        orderBy('count', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(hashtagsQuery);
      const hashtags = snapshot.docs.map(doc => ({
        id: doc.id,
        hashtag: doc.data().hashtag,
        count: doc.data().count
      }));

      setTrendingHashtags(hashtags);
    } catch (error) {
      console.error('Error loading trending hashtags:', error);
    }
  };

  const handleHashtagClick = async (hashtag) => {
    if (!user) return;

    try {
      const cleanHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;

     
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const results = [];

      for (const docSnap of postsSnapshot.docs) {
        const postData = { id: docSnap.id, ...docSnap.data() };
        
        if (postData.content?.toLowerCase().includes(`#${cleanHashtag.toLowerCase()}`)) {
     
          if (postData.userId) {
            const authorDoc = await getDoc(doc(db, 'users', postData.userId));
            postData.author = authorDoc.exists() ? authorDoc.data() : null;
          }
          results.push(postData);
        }
      }

      setPosts(results);
      setSelectedHashtag(`#${cleanHashtag}`);
      navigate(`/hashtag/${cleanHashtag}`);
    } catch (error) {
      console.error('Error loading hashtag posts:', error);
    }
  };

  const handleViewChange = (view) => {//Función para manejar el cambio de vista en la navegación
    switch (view) {
      case 'feed':
        navigate('/');
        loadFeed();
        break;
      case 'following':
        navigate('/following');
        loadFollowing();
        break;
      case 'profile':
        navigate(`/profile/${user?.uid}`);
        break;
      case 'discover':
        navigate('/discover');
        loadRecommendations();
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'admin':
        navigate('/admin');
        break;
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-yellow-50 to-amber-100">
      <img 
        src="/Dog chasing tail.gif" 
        alt="Perro persiguiendo su cola" 
        className="loader-gif"
      />
      <div className="cargando-texto">
        <p>Cargando...</p>
      </div>
    </div>
  );
}





 
  function ProfileRoute() {
    const { userId } = useParams();
    return (
      <ProfileView
        userId={userId || user?.uid}
        isOwnProfile={!userId || userId === user?.uid}
        onCommentClick={setSelectedPostId}
      />
    );
  }

  function FollowingRoute() {
    useEffect(() => {
      loadFollowing();
    }, []);
    
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-orange-700">Siguiendo</h2>
        {followingUsers.length === 0 ? (
          <Card className="border-2 border-orange-200">
            <CardContent className="py-8 text-center text-muted-foreground">
              No sigues a nadie aún
            </CardContent>
          </Card>
        ) : (
          followingUsers.map((followUser) => (
            <Card
              key={followUser.id}
              className="border-2 border-orange-200 hover:border-orange-300 cursor-pointer transition-colors"
              onClick={() => handleUserClick(followUser.id)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <Avatar className="h-12 w-12 border-2 border-orange-300">
                  {followUser.profilePicture && (
                    <AvatarImage src={followUser.profilePicture} alt={followUser.name} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                    {followUser.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-orange-700">{followUser.name}</p>
                  {followUser.petName && (
                    <p className="text-sm text-muted-foreground">
                      {followUser.petName} {followUser.petType && `(${followUser.petType})`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  function DiscoverRoute() {
    useEffect(() => {
      loadRecommendations();
    }, []);
    
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-orange-700">Descubre usuarios nuevos</h2>
        <p className="text-muted-foreground">Usuarios recomendados que podrías seguir</p>
        {recommendedUsers.length === 0 ? (
          <Card className="border-2 border-orange-200">
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay recomendaciones disponibles
            </CardContent>
          </Card>
        ) : (
          recommendedUsers.map((recUser) => (
            <Card
              key={recUser.id}
              className="border-2 border-orange-200 hover:border-orange-300 cursor-pointer transition-colors"
              onClick={() => handleUserClick(recUser.id)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <Avatar className="h-12 w-12 border-2 border-orange-300">
                  {recUser.profilePicture && (
                    <AvatarImage src={recUser.profilePicture} alt={recUser.name} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                    {recUser.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-orange-700">{recUser.name}</p>
                  {recUser.petName && (
                    <p className="text-sm text-muted-foreground">
                      {recUser.petName} {recUser.petType && `(${recUser.petType})`}
                    </p>
                  )}
                  {recUser.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{recUser.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm onSuccess={(newUser) => {
          setUser(newUser);
          loadProfile(newUser.uid);
        }} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
      <Header
        userName={profile?.name || 'Usuario'}
        userProfilePicture={profile?.profilePicture}
        onSearch={handleSearch}
        onLogout={handleLogout}
        currentUserId={user?.uid}
        isAdmin={profile?.isAdmin || false}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
        
          <Route path="/" element={
            <div className="max-w-2xl mx-auto space-y-6">
              <CreatePostForm
                userName={profile?.name || 'Usuario'}
                userProfilePicture={profile?.profilePicture}
                onPostCreated={loadFeed}
              />
              {posts.length === 0 ? (
                <Card className="border-2 border-orange-200">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No hay publicaciones aún. ¡Sé el primero en publicar!
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.uid}
                    onDelete={loadFeed}
                    onComment={setSelectedPostId}
                    onHashtagClick={handleHashtagClick}
                     onUserClick={handleUserClick}  
                  />
                ))
              )}
            </div>
          } />

         
          <Route path="/search" element={
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-orange-700">
                {searchType === 'users' ? 'Usuarios encontrados' : 'Publicaciones encontradas'}
              </h2>
              {searchType === 'users' ? (
                searchResults.length === 0 ? (
                  <Card className="border-2 border-orange-200">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </CardContent>
                  </Card>
                ) : (
                  searchResults.map((searchUser) => (
                    <Card
                      key={searchUser.id}
                      className="border-2 border-orange-200 hover:border-orange-300 cursor-pointer transition-colors"
                      onClick={() => handleUserClick(searchUser.id)}
                    >
                      <CardContent className="flex items-center gap-4 py-4">
                        <Avatar className="h-12 w-12 border-2 border-orange-300">
                          {searchUser.profilePicture && (
                            <AvatarImage src={searchUser.profilePicture} alt={searchUser.name} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                            {searchUser.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-orange-700">{searchUser.name}</p>
                          {searchUser.petName && (
                            <p className="text-sm text-muted-foreground">
                              {searchUser.petName} {searchUser.petType && `(${searchUser.petType})`}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )
              ) : (
                posts.length === 0 ? (
                  <Card className="border-2 border-orange-200">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No se encontraron publicaciones
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user.uid}
                      onDelete={loadFeed}
                      onComment={setSelectedPostId}
                      onHashtagClick={handleHashtagClick}
                       onUserClick={handleUserClick}  
                    />
                  ))
                )
              )}
            </div>
          } />

       
          <Route path="/profile" element={<ProfileRoute />} />
          <Route path="/profile/:userId" element={<ProfileRoute />} />

          
          <Route path="/notifications" element={
            <NotificationsView
              user={user}
              onNotificationClick={(notification) => {
                if (notification.postId) {
                  setSelectedPostId(notification.postId);
                } else if (notification.fromUserId) {
                  handleUserClick(notification.fromUserId);
                }
              }}
            />
          } />

      
          <Route path="/following" element={
            <FollowingRoute />
          } />

        
          <Route path="/discover" element={
            <DiscoverRoute />
          } />


     
          <Route path="/hashtag/:hashtag" element={
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-orange-700">Publicaciones con {selectedHashtag}</h2>
                <button className="text-orange-700 hover:bg-orange-100 px-4 py-2 rounded" onClick={() => navigate('/')}>
                  Volver al feed
                </button>
              </div>
              {posts.length === 0 ? (
                <Card className="border-2 border-orange-200">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No hay publicaciones con este hashtag
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.uid}
                    onDelete={() => handleHashtagClick(selectedHashtag || '')}
                    onComment={setSelectedPostId}
                    onHashtagClick={handleHashtagClick}
                    onUserClick={handleUserClick}  
                  />
                ))
              )}
            </div>
          } />

       
          <Route path="/settings" element={
            <SettingsView
              onAccountDeleted={handleLogout}
              onUserClick={handleUserClick}
            />
          } />

     
          <Route path="/admin" element={
            profile?.isAdmin ? (
              <AdminPanel
                currentUserId={user.uid}
                onUserClick={handleUserClick}
              />
            ) : (
              <div className="text-center py-8 text-orange-700">Acceso denegado</div>
            )
          } />
        </Routes>
      </main>

      <CommentsDialog
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />

      <Toaster />
    </div>
  );
}