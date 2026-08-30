import processDesktopImg from "@assets/gradientbg_1752332694284.png";
const processMobileImg = processDesktopImg;

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