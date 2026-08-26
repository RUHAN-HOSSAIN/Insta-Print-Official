
import Contact from "./contact/Contact";
import FAQ from "./faq/FAQ";
import Body from "./home/Body";
import Learn from "./learn/Learn";
import Pricing from "./pricing/Pricing";
import AboutUs from "./home/WhyInstaPrint";

const Home = () => {
  const sectionOffsetStyle = {
    scrollMarginTop: "calc(var(--header-height, 72px) + 8px)",
  };

  return (
    <>
      <section id="home" style={sectionOffsetStyle}>
        <Body />
      </section>
      <section id="learn" style={sectionOffsetStyle}>
        <Learn />
      </section>
      <section id="pricing" style={sectionOffsetStyle}>
        <Pricing />
      </section>
      <section id="aboutUs" style={sectionOffsetStyle}>
        <AboutUs />
      </section>
      <section id="faq" style={sectionOffsetStyle}>
        <FAQ />
      </section>
      <section id="contact" style={sectionOffsetStyle}>
        <Contact />
      </section>
    </>
  );
};

export default Home;