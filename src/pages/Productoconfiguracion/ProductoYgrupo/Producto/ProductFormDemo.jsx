import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { productoinsertar, productomostrarcodigo } from '../../../../Api/TaskgrupoYproducto';
import { useAuthStore } from '../../../authStore';

const PRIMARY_COLOR = '#6366F1'; // Color morado/indigo

const ProductFormDemo = ({ onClose, onSave, id_grupo, onAddEvent }) => {
  const authData = useAuthStore((state) => state.authData);
  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    precioCompra: '',
    ivaRate: '0',
    incRate: '0',
    ganancia: '',
    precioVenta: '',
    preciodomicilio: '',
    hay: '',
    minimo: ''
  });

  // Valores calculados
  const [calculatedValues, setCalculatedValues] = useState({
    valorIVA: '0',
    valorINC: '0',
    valorUtilidad: '0'
  });

  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efecto para la animación de entrada
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para formatear números con puntos como separadores de miles
  const formatNumber = (value) => {
    if (!value) return '';
    
    // Eliminar cualquier carácter no numérico
    const onlyDigits = value.toString().replace(/[^\d]/g, '');
    
    // Aplicar formato de miles (cada 3 dígitos)
    return onlyDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Función para desformatear números (quitar puntos) antes de cálculos
  const unformatNumber = (value) => {
    if (!value) return 0;
    // Simplemente eliminar todos los puntos para obtener el valor numérico
    return parseFloat(value.toString().replace(/\./g, ''));
  };

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Convert descripcion to uppercase
    if (name === "descripcion") {
      newValue = value.toUpperCase();
    }
    
    // Formatear campos numéricos
    const numericFields = ['precioCompra', 'ganancia', 'precioVenta', 'preciodomicilio', 'minimo'];
    if (numericFields.includes(name)) {
      // Solo permitir dígitos y puntos (para separadores de miles)
      if (/^[\d.]*$/.test(value)) {
        // Eliminar todos los puntos primero y aplicar formato
        const digitsOnly = value.replace(/\./g, '');
        newValue = formatNumber(digitsOnly);
      } else {
        // Si contiene caracteres no permitidos, mantener el valor anterior
        newValue = formData[name];
      }
    }
    
    setFormData({
      ...formData,
      [name]: newValue
    });

    // Recalcular valores si cambian relevantes
    if (['precioCompra', 'ivaRate', 'incRate', 'ganancia'].includes(name)) {
      calculateValues({
        ...formData,
        [name]: newValue
      });
    }
    
    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Calcular valores de impuestos y utilidad
  const calculateValues = (data) => {
    const precioCompra = unformatNumber(data.precioCompra);
    const ivaRate = parseFloat(data.ivaRate || 0);
    const incRate = parseFloat(data.incRate || 0);
    const ganancia = unformatNumber(data.ganancia);
    
    const valorIVA = precioCompra * (ivaRate / 100);
    const valorINC = precioCompra * (incRate / 100);
    const valorUtilidad = precioCompra * (ganancia / 100);
    
    // Formatear los valores calculados con formato de separador de miles
    setCalculatedValues({
      valorIVA: formatNumber(Math.round(valorIVA)),
      valorINC: formatNumber(Math.round(valorINC)),
      valorUtilidad: formatNumber(Math.round(valorUtilidad))
    });
  };


  useEffect(() => {
    const Fetdata = async () => {
      try {
        const response = await productomostrarcodigo({id: authData[1]})
        setFormData(prevFormData => ({
          ...prevFormData,
          codigo: response.data.data,
          minimo:0,
          precioCompra:0,
          preciodomicilio:0
        }));
      } catch (error) {
        console.error("Error fetching code:", error);
      }
    }
    Fetdata();
  }, [authData[1]])
  
  // Validar formulario
  const validateForm = async () => {
    const newErrors = {};
    
    if (!formData.codigo) {
      newErrors.codigo = 'Código es requerido';
    }
    
    if (!formData.descripcion) {
      newErrors.descripcion = 'Descripción es requerida';
    }

    if (!formData.hay) {
      newErrors.hay = 'Este campo no debe estar vacio';
    }
    
    if (!formData.precioVenta || unformatNumber(formData.precioVenta) <= 0) {
      newErrors.precioVenta = 'Precio de venta es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Make handleSubmit async and prevent double submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If already submitting, don't allow another submission
    if (isSubmitting) return;
    
    // Set submitting state to true
    setIsSubmitting(true);
    
    // Validate form
    const isValid = await validateForm();
    
    if (isValid) {
      try {
        // Desformatear números para el envío - directamente al objeto data
        const data = {
          descripcion: formData.descripcion,
          id_grupo: id_grupo,
          stock: formData.hay,
          stockminimo: unformatNumber(formData.minimo),
          precioventa: unformatNumber(formData.precioVenta),
          costo: unformatNumber(formData.precioCompra),
          codigo: formData.codigo,
          domicilio: unformatNumber(formData.preciodomicilio),
          id_empresa: authData[1],
          iva: formData.ivaRate,
          ipo: formData.incRate
        };
        
        // Submit the form data
        const response = await productoinsertar(data);
        
        // Crear el objeto de datos para la tabla
        const newProductData = {
          id_producto: response.data.data,
          Descripcion: formData.descripcion,
          Codigo: formData.codigo,
          venta: formData.precioVenta,
          stock: formData.hay,
          Costo: formData.precioCompra
        };
        
        // Llamar a la función que actualiza la tabla de productos
        if (onAddEvent) {
          onAddEvent(newProductData);
        }
        
        // Cerrar el formulario o llamar a onSave si existe
        if (onSave) {
          // Crear una copia de formData con valores desformateados para onSave
          const processedData = {...formData};
          const numericFields = ['precioCompra', 'ganancia', 'precioVenta', 'preciodomicilio', 'minimo'];
          
          numericFields.forEach(field => {
            if (processedData[field]) {
              processedData[field] = unformatNumber(processedData[field]);
            }
          });
          
          onSave(processedData);
        } else {
          onClose();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        // Handle error - show error message to user
      } finally {
        // Reset submitting state regardless of success or failure
        setIsSubmitting(false);
      }
    } else {
      // Form validation failed, enable the button again
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
      paddingTop: '4rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        borderRadius: '0.75rem',
        backgroundColor: 'white',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s ease',
        maxHeight: '80vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem',
          backgroundColor: PRIMARY_COLOR,
          color: 'white',
          textAlign: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            Productos
          </h2>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.5rem',
              padding: '0 0.5rem',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Form content */}
        <div style={{ 
          padding: '0.75rem', 
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '65vh'
        }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '0' }}>
            {/* Código */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.125rem', 
                color: '#333', 
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Codigo:
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.375rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem'
                }}
              />
              {errors.codigo && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {errors.codigo}
                </div>
              )}
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.125rem', 
                color: '#333', 
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Descripcion:
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.375rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem'
                }}
              />
              {errors.descripcion && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {errors.descripcion}
                </div>
              )}
            </div>

            {/* Precio Compra */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.125rem', 
                color: '#333', 
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Prec. Compra:
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280'
                }}>
                  $
                </span>
                <input
                  type="text"
                  name="precioCompra"
                  value={formData.precioCompra}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    paddingLeft: '1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
              {errors.precioCompra && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {errors.precioCompra}
                </div>
              )}
            </div>

            {/* Impuestos */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.125rem', 
                color: '#333', 
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Aplica Impuesto:
              </label>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6B7280',
                  width: '30%'
                }}>
                  Valor IVA:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '70%' }}>
                  <span style={{ marginRight: '0.25rem', fontSize: '0.875rem', width: '2rem' }}>IVA:</span>
                  <div style={{ position: 'relative', width: '5rem' }}>
                    <select
                      name="ivaRate"
                      value={formData.ivaRate}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.375rem',
                        paddingRight: '1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        appearance: 'none',
                        backgroundColor: '#FEE2E2'
                      }}
                    >
                      <option value="0">0</option>
                      <option value="5">5</option>
                      <option value="19">19</option>
                    </select>
                    <ChevronDown 
                      size={14} 
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#6B7280'
                      }}
                    />
                  </div>
                  <div style={{
                    marginLeft: '0.5rem',
                    padding: '0.375rem',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '0.25rem',
                    minWidth: '3.5rem',
                    textAlign: 'right',
                    flex: 1
                  }}>
                    {calculatedValues.valorIVA}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6B7280',
                  width: '30%'
                }}>
                  Valor INC:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '70%' }}>
                  <span style={{ marginRight: '0.25rem', fontSize: '0.875rem', width: '2rem' }}>INC:</span>
                  <div style={{ position: 'relative', width: '5rem' }}>
                    <select
                      name="incRate"
                      value={formData.incRate}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.375rem',
                        paddingRight: '1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        appearance: 'none',
                        backgroundColor: '#DCFCE7'
                      }}
                    >
                      <option value="0">0</option>
                      <option value="8">8</option>
                    </select>
                    <ChevronDown 
                      size={14} 
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#6B7280'
                      }}
                    />
                  </div>
                  <div style={{
                    marginLeft: '0.5rem',
                    padding: '0.375rem',
                    backgroundColor: '#DCFCE7',
                    borderRadius: '0.25rem',
                    minWidth: '3.5rem',
                    textAlign: 'right',
                    flex: 1
                  }}>
                    {calculatedValues.valorINC}
                  </div>
                </div>
              </div>
            </div>

            {/* Ganancia */}
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ flexBasis: '45%', flexGrow: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.125rem', 
                  color: '#333', 
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}>
                  Ganancia %:
                </label>
                <input
                  type="text"
                  name="ganancia"
                  value={formData.ganancia}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
              
              <div style={{ flexBasis: '55%', flexGrow: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.125rem', 
                  color: '#333', 
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}>
                  Valor utilidad Real:
                </label>
                <div style={{
                  width: '100%',
                  padding: '0.375rem',
                  backgroundColor: '#FEE2E2',
                  borderRadius: '0.25rem',
                  textAlign: 'right'
                }}>
                  {calculatedValues.valorUtilidad}
                </div>
              </div>
            </div>

            {/* Precio venta */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.125rem', 
                color: '#333', 
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Precio venta:
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280'
                }}>
                  $
                </span>
                <input
                  type="text"
                  name="precioVenta"
                  value={formData.precioVenta}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    paddingLeft: '1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
              {errors.precioVenta && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {errors.precioVenta}
                </div>
              )}
            </div>

            {/* Precio Domicilio */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.125rem', 
                color: '#333', 
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Prec. Domilio:
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280'
                }}>
                  $
                </span>
                <input
                  type="text"
                  name="preciodomicilio"
                  value={formData.preciodomicilio}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    paddingLeft: '1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
            </div>

            {/* Hay y Mínimo */}
            <div style={{ 
              marginBottom: '0.5rem', 
              padding: '0.5rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.25rem' 
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.125rem', 
                  color: '#333', 
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}>
                  Hay:
                </label>
                <input
                  type="text"
                  name="hay"
                  value={formData.hay}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
                  {errors.hay && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {errors.hay}
                </div>
              )}
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.125rem', 
                  color: '#333', 
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}>
                  Mínimo:
                </label>
                <input
                  type="text"
                  name="minimo"
                  value={formData.minimo}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Guardar button */}
        <div style={{ padding: '0.5rem', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? '#a5a6f6' : PRIMARY_COLOR, // Lighter color when disabled
            color: 'white',
            padding: '0.5rem 2rem',
            border: 'none',
            borderRadius: '0.25rem',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormDemo;