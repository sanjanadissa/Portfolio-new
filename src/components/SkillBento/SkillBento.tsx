import MagicBento from './MagicBento';
import './MagicBento.css';
import TextReveal from '../TextReveal/TextReveal';

const SkillBento = () => {
  return (
    <section id="skills" className="skill-bento-section">
      <h2 className="skill-bento-heading">
        My <span>Skills</span>
      </h2>
      <TextReveal
        paragraph="A curated stack of tools I wield to craft exceptional digital experiences."
        className="skill-bento-subheading"
        shadowColor="rgba(255,255,255,0.1)"
        triggerStart="top 85%"
        triggerEnd="top 50%"
      />

      <MagicBento
        textAutoHide={true}
        enableStars
        enableSpotlight
        enableBorderGlow={true}
        enableTilt
        enableMagnetism={false}
        clickEffect
        spotlightRadius={340}
        particleCount={12}
        glowColor="132, 0, 255"
        disableAnimations={false}
      />
    </section>
  );
};

export default SkillBento;
