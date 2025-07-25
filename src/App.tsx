import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AnimatedSection from './components/AnimatedSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <AnimatedSection>
          <About />
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <Skills />
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <Projects />
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <Experience />
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <Contact />
        </AnimatedSection>
      </main>
      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </div>
  );
}

export default App;