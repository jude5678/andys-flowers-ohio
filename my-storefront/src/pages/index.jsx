import React from 'react';
import { Link } from 'react-router-dom';

// 1. Import your images using relative paths from this component file to src/images
import giftAndRosesImg from '../images/gift-and-roses.png'; 
import mixedFlowersImg from '../images/mixed-flowers-001.jpg';
import weddingImg from '../images/wedding-01.jpg';

export default function Home() {
  return (
    <section id="main" className="container home-container">
      <section className="box special bg-color home-intro" id="header-shadow">
        <header className="major">
          <h2>
            Providing top tier floral designs that make <br /> you wonder why you did not come to us sooner
          </h2>
          <p>
            No matter the occasion, you deserve quality flowers to make any moment memorable. 
            Our goal is to design flowers tailored to your specific needs.
          </p>
        </header>
        <span className="image featured" id="giftAndRoses">
          {/* 2. Reference the imported variable name here */}
          <img src={giftAndRosesImg} alt="gift and roses" />
        </span>
      </section>

      <section className="box special features" id="services">
        <div className="features-row" id="servicesSections">
          <section>
            <span className="icon solid major fa-bolt accent2"></span>
            <h3>Floral Arrangements</h3>
            <p>
              At Aurora Flower Shoppe, we believe that any flowers you send -- whether as a 
              romantic gesture, a celebratory gift, or as a condolence -- should have a personal 
              touch. We'll help you create that special moment.
            </p>
          </section>
          <section>
            <span className="icon solid major fa-chart-area accent3"></span>
            <h3>Home Decor</h3>
            <p>Level up your space and impress your guests with our quality home decor items.</p>
          </section>
        </div>

        <div className="features-row">
          <section>
            <span className="icon solid major fa-cloud accent4"></span>
            <h3>Plants</h3>
            <p>
              From house plants to indoor plants, we have a varied selection to make any place 
              that much more serene and inviting.
            </p>
          </section>
          <section>
            <span className="icon solid major fa-lock accent5"></span>
            <h3>Weddings</h3>
            <p>
              Your wedding is arguably the most magical day of your life. We'll design the most 
              exquisite flowers to make the wedding of your dreams a reality.
            </p>
          </section>
        </div>
      </section>

      <div className="row">
        <div className="col-6 col-12-narrower">
          <section className="box special row-shadow">
            <span className="image featured">
              {/* 3. Reference the imported variable name here */}
              <img src={mixedFlowersImg} alt="bouquet of mixed flowers" className="box-img" />
            </span>
            <h3>Floral Arrangements</h3>
            <p>Check out our assortments of mixed flowers, roses and more!</p>
            <ul className="actions special">
              <li>
                <Link to="/floralarrangements" className="button alt">Visit</Link>
              </li>
            </ul>
          </section>
        </div>

        <div className="col-6 col-12-narrower">
          <section className="box special row-shadow">
            <span className="image featured">
              {/* 4. Reference the imported variable name here */}
              <img src={weddingImg} alt="woman in wedding dress holding a bouqet of flowers" />
            </span>
            <h3>Weddings</h3>
            <p>We would be more than honored to have a consultation with you for your special day.</p>
            <ul className="actions special">
              <li>
                <Link to="/weddings" className="button alt">Visit</Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
};