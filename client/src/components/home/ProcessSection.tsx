import processDesktopImg from "@assets/process-desktop_1749457628105.png";
import processMobileImg from "@assets/process-mobile_1749457628106.png";

const ProcessSection = () => {
  return (
    <section className="process-section">
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="process-title">ISKCON FOOD FOR CHILD</h2>
        <div className="title-underline"></div>

        {/* Desktop Image */}
        <div className="process-image-container">
          <img
            src={processDesktopImg}
            alt="Process Steps Desktop"
            className="process-image desktop-image"
          />
          <img
            src={processMobileImg}
            alt="Process Steps Mobile"
            className="process-image mobile-image"
          />
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;