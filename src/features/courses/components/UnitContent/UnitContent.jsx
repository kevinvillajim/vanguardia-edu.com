import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const UnitContent = ({ unit, children }) => {
  const location = useLocation();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (location.state?.progress && scrollContainerRef.current) {
      const { progress } = location.state;
      const scrollHeight =
        scrollContainerRef.current.scrollHeight -
        scrollContainerRef.current.clientHeight;
      const scrollTop = (progress / 100) * scrollHeight;
      scrollContainerRef.current.scrollTop = scrollTop;
    }
  }, [location]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-[38rem] overflow-auto"
    >
      {children}
    </div>
  );
};

export default UnitContent;
