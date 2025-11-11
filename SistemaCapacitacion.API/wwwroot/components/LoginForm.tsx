import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import griverLogo from 'figma:asset/fa6c3a0ac70be6d9e7fc047b43138faecc3ecc35.png';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  const demoCredentials = [
    { role: 'Administrador', email: 'admin@griver.com', password: '123456' },
    { role: 'Recursos Humanos', email: 'maria.fernandez@griver.com', password: '123456' },
    { role: 'Empleado', email: 'ana.garcia@griver.com', password: '123456' },
    { role: 'Becario', email: 'luis.martinez@griver.com', password: '123456' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-xl shadow-lg">
              <img
                src={griverLogo}
                alt="Griver Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-medium text-gray-900">Griver</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestión de Cursos de Inducción
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Acceso al Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@griver.com"
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pl-9 pr-9"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="border-destructive/50 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Credenciales de Demostración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{cred.role}</div>
                <div className="text-muted-foreground text-xs">
                  Email: {cred.email}
                </div>
                <div className="text-muted-foreground text-xs">
                  Contraseña: {cred.password}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Griver y 115_BLACK_REAPER. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}