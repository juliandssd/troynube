import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Save, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { usuarioinsertar } from '../../../Api/Taskusuario';

// Styled Components
const FormContainer = styled.div`
  width: 450px;
  font-family: 'Inter', sans-serif;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  margin: 0;
`;

const FormHeader = styled.div`
  background-color: #6366F1;
  color: white;
  font-weight: 600;
  padding: 20px 24px;
  font-size: 18px;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const FormScrollContainer = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Estilo del scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
  }
`;

const FormBody = styled.form`
  padding: 24px;
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;
`;

const FormRow = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  display: flex;
  align-items: center;
`;

const Required = styled.span`
  color: #EF4444;
  margin-left: 4px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.error ? '#EF4444' : '#E5E7EB'};
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  background-color: #F9FAFB;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#EF4444' : '#6366F1'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'};
    background-color: #ffffff;
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  &:hover {
    color: #4B5563;
  }
`;

const ErrorMessage = styled.div`
  color: #EF4444;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid ${props => props.error ? '#EF4444' : '#E5E7EB'};
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  appearance: menulist;
  background-color: #F9FAFB;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#EF4444' : '#6366F1'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'};
    background-color: #ffffff;
  }
`;

// Componentes para el selector de cajas personalizado
const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button`
  padding: 12px 16px;
  border: 1px solid ${props => props.error ? '#EF4444' : '#E5E7EB'};
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  background-color: #F9FAFB;
  transition: all 0.2s ease;
  text-align: left;
  cursor: pointer;
  color: ${props => props.isEmpty ? '#9CA3AF' : '#000000'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#EF4444' : '#6366F1'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'};
    background-color: #ffffff;
  }
  
  &:after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #6B7280;
  }
`;

const OptionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  
  /* Estilo del scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
  }
`;

const Option = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: #F3F4FF;
  }
  
  &.selected {
    background-color: #EEF2FF;
    color: #6366F1;
    font-weight: 500;
  }
`;

const UserInputGroup = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const UserInput = styled(Input)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex: 1;
`;

const DomainSuffix = styled.div`
  padding: 12px 16px;
  background-color: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-left: none;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  color: #6B7280;
  white-space: nowrap;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #F3F4F6;
  width: 100%;
`;

const SaveButton = styled.button`
  background-color: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #4F46E5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #C7D2FE;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Mensaje para cuando no hay cajas disponibles
const NoCajasMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #6B7280;
`;

const NewUserForm = ({ 
  onClose, 
  id_empresa, 
  caja = [], 
  onAddEvent, 
  editUser = null, // Nuevo prop para editar usuario
  onUpdateEvent // Nuevo prop para actualizar usuario
}) => {
  // Estado para determinar si estamos editando o creando
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Inicializar el estado del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    name: '',
    caja: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Efecto para cargar los datos del usuario a editar
  useEffect(() => {
    if (editUser) {
      setIsEditMode(true);
      
      // Extraer el username sin el dominio
      let username = editUser.usuario;
      if (username.includes('@')) {
        username = username.split('@')[0];
      }
      
      // Obtener el ID de la caja asociada al usuario (aquí habría que ajustar según la estructura de datos)
      // Por ahora asumimos que editUser ya tiene un campo id_caja
      const userCajaId = editUser.id_caja || '';
      
      setFormData({
        username: username,
        password: '', // Por seguridad, no cargamos la contraseña
        confirmPassword: '',
        role: editUser.Rol,
        name: editUser.Nombre,
        caja: userCajaId
      });
      
      // Marcar todos los campos como tocados excepto las contraseñas
      setTouched({
        username: true,
        role: true,
        name: true,
        caja: !!userCajaId
      });
    }
  }, [editUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Eliminar espacios en el campo username
    if (name === 'username') {
      const valueWithoutSpaces = value.replace(/\s+/g, '');
      setFormData({
        ...formData,
        [name]: valueWithoutSpaces
      });
      
      // Validar en tiempo real
      validateField(name, valueWithoutSpaces);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Validar en tiempo real
      validateField(name, value);
    }
  };

  // Función para insertar nuevo usuario
  const btninsertar = async () => {
    try {
      const data = {
        nombre: formData.name,
        usuario: `${formData.username}@${caja[0].admin}`,
        rol: formData.role,
        password: formData.confirmPassword,
        id_empresa: id_empresa,
        id_caja: formData.caja,
      };
      
      const response = await usuarioinsertar(data);
      
      // Crear el objeto de nuevo usuario con la estructura correcta
      const newUserData = {
        id_usuario: response.data.data,
        Rol: formData.role,
        Estado: "ACTIVO",
        Nombre: formData.name,
        usuario: `${formData.username}@${caja[0].admin}`,
        lastLogin: "N/A", // Agregar un valor por defecto para lastLogin
        id_caja: formData.caja // Añadir el ID de la caja para futuras ediciones
      };
      
      // Llamar a la función de callback con el nuevo usuario
      if (onAddEvent) {
        onAddEvent(newUserData);
      }
      
      // Cerrar el formulario después de agregar el usuario
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setErrors({
        ...errors,
        submit: 'Error al crear el usuario. Inténtelo de nuevo.'
      });
    }
  };
  
  // Función para actualizar usuario existente
  const btnactualizar = async () => {
    try {
      // Verificar si necesitamos actualizar la contraseña
      const needPasswordUpdate = formData.password && formData.confirmPassword;
      
      const data = {
        id_usuario: editUser.id_usuario,
        nombre: formData.name,
        usuario: `${formData.username}@${caja[0].admin}`,
        rol: formData.role,
        id_empresa: id_empresa,
        id_caja: formData.caja,
      };
      
      // Solo incluir la contraseña si se proporcionó una nueva
      if (needPasswordUpdate) {
        data.password = formData.confirmPassword;
      }
      
      // Llamar a la API para actualizar (esta función necesita ser creada en el backend)
      const response = "await usuarioactualizar(data);";
      
      if (response.data.data > 0) {
        // Crear el objeto de usuario actualizado
        const updatedUserData = {
          id_usuario: editUser.id_usuario,
          Rol: formData.role,
          Estado: editUser.Estado || "ACTIVO", // Mantener el estado original
          Nombre: formData.name,
          usuario: `${formData.username}@${caja[0].admin}`,
          lastLogin: editUser.lastLogin || "N/A",
          id_caja: formData.caja
        };
        
        // Llamar a la función de callback con el usuario actualizado
        if (onUpdateEvent) {
          onUpdateEvent(updatedUserData);
        }
        
        // Cerrar el formulario después de actualizar el usuario
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setErrors({
        ...errors,
        submit: 'Error al actualizar el usuario. Inténtelo de nuevo.'
      });
    }
  };
  
  // Estado para controlar la apertura del dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Manejador para toggle de dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!touched.caja) {
      setTouched({
        ...touched,
        caja: true
      });
      validateField('caja', formData.caja);
    }
  };

  // Manejador para cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      const selectWrapper = document.querySelector('.select-wrapper');
      if (selectWrapper && !selectWrapper.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Manejador para seleccionar una caja
  const handleCajaSelect = (cajaId) => {
    setFormData({
      ...formData,
      caja: cajaId
    });
    
    // Validar el campo de caja
    validateField('caja', cajaId);
    setTouched({
      ...touched,
      caja: true
    });
    
    // Cerrar el dropdown después de seleccionar
    setDropdownOpen(false);
  };
  
  // Función para obtener el texto que se muestra en el botón select
  const getSelectButtonText = () => {
    if (!formData.caja) {
      return "-- Seleccionar Caja --";
    } else {
      const selectedCaja = caja.find(item => item.id_caja === formData.caja);
      return selectedCaja ? (selectedCaja.Descripcion || `Caja ${selectedCaja.id_caja}`) : "";
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, formData[name]);
  };
  
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'El usuario es obligatorio';
        } else if (value.length < 3) {
          newErrors.username = 'Mínimo 3 caracteres';
        } else if (/\s/.test(value)) {
          newErrors.username = 'El usuario no puede contener espacios';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'password':
        // Si estamos editando y el campo está vacío, no lo validamos (la contraseña es opcional en edición)
        if (isEditMode && !value) {
          delete newErrors.password;
        } else {
          if (!value) {
            newErrors.password = 'La contraseña es obligatoria';
          } else if (value.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
          } else {
            delete newErrors.password;
          }
        }
        
        // Validar confirmPassword si ya fue tocado
        if (touched.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
        
      case 'confirmPassword':
        // Si estamos editando y el campo está vacío, no lo validamos
        if (isEditMode && !value && !formData.password) {
          delete newErrors.confirmPassword;
        } else {
          if (!value) {
            newErrors.confirmPassword = 'Confirme la contraseña';
          } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
        
      case 'role':
        if (!value) {
          newErrors.role = 'Seleccione un rol';
        } else {
          delete newErrors.role;
        }
        break;
        
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es obligatorio';
        } else {
          delete newErrors.name;
        }
        break;
      
      case 'caja':
        if (!value) {
          newErrors.caja = 'Seleccione una caja';
        } else {
          delete newErrors.caja;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };
  
  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    
    // Marcar todos los campos como tocados
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
    });
    
    // Validar usuario
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    } else if (/\s/.test(formData.username)) {
      newErrors.username = 'El usuario no puede contener espacios';
    }
    
    // Validar contraseña (solo requerida para nuevos usuarios o si se está intentando cambiar)
    if (!isEditMode || formData.password || formData.confirmPassword) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirme la contraseña';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    // Validar rol
    if (!formData.role) {
      newErrors.role = 'Seleccione un rol';
    }
    
    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    // Validar cajas - siempre se requiere seleccionar una caja
    if (!formData.caja) {
      newErrors.caja = 'Seleccione una caja';
    }
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    if (validateForm()) {
      if (isEditMode) {
        btnactualizar();
      } else {
        btninsertar();
      }
    }
  };
  
  // Verificar si hay errores para deshabilitar el botón
  const isFormValid = () => {
    // Validación básica de campos requeridos
    const requiredFieldsValid = formData.username && 
                               formData.role && 
                               formData.name &&
                               formData.caja;
                               
    // Si estamos en modo edición, las contraseñas son opcionales pero deben coincidir si se ingresan
    const passwordsValid = isEditMode 
      ? (!formData.password && !formData.confirmPassword) || (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword)
      : (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword);
    
    return requiredFieldsValid && passwordsValid && Object.keys(errors).length === 0;
  };

  return (
    <FormContainer>
      <FormHeader>
        {isEditMode ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
        {onClose && (
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        )}
      </FormHeader>
      
      <FormScrollContainer>
        <FormBody onSubmit={handleSubmit}>
          <FormRow>
            <Label>
              Usuario
              <Required>*</Required>
            </Label>
            <UserInputGroup>
              <UserInput
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="nombreusuario"
                error={touched.username && errors.username}
                required
              />
              <DomainSuffix>@{caja[0]?.admin}</DomainSuffix>
            </UserInputGroup>
            {touched.username && errors.username && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.username}
              </ErrorMessage>
            )}
          </FormRow>

          <FormRow>
            <Label>
              {isEditMode ? 'Nueva Contraseña' : 'Contraseña'}
              {!isEditMode && <Required>*</Required>}
            </Label>
            <InputWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={isEditMode ? "Dejar vacío para mantener la actual" : "••••••••••"}
                error={touched.password && errors.password}
                required={!isEditMode}
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputWrapper>
            {touched.password && errors.password && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.password}
              </ErrorMessage>
            )}
          </FormRow>

          <FormRow>
            <Label>
              {isEditMode ? 'Confirmar Nueva Contraseña' : 'Reingresar nueva contraseña'}
              {!isEditMode && <Required>*</Required>}
            </Label>
            <InputWrapper>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={isEditMode ? "Confirmar nueva contraseña" : "••••••••••"}
                error={touched.confirmPassword && errors.confirmPassword}
                required={!isEditMode}
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputWrapper>
            {touched.confirmPassword && errors.confirmPassword && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.confirmPassword}
              </ErrorMessage>
            )}
          </FormRow>

          <FormRow>
            <Label>
              Rol
              <Required>*</Required>
            </Label>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.role && errors.role}
              required
            >
              <option value="">-- Seleccionar Rol --</option>
              <option value="Administrador">Administrador</option>
              <option value="Inventario">Inventario</option>
              <option value="Cajero">Cajero</option>
              <option value="Mesero">Mesero</option>
            </Select>
            {touched.role && errors.role && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.role}
              </ErrorMessage>
            )}
          </FormRow>

          <FormRow>
            <Label>
              Nombre
              <Required>*</Required>
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nombre completo"
              error={touched.name && errors.name}
              required
            />
            {touched.name && errors.name && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.name}
              </ErrorMessage>
            )}
          </FormRow>
          
          {/* Campo para seleccionar caja (siempre visible) */}
          <FormRow>
            <Label>
              Caja
              <Required>*</Required>
            </Label>
            <SelectWrapper className="select-wrapper">
              <SelectButton 
                type="button"
                onClick={toggleDropdown}
                error={touched.caja && errors.caja}
                isEmpty={!formData.caja}
              >
                {getSelectButtonText()}
              </SelectButton>
              
              {dropdownOpen && (
                <OptionsDropdown>
                  {caja && caja.length > 0 ? (
                    caja.map(item => (
                      <Option 
                        key={item.id_caja} 
                        onClick={() => handleCajaSelect(item.id_caja)}
                        className={formData.caja === item.id_caja ? 'selected' : ''}
                      >
                        {item.Descripcion || `Caja ${item.id_caja}`}
                      </Option>
                    ))
                  ) : (
                    <NoCajasMessage>
                      No hay cajas disponibles
                    </NoCajasMessage>
                  )}
                </OptionsDropdown>
              )}
            </SelectWrapper>
            {touched.caja && errors.caja && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.caja}
              </ErrorMessage>
            )}
          </FormRow>

          {errors.submit && (
            <ErrorMessage>
              <AlertCircle size={12} />
              {errors.submit}
            </ErrorMessage>
          )}

          <ButtonContainer>
            <SaveButton 
              type="submit"
              disabled={!isFormValid()}
            >
              <Save size={16} />
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </SaveButton>
          </ButtonContainer>
        </FormBody>
      </FormScrollContainer>
    </FormContainer>
  );
};

export default NewUserForm;