import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollWrapper = ({children}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      // 1. Scroll the main window and body 
      window.scrollTo({ top: 0, behavior: "auto" });
      document.documentElement.scrollTo({ top: 0, behavior: "auto" });
      document.body.scrollTo({ top: 0, behavior: "auto" });

      // 2. Find ALL scrollable elements, but EXCLUDE anything inside an <aside> tag!
      const scrollableElements = document.querySelectorAll(
        '.overflow-y-auto:not(aside *), .overflow-y-scroll:not(aside *), .overflow-auto:not(aside *)'
      );
      
      scrollableElements.forEach((el) => {
        el.scrollTo({ top: 0, behavior: "auto" });
      });

    }, 50); 
  }, [pathname]);

  return children;
};

export default ScrollWrapper;