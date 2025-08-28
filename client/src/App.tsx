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
import { FilterSettings } from './components/ColorFilter';

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
    </>
  );
};

function App() {
  useEffect(() => {
    document.title = 'Marepalli Santhosh Portfolio';
  }, []);
  const defaultFilters: FilterSettings = { hue: 0, saturate: 100, brightness: 100, contrast: 100, sepia: 0 };
  // filters: the effective filters for this visitor (may be admin-pushed or local)
  // localFilters are only used transiently while admin settings are not available
  const [localFilters, setLocalFilters] = React.useState<FilterSettings>(() => {
    try {
      const raw = localStorage.getItem('colorFilters');
      return raw ? JSON.parse(raw) : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });
  const [siteFilters, setSiteFilters] = React.useState<FilterSettings | null>(() => {
    try {
      const raw = localStorage.getItem('site-settings-confirmed');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [appReady, setAppReady] = React.useState<boolean>(() => siteFilters !== null);
  // effective filters: always prefer siteFilters when present (owner controls site)
  const filters = siteFilters ?? localFilters;

  useEffect(() => { try { localStorage.setItem('colorFilters', JSON.stringify(localFilters)); } catch {} }, [localFilters]);

  // Fetch public site settings once on load (only when no cached confirmed copy).
  // After that, rely on storage events broadcast by the admin save to get updates (no polling).
  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/site-settings');
        if (!res.ok) return;
        const json = await res.json();
        const payload = json?.data ?? json?.settings ?? json;
        const filtersFromServer = payload?.filters ?? null;
        if (mounted && filtersFromServer) {
          setSiteFilters(filtersFromServer);
          try { localStorage.setItem('site-settings-confirmed', JSON.stringify(filtersFromServer)); } catch {}
          if (!appReady) setAppReady(true);
        }
      } catch (e) {
        // ignore network issues
      }
    };

    // If we don't have a cached confirmed setting, fetch once.
    if (!siteFilters) {
      fetchSettings();
    } else {
      // we already had a confirmed cached value at startup
      if (!appReady) setAppReady(true);
    }

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      try {
        // Admin saves either broadcast an object { filters, ts, optimistic } under 'site-settings-updated'
        // or write the confirmed filters object directly under 'site-settings-confirmed'. Handle both.
        if ((e.key === 'site-settings-updated' || e.key === 'site-settings-confirmed') && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.filters) {
            setSiteFilters(parsed.filters);
            try { localStorage.setItem('site-settings-confirmed', JSON.stringify(parsed.filters)); } catch {}
            if (!appReady) setAppReady(true);
            return;
          }
          // If the value is the filters object directly
          if (parsed && typeof parsed === 'object' && 'hue' in parsed) {
            setSiteFilters(parsed as FilterSettings);
            try { localStorage.setItem('site-settings-confirmed', JSON.stringify(parsed)); } catch {}
            if (!appReady) setAppReady(true);
            return;
          }
        }

        if (e.key === 'site-settings-update-failed') {
          // If admin save failed and we have no confirmed cached value, attempt a single refetch to reconcile.
          if (!siteFilters) fetchSettings();
        }
      } catch (err) {
        // ignore malformed values
      }
    };

    window.addEventListener('storage', onStorage);
    return () => { mounted = false; window.removeEventListener('storage', onStorage); };
  }, [siteFilters, appReady]);

  const cssFilter = `hue-rotate(${filters.hue}deg) saturate(${filters.saturate}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%) sepia(${filters.sepia}%)`;

  if (!appReady) {
    // Prevent flash by not rendering the app until site colors are known
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <>
      <div style={{ filter: cssFilter }} className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden hide-scrollbar">
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
    {/* Site colors are controlled by the owner via Admin Dashboard. No visitor controls are shown. */}
      </div>
      <FloatingFeedbackButton />
    </>
  );
}

export default App;