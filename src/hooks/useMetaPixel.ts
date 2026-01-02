import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackCustomEvent } from '../utils/metaPixel';

export const useMetaPixel = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path === '/franquicias/mendoza') {
      trackCustomEvent('ViewFranquicia', { ciudad: 'Mendoza' });
    }

    if (path === '/franquicias/sanjuan') {
      trackCustomEvent('ViewFranquicia', { ciudad: 'San Juan' });
    }

    if (path === '/franquicias/sanluis') {
      trackCustomEvent('ViewFranquicia', { ciudad: 'San Luis' });
    }

  }, [location.pathname]);
};
