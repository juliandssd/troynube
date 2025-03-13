import React from 'react';
import styled, { createGlobalStyle, ThemeProvider, keyframes } from 'styled-components';

// Theme configuration
const theme = {
  colors: {
    primary: '#6366F1',
    secondary: '#FF5722',
    background: '#EEF2FF',
    white: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6366F1'
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const HeroContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.white} 100%);
  overflow: hidden;
  padding: 2rem;
`;

const WaveBackground = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 66%;
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.primary} 0%, 
    ${({ theme }) => theme.colors.secondary} 100%
  );
  transform: skewY(-6deg);
  transform-origin: top left;
`;

const BlurredWave = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(90deg,
    ${({ theme }) => `${theme.colors.primary}4D`} 0%,
    ${({ theme }) => `${theme.colors.secondary}4D`} 100%
  );
  transform: skewY(-3deg);
  transform-origin: top left;
  filter: blur(24px);
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
  margin: 0 auto;
  max-width: 900px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 3.75rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: 4.5rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.primary} 0%, 
    ${({ theme }) => theme.colors.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UnderlinedText = styled.span`
  position: relative;
  display: inline-block;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg,
      ${({ theme }) => theme.colors.primary} 0%,
      ${({ theme }) => theme.colors.secondary} 100%
    );
    border-radius: 3px;
  }
`;

const DevicesContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1.5rem;
  margin-top: 4rem;
  padding: 0 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: 2rem;
    margin-top: 6rem;
  }
`;

const BaseDevice = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    animation: ${float} 6s ease-in-out infinite;
  }
`;

const MobileDevice = styled(BaseDevice)`
  width: 25%;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 20%;
  }
`;

const DesktopDevice = styled(BaseDevice)`
  width: 50%;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 40%;
  }
`;

const TabletDevice = styled(BaseDevice)`
  width: 25%;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 20%;
  }
`;

const DeviceContent = styled.div`
  background: ${props => props.gradient || `linear-gradient(135deg, 
    ${props.theme.colors.primary} 0%, 
    ${props.theme.colors.secondary} 100%
  )`};
  padding: 1rem;
  min-height: ${props => props.minHeight || '200px'};
`;

const MockupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 3}, 1fr);
  gap: 0.5rem;
`;

const MockupItem = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  padding: 1rem;
  aspect-ratio: 1;
`;

const MockupChart = styled.div`
  height: 100%;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
  }
`;

// Main Component
const FudoHero = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <HeroContainer>
        <WaveBackground />
        <BlurredWave />
        
        <Content>
          <Header>
            <Subtitle>
              Software para restaurantes, bares y cafés
            </Subtitle>
            
            <Title>
              Transforma tu negocio{' '}
              <GradientText>gastronómico</GradientText>{' '}
              <UnderlinedText>con Troynube</UnderlinedText>
            </Title>
          </Header>
          
          <DevicesContainer>
            <MobileDevice>
              <DeviceContent>
                <MockupGrid cols={3}>
                  <MockupItem />
                  <MockupItem />
                  <MockupItem />
                  <MockupItem />
                  <MockupItem />
                  <MockupItem />
                </MockupGrid>
              </DeviceContent>
            </MobileDevice>
            
            <DesktopDevice>
              <DeviceContent gradient="linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)">
                <MockupGrid cols={3}>
                  <MockupItem />
                  <MockupItem />
                  <MockupItem />
                </MockupGrid>
                <div style={{ marginTop: '1rem' }}>
                  <MockupChart />
                </div>
              </DeviceContent>
            </DesktopDevice>
            
            <TabletDevice>
              <DeviceContent gradient="linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)">
                <MockupChart />
              </DeviceContent>
            </TabletDevice>
          </DevicesContainer>
        </Content>
      </HeroContainer>
    </ThemeProvider>
  );
};

export default FudoHero;