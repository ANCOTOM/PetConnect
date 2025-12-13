import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bell, Home, Sparkles, Settings, Shield, LogOut, PawPrint, Search } from 'lucide-react';
import { Badge } from './ui/badge';

export function Header({ 
  userName,
  userProfilePicture, 
  onSearch, 
  onLogout,
  notificationsCount = 0,
  isAdmin = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('users');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {// Maneja el envio del formulario de busqueda
    e.preventDefault();
    if (searchQuery.trim()) {// Si la consulta de busqueda no esta vacia
      onSearch(searchQuery.trim(), searchType);// Llamar a la funcion onSearch pasada como prop
      setSearchQuery('');// Limpiar el campo de busqueda
    }
  };

  const isActive = (path) => location.pathname === path;// Verifica si la ruta actual coincide con la proporcionada

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-white p-2 rounded-full">
              <PawPrint className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-white hidden sm:block">PetConnect</span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">{/*Aca se usa la funcion de handleSearch */}
            <Select value={searchType} onValueChange={(value) => setSearchType(value)}>
              <SelectTrigger className="w-32 bg-white/90 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">Usuarios</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchType === 'users' ? 'Buscar usuarios...' : 'Buscar publicaciones...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 border-none focus:bg-white"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-2">

            {/* Home */}
            <Button
              variant={isActive('/') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => navigate('/')}
              className={isActive('/') ? '' : 'text-white hover:bg-white/20'}
            >
              <Home className="h-5 w-5" />
            </Button>

            {/* Discover */}
            <Button
              variant={isActive('/discover') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => navigate('/discover')}
              className={isActive('/discover') ? '' : 'text-white hover:bg-white/20'}
              title="Descubrir"
            >
              <Sparkles className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant={isActive('/notifications') ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => navigate('/notifications')}
                className={isActive('/notifications') ? '' : 'text-white hover:bg-white/20'}
              >
                <Bell className="h-5 w-5" />
              </Button>

              {notificationsCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                >
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </Badge>
              )}
            </div>

            {/* Settings */}
            <Button
              variant={isActive('/settings') ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => navigate('/settings')}
              className={isActive('/settings') ? '' : 'text-white hover:bg-white/20'}
              title="Configuración"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Admin */}
            {isAdmin && (
              <Button
                variant={isActive('/admin') ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => navigate('/admin')}
                className={isActive('/admin') ? '' : 'text-white hover:bg-white/20'}
                title="Panel de Administración"
              >
                <Shield className="h-5 w-5" />
              </Button>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Avatar que abre tu perfil */}
            <Avatar 
              className="h-9 w-9 border-2 border-white cursor-pointer" 
              onClick={() => navigate(`/profile/`)}
            >
              {userProfilePicture ? (
                <AvatarImage src={userProfilePicture} alt={userName} />
              ) : (
                <AvatarFallback className="bg-white text-orange-600">
                  {userName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

          </nav>
        </div>
      </div>
    </header>
  );
}
