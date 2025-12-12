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

 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Verificar suspensión antes de dar acceso
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data().suspended) {
            await signOut(auth);
            setUser(null);
            setProfile(null);
            toast.error('CUENTA SUSPENDIDA: Tu cuenta ha sido suspendida por violar las normas.', {
              duration: 10000,
              action: {
                label: 'Entendido',
                onClick: () => console.log('Undo')
              },
            });
          } else {
            setUser(currentUser);
            if (userDocSnap.exists()) {
              setProfile({ id: userDocSnap.id, ...userDocSnap.data() });
            }
          }
        } catch (error) {
          console.error('Error checking suspension:', error);
          setUser(currentUser);
          await loadProfile(currentUser.uid);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

 
  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user]);

  const loadProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadFeed = async () => {
    if (!user) return;

    try {
    
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(postsQuery);
      const postsData = [];

      for (const docSnap of snapshot.docs) {
        const postData = { id: docSnap.id, ...docSnap.data() };

       
        if (postData.userId) {
          const authorDoc = await getDoc(doc(db, 'users', postData.userId));
          postData.author = authorDoc.exists() ? authorDoc.data() : null;
        }

      
        const likesQuery = query(
          collection(db, 'posts', docSnap.id, 'likes'),
          where('userId', '==', user.uid)
        );
        const likesSnapshot = await getDocs(likesQuery);
        postData.isLiked = !likesSnapshot.empty;

     
        const sharesQuery = query(
          collection(db, 'posts', docSnap.id, 'shares'),
          where('userId', '==', user.uid)
        );
        const sharesSnapshot = await getDocs(sharesQuery);
        postData.isShared = !sharesSnapshot.empty;

        postsData.push(postData);
      }

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const handleSearch = async (searchQuery, type) => {
    if (!user) return;

    try {
      if (type === 'users') {
       
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const results = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => 
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
          );

        setSearchResults(results);
        setSearchType('users');
        navigate('/search');
      } else {
        
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const results = [];

        for (const docSnap of postsSnapshot.docs) {
          const postData = { id: docSnap.id, ...docSnap.data() };
          
          if (postData.content?.toLowerCase().includes(searchQuery.toLowerCase())) {
         
            if (postData.userId) {
              const authorDoc = await getDoc(doc(db, 'users', postData.userId));
              postData.author = authorDoc.exists() ? authorDoc.data() : null;
            }
            results.push(postData);
          }
        }

        setPosts(results);
        setSearchType('posts');
        navigate('/search');
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const loadFollowing = async () => {
    if (!user) return;

    try {
      const followsQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', user.uid)
      );

      const snapshot = await getDocs(followsQuery);
      const followingData = [];

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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
      setPosts([]);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;

    try {
    
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const followsQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', user.uid)
      );
      const followsSnapshot = await getDocs(followsQuery);
      
      const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);
      
      const recommendations = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid && !followingIds.includes(u.id))
        .slice(0, 10); 

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

  const handleViewChange = (view) => {
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