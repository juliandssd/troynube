import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  font-family: -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => props.isAdmin ? '0.625rem 1.25rem' : '0.625rem 1rem'};
  border-radius: ${props => props.isAdmin ? '99px' : '12px'};
  background: ${props => props.isAdmin ? 
    'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)' : 
    'transparent'
  };
  position: relative;
  transition: all 0.2s ease;
  min-width: ${props => props.isAdmin ? '120px' : '140px'};

  ${props => !props.isAdmin && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.2));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
  `}

  &:hover {
    transform: ${props => props.isAdmin ? 'translateY(-1px)' : 'none'};
    background: ${props => props.isAdmin ? 
      'linear-gradient(135deg, #5558DD 0%, #6366F1 100%)' : 
      'rgba(99, 102, 241, 0.03)'
    };
  }
`;

const Text = styled.span`
  font-size: ${props => props.isAdmin ? '0.875rem' : '0.9rem'};
  font-weight: ${props => props.isAdmin ? '600' : '450'};
  color: ${props => props.isAdmin ? 'white' : '#6366F1'};
  letter-spacing: ${props => props.isAdmin ? '0.3px' : '0.2px'};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.isAdmin ? 'white' : '#6366F1'};
  opacity: ${props => props.isAdmin ? '1' : '0.8'};
`;

const StatusHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <HeaderContainer>
      <InfoBox>
        <IconWrapper>
          <Calendar size={18} strokeWidth={1.75} />
        </IconWrapper>
        <Text>{formatDate(currentTime)}</Text>
      </InfoBox>
      
      <InfoBox>
        <IconWrapper>
          <Clock size={18} strokeWidth={1.75} />
        </IconWrapper>
        <Text>{formatTime(currentTime)}</Text>
      </InfoBox>
      
      <InfoBox isAdmin>
        <IconWrapper isAdmin>
          <User size={18} strokeWidth={1.75} />
        </IconWrapper>
        <Text isAdmin>1 ADMIN</Text>
      </InfoBox>
    </HeaderContainer>
  );
};

export default StatusHeader;