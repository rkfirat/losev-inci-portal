import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  SM: 320,
  MD: 768,
  LG: 1024,
};

export const useBreakpoint = () => {
  const { width } = useWindowDimensions();

  return {
    isMobile: width < BREAKPOINTS.MD,
    isTablet: width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG,
    isDesktop: width >= BREAKPOINTS.LG,
    width,
  };
};
