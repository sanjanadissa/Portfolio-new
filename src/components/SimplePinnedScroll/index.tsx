import React from "react";
import cvPdf from "../../assets/cv.pdf";

const YourComponent = () => {
  return (
    <div>
      {/* ...existing code... */}
      <a
        className="sp-download-cv"
        href={cvPdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open CV PDF"
      >
        Download CV
      </a>
      {/* ...existing code... */}
    </div>
  );
};

export default YourComponent;