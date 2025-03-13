import React, { useState } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff } from 'lucide-react';
import { empresainsertar } from '../../../Api/Taskempresa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../authStore';
const FormContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  color: #111827;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #4B5563;
  font-size: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.error ? '#EF4444' : '#D1D5DB'};
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#EF4444' : '#6366F1'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #374151;
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  margin-top: 0.25rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.error ? '#EF4444' : '#D1D5DB'};
  
  &:checked {
    background-color: #6366F1;
    border-color: #6366F1;
  }
`;

const TermsText = styled.label`
  font-size: 0.875rem;
  color: #4B5563;
`;

const Link = styled.a`
  color: #6366F1;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #4F46E5;
  }

  &:disabled {
    background: #D1D5DB;
    cursor: not-allowed;
  }
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#6366F1' : '#D1D5DB'};
`;

const RegistroForm = () => {
  const [formData, setFormData] = useState({
    negocio: '',
    adminName: '',
    email: '',
    celular: '',
    password: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const validateField = (name, value) => {
    switch (name) {
      case 'negocio':
        return value.trim().length >= 3 ? '' : 'El nombre del negocio debe tener al menos 3 caracteres';
      case 'adminName':
        return value.trim().length >= 3 ? '' : 'El nombre del administrador debe tener al menos 3 caracteres';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Por favor ingrese un email válido';
      case 'celular':
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(value) ? '' : 'Por favor ingrese un número de celular válido (10 dígitos)';
      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(value) 
          ? '' 
          : 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
      case 'acceptTerms':
        return value ? '' : 'Debe aceptar los términos y condiciones';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field on change
    const error = validateField(name, newValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const data = {
          nombre: formData.negocio,
          correo: formData.email,
          celular: formData.celular,
          password: formData.password,
          adminName: formData.adminName
        };
        
        const response = await empresainsertar(data);
        if (response.data.data[0] === "La empresa ya existe") {
          setErrors(prev => ({
            ...prev,
            negocio: 'Esta empresa ya está registrada',
            submit: 'Ya existe una cuenta con este nombre de empresa'
          }));
        } else {
          useAuthStore.getState().setAuthData(response.data.data);
          navigate('/app',{replace:true})
        }
      } catch (error) {
        console.log(error);
        setErrors(prev => ({
          ...prev,
          submit: 'Error al crear la cuenta. Por favor intente nuevamente.'
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <Title>Crea tu cuenta troynube</Title>
        <Subtitle>Comienza tu prueba gratuita</Subtitle>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

        <FormGroup>
          <Label>Nombre del negocio</Label>
          <Input
            type="text"
            name="negocio"
            value={formData.negocio}
            onChange={handleChange}
            placeholder="Ej: Restaurante El Sabor"
            error={errors.negocio}
          />
          {errors.negocio && <ErrorMessage>{errors.negocio}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Nombre del administrador</Label>
          <Input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
            error={errors.adminName}
          />
          {errors.adminName && <ErrorMessage>{errors.adminName}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Email de contacto</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nombre@empresa.com"
            error={errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Número de celular</Label>
          <Input
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="Ingrese 10 dígitos"
            error={errors.celular}
            maxLength={10}
          />
          {errors.celular && <ErrorMessage>{errors.celular}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Contraseña</Label>
          <PasswordContainer>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              error={errors.password}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </PasswordContainer>
          <HelpText>
            Debe contener mayúsculas, minúsculas y números
          </HelpText>
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>

        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            error={errors.acceptTerms}
          />
          <TermsText>
            Acepto las <Link href="#">Condiciones del Servicio</Link> y las{' '}
            <Link href="#">Políticas de Privacidad</Link> de Fudo.
          </TermsText>
        </CheckboxContainer>
        {errors.acceptTerms && <ErrorMessage>{errors.acceptTerms}</ErrorMessage>}

        <Button 
          type="submit" 
          disabled={!formData.acceptTerms || isSubmitting}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <DotsContainer>
        <Dot active />
        <Dot />
      </DotsContainer>
    </FormContainer>
  );
};

export default RegistroForm;