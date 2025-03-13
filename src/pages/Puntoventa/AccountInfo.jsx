import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useidmesa } from '../authStore';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  font-family: Arial, sans-serif;
`;

const Card = styled.div`
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const Field = styled.div`
  border-bottom: 1px solid #e2e8f0;
  background: white;
`;

const Label = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.25rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  &:after {
    content: ':';
    color: #94a3b8;
  }
`;

const Value = styled.div`
  background: white;
  padding: 0.25rem 0.75rem;
  min-height: ${props => props.large ? '2.5rem' : '1.5rem'};
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #1e293b;
`;

const TotalSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  justify-content: space-between;
  background: #f8fafc;
`;

const TotalLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.03em;

  &:after {
    content: ':';
    color: #64748b;
  }
`;

const TotalAmount = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  
  &:before {
    content: '$';
    margin-right: 0.25rem;
    color: #64748b;
  }
`;

const ReceiptDisplay = () => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [quantities, setQuantities] = useState({});
  const { tableId } = useidmesa();

  // Function to calculate total from order data, with external quantities override
  const calculateTotal = (orders, externalQuantities = {}) => {
    return orders.reduce((acc, order) => {
      // Check if we have an external quantity override for this order
      const orderId = order.id_detalle;
      // Use external quantity if available, otherwise use the order's quantity
      const quantity = orderId && externalQuantities[orderId] 
        ? parseInt(externalQuantities[orderId]) 
        : parseInt(order.Cant) || 0;
      const price = parseFloat(order.venta) || 0;
      return acc + (quantity * price);
    }, 0);
  };

  // Check for cached data on component mount or when quantities update
  useEffect(() => {
    if (tableId && window.apiCache) {
      const cachedData = window.apiCache.get(`orders_${tableId}`);
      if (cachedData && Array.isArray(cachedData)) {
        const total = calculateTotal(cachedData, quantities);
        setTotalAmount(total);
      }
    }
  }, [tableId, quantities, calculateTotal]);

  // Listen for quantity changes coming from NumericKeypad
  useEffect(() => {
    const handleQuantityChange = (e) => {
      if (e && e.detail) {
        const { selectedOrderId, quantity } = e.detail;
        if (selectedOrderId && quantity !== undefined) {
          // Update our local quantity state
          setQuantities(prev => ({
            ...prev,
            [selectedOrderId]: quantity
          }));
        }
      }
    };

    window.addEventListener('quantityChanged', handleQuantityChange);
    return () => window.removeEventListener('quantityChanged', handleQuantityChange);
  }, []);

  // Setup event listeners for order changes
  useEffect(() => {
    // Generic handler for any order update events
    const handleOrderUpdate = (event) => {
      if (event.detail && Array.isArray(event.detail.orders)) {
        // Calculate total using both orders and current quantities
        const total = calculateTotal(event.detail.orders, quantities);
        setTotalAmount(total);
      }
    };

    // Listen for direct produto_cantidad events from socket
    const handleSocketQuantityUpdate = (event) => {
      if (event.detail && event.detail.id_detalle && event.detail.cantidad !== undefined) {
        // Update our local quantities and recalculate
        const newId = event.detail.id_detalle;
        const newQty = event.detail.cantidad;
        
        setQuantities(prev => ({
          ...prev,
          [newId]: newQty
        }));
        
        // Get latest orders from cache and recalculate
        if (tableId && window.apiCache) {
          const cachedData = window.apiCache.get(`orders_${tableId}`);
          if (cachedData && Array.isArray(cachedData)) {
            const updatedQuantities = {...quantities, [newId]: newQty};
            const total = calculateTotal(cachedData, updatedQuantities);
            setTotalAmount(total);
          }
        }
      }
    };

    // Listen for all types of events to catch all updates
    window.addEventListener('ordersUpdated', handleOrderUpdate);
    window.addEventListener('orderModified', handleOrderUpdate);
    window.addEventListener('orderAdded', handleOrderUpdate);
    window.addEventListener('orderDeleted', handleOrderUpdate);
    window.addEventListener('quantityUpdate', handleSocketQuantityUpdate);
    
    // Clean up all event listeners on component unmount
    return () => {
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
      window.removeEventListener('orderModified', handleOrderUpdate);
      window.removeEventListener('orderAdded', handleOrderUpdate);
      window.removeEventListener('orderDeleted', handleOrderUpdate);
      window.removeEventListener('quantityUpdate', handleSocketQuantityUpdate);
    };
  }, [tableId, quantities, calculateTotal]);

  return (
    <Container>
      <Card>
        <Field>
          <Label>Domicilio</Label>
          <Value>Casa Principal</Value>
        </Field>

        <Field>
          <Label>Direccion</Label>
          <Value large>Las Malvinas</Value>
        </Field>

        <TotalSection>
          <TotalLabel>Total</TotalLabel>
          <TotalAmount>{totalAmount.toLocaleString()}</TotalAmount>
        </TotalSection>
      </Card>
    </Container>
  );
};

export default React.memo(ReceiptDisplay);