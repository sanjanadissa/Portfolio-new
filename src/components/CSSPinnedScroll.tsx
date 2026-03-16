import React from 'react';
import First from './First';
import Second from './second';

const CSSPinnedScroll = () => {
  return (
    <div className="relative">
      {/* First Section - Sticky positioned to stay in place until covered */}
      <div className="sticky top-0 h-screen z-10">
        <First />
      </div>

      {/* Second Section - Will scroll up and completely cover the first */}
      <div className="relative z-20 h-screen" style={{ marginTop: '-100vh' }}>
        <Second />
      </div>

      {/* Additional content after - this ensures the second section stays in place */}
      <div className="relative z-20 h-screen bg-gray-800 flex items-center justify-center text-white text-2xl">
        Content after the scroll effect
      </div>
    </div>
  );
};

export default CSSPinnedScroll;
