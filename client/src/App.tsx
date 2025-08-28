import React, { useEffect, useState } from 'react';
import { Switch, Route } from "wouter";
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AnimatedSection from './components/AnimatedSection';
import ProjectStructure from './components/ProjectStructure';
import ProductionFeedbackSection from './components/ProductionFeedbackSection';
import FloatingFeedbackButton from './components/FloatingFeedbackButton';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = () => {
  const [showProjectStructure, setShowProjectStructure] = useState(false);

  const handleProjectStructureToggle = () => {
    setShowProjectStructure(!showProjectStructure);
  };

  return (
    <>
      <Header onProjectStructureClick={handleProjectStructureToggle} />
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
        <AnimatedSection delay={300}>
          <ProductionFeedbackSection />
        </AnimatedSection>
      </main>
      <AnimatedSection>
        <Footer />
      </AnimatedSection>
      
      <ProjectStructure 
        isOpen={showProjectStructure}
        onClose={() => setShowProjectStructure(false)} 
      />
      <FloatingFeedbackButton />
    </>
  );
};

function App() {
  useEffect(() => {
    document.title = 'Marepalli Santhosh Portfolio';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route>
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">404 - Not Found</h1>
            <p className="text-xl mt-4">The page you are looking for does not exist.</p>
            <a href="/" className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go Home
            </a>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;