import FingerprintJS from '@fingerprintjs/fingerprintjs';
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { usuariovalidarpassword } from '../../Api/Taskusuario';
import { useAuthStore, useidcaja } from '../authStore';
import { useNavigate } from 'react-router-dom';

// Keeping all the existing styled components and animations...
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: white;
  position: relative;
  font-family: Arial, sans-serif;
  overflow: hidden;
`;

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    rgba(99, 102, 241, 0.08),
    rgba(255, 255, 255, 0.9) 30%,
    rgba(99, 102, 241, 0.05) 50%,
    rgba(255, 255, 255, 0.9) 70%,
    rgba(99, 102, 241, 0.08)
  );
  background-size: 400% 400%;
  animation: ${gradientMove} 15s ease infinite;
`;

const Card = styled.div`
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  box-shadow: 
    0 20px 40px -12px rgba(99, 102, 241, 0.2),
    0 0 0 1px rgba(99, 102, 241, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-style: preserve-3d;
  perspective: 1000px;

  @media (max-width: 640px) {
    padding: 1.5rem;
    max-width: 320px;
  }
`;

const FloatingElement = styled.div`
  animation: ${float} 3s ease infinite;
`;

const AccentBar = styled(FloatingElement)`
  width: 32px;
  height: 3px;
  background: linear-gradient(90deg, #6366F1, #818CF8);
  border-radius: 1.5px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  transition: transform 0.2s;
  
  svg {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    color: #9CA3AF;
    transition: all 0.2s;
  }
  
  &:focus-within {
    transform: translateY(-1px);
    
    svg {
      color: #6366F1;
    }
  }
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: #6366F1;
  }
  
  svg {
    position: static;
    transform: none;
    left: auto;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1.5px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  font-size: 17px;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #6366F1;
    background: white;
    box-shadow: 
      0 4px 12px rgba(99, 102, 241, 0.1),
      0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const ErrorMessage = styled.span`
  color: #DC2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  background-size: 200% 200%;
  animation: ${gradientMove} 3s ease infinite;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: ${props => props.$isLoading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  box-shadow: 
    0 4px 12px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-top: 0.5rem;
  opacity: ${props => props.$isLoading ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 20px rgba(99, 102, 241, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    svg {
      transform: translateX(3px);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    transition: transform 0.2s;
    width: 16px;
    height: 16px;
  }
`;

const Divider = styled.div`
  width: 100%;
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(99, 102, 241, 0.2),
      transparent
    );
  }
  
  span {
    position: relative;
    background: white;
    padding: 0 0.75rem;
    color: #6B7280;
    font-size: 0.813rem;
  }
`;

const LinkButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #6B7280;
  font-size: 0.813rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #6366F1;
    transform: translateY(-1px);
  }
`;

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState('Cargando...');
  const { setidcaja } = useidcaja();
  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    // Inicializa la instancia de FingerprintJS
    const fpPromise = FingerprintJS.load();
    
    // Genera la huella digital del dispositivo
    fpPromise
      .then(fp => fp.get())
      .then(result => {
        // El ID único basado en las características del navegador y dispositivo
        setDeviceId(result.visitorId);
        console.log(result.visitorId);
      })
      .catch(error => {
        setDeviceId('Error al generar ID');
        console.error(error);
      });
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    setApiError(null);
    
    // Validate empty fields
    const newErrors = {};
    
    // Username validation
    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }
    
    // Password validation
    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // If there are errors, show them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If no errors, continue with submission
    setIsLoading(true);
    
    try {
      // API call would go here
      const response = await usuariovalidarpassword({usuario:username,pass:password,serial:deviceId});
      if (response.data.data===0) {
        setApiError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }else{
        if (response.data.caja===0) {
          setidcaja(response.data.id_caja)
          useAuthStore.getState().setAuthData(response.data.data);
          navigate('/app')
        }else{
          setidcaja(response.data.id_caja)
          useAuthStore.getState().setAuthData(response.data.data);          
          navigate('/caja');
        }
      }
      console.log(response.data.data);
      // Clear fields after successful submission
    } catch (error) {
      setApiError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundGradient />
      <Card>
        <AccentBar />
        <Title>Bienvenido</Title>
        <Subtitle>Nos alegra verte de nuevo</Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Usuario</Label>
            <InputWrapper>
              <User />
              <Input
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </InputWrapper>
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Contraseña</Label>
            <InputWrapper>
              <Lock />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TogglePasswordButton 
                type="button" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </TogglePasswordButton>
            </InputWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          {apiError && (
            <ErrorMessage style={{ textAlign: 'center' }}>
              {apiError}
            </ErrorMessage>
          )}

          <SubmitButton type="submit" disabled={isLoading} $isLoading={isLoading}>
            {isLoading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight />
              </>
            )}
          </SubmitButton>

          <Divider>
            <span>O continúa con</span>
          </Divider>

          <LinkButton type="button">
            ¿No tienes cuenta? Regístrate
          </LinkButton>
          
          <LinkButton type="button">
            ¿Olvidaste tu contraseña?
          </LinkButton>
        </Form>
      </Card>
    </Container>
  );
};

export default LoginForm;