import React from 'react';
// 1. Import the about-us image dynamically from your src/images folder
import aboutUsImg from '../images/about-us.jpg';

export default function AboutUs() {
  return (
    <main id="about-us">
      <section className='about-us-section'>
        {/* 2. Changed 'class' to 'className', closed the tag, and bound the imported file */}
        <img 
          src={aboutUsImg} 
          alt="collage of woman holding flowers, candle, plant, and carnations" 
          className="about-us-1 row-shadow" 
        />
        <p>
          Andy's Flowers Ohio is a floral boutique that offers beautiful designs<br /> 
          for several different occasions. We are dedicated to serving our guests with specialized<br /> 
          floral arrangements that will make any moment that much more meaningful.
        </p>
      </section>
    </main>
  );
};