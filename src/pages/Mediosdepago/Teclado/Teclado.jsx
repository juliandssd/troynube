import React, { useState, useEffect } from 'react';

const NumericKeypad = ({ onDiscountChange, onKeypadInput }) => {
  const [originalValue, setOriginalValue] = useState('25489');
  const [discountType, setDiscountType] = useState(true); // true = amount, false = percentage
  const [discountValue, setDiscountValue] = useState('');
  
  // Report discount changes to parent component
  useEffect(() => {
    if (typeof onDiscountChange === 'function') {
      // If no discount, report zero
      if (!discountValue || discountValue === '0') {
        onDiscountChange(0, discountType);
        return;
      }

      const origValue = parseFloat(originalValue || '0');
      const discountInput = parseFloat(discountValue);
      
      if (isNaN(origValue) || isNaN(discountInput)) {
        onDiscountChange(0, discountType);
        return;
      }
      
      if (discountType) {
        // For amount discount, pass the direct value
        const discountAmount = Math.min(discountInput, origValue);
        onDiscountChange(discountAmount, discountType);
      } else {
        // For percentage discount, pass the raw percentage value
        // Let the parent component calculate the actual amount
        const percentValue = Math.min(discountInput, 100); // Cap at 100%
        onDiscountChange(percentValue, discountType);
      }
    }
  }, [originalValue, discountValue, discountType, onDiscountChange]);
  
  const handleButtonClick = (value) => {
    // Enviar el valor al componente padre para actualizar el campo seleccionado
    if (typeof onKeypadInput === 'function') {
      onKeypadInput(value);
    }
    
    // Mantener la funcionalidad original para el descuento
    if (value === 'Borrar') {
      setOriginalValue('');
    } else if (value === '<--') {
      setOriginalValue(prev => prev.slice(0, -1));
    } else {
      setOriginalValue(prev => prev + value);
    }
  };

  const handleDiscountChange = (e) => {
    // For percentage discounts, limit the value to 100%
    if (!discountType) {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue) && numValue > 100) {
        setDiscountValue('100');
        return;
      }
    }
    setDiscountValue(e.target.value);
  };

  const styles = {
    outerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '16px',
      paddingTop: '24px',
      backgroundColor: '#f9f9f9',
      height: '100%',
    },
    container: {
      background: 'white',
      borderRadius: '24px',
      padding: '20px 16px',
      width: '280px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      width: '100%',
      marginBottom: '20px',
    },
    numberButton: {
      backgroundColor: 'white',
      color: '#5651FB',
      border: 'none',
      borderRadius: '16px',
      fontSize: '26px',
      fontWeight: '500',
      padding: '10px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      width: '100%',
      height: '48px',
    },
    functionButton: {
      backgroundColor: '#5651FB',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '500',
      padding: '10px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
      width: '100%',
      height: '48px',
    },
    discountContainer: {
      width: '100%',
      marginTop: '10px',
    },
    discountLabel: {
      color: '#1a1a1a',
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    discountLine: {
      height: '2px',
      background: '#2979FF',
      width: '100%',
      marginBottom: '16px',
    },
    discountInput: {
      width: '100%',
      padding: '12px 0',
      fontSize: '16px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '12px',
      outline: 'none',
      textAlign: 'center',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '4px',
    },
    checkbox: {
      marginRight: '8px',
      accentColor: '#5651FB',
      width: '18px',
      height: '18px',
    },
    checkboxLabel: {
      color: '#1a1a1a',
      fontSize: '16px',
      fontWeight: '500',
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <div style={styles.buttonGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <button
              key={item}
              onClick={() => handleButtonClick(item)}
              style={styles.numberButton}
            >
              {item}
            </button>
          ))}
          
          <button
            onClick={() => handleButtonClick('Borrar')}
            style={styles.functionButton}
          >
            Borrar
          </button>
          
          <button
            onClick={() => handleButtonClick(0)}
            style={styles.numberButton}
          >
            0
          </button>
          
          <button
            onClick={() => handleButtonClick('<--')}
            style={styles.functionButton}
          >
            ←
          </button>
        </div>
        
        <div style={styles.discountContainer}>
          <div style={styles.discountLabel}>Descuento</div>
          <div style={styles.discountLine}></div>
          <input
            type="text"
            value={discountValue}
            onChange={handleDiscountChange}
            placeholder="Ingrese descuento"
            style={styles.discountInput}
            className="discount-input"
          />
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={discountType}
              onChange={() => setDiscountType(!discountType)}
              style={styles.checkbox}
              id="montoCheckbox"
            />
            <label htmlFor="montoCheckbox" style={styles.checkboxLabel}>
              {discountType ? "Monto" : "Porcentaje"}
            </label>
          </div>
          
          {/* Visual indicator of current discount mode */}
          <div style={{
            fontSize: '14px',
            marginTop: '8px',
            color: '#5651FB',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Modo actual: {discountType ? "Descuento por monto" : "Descuento por porcentaje"}
            {!discountType && discountValue ? ` (${discountValue}%)` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumericKeypad;