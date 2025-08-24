/**
 * MermaidDiagram.tsx
 *
 * ✅ Instructions:
 * 1. Install Mermaid.js and Panzoom:
 *      npm install mermaid @panzoom/panzoom
 *
 * 2. Place this file inside:  /components/MermaidDiagram.tsx
 *
 * 3. Import and use inside your portfolio page:
 *      import MermaidDiagram from "@/components/MermaidDiagram";
 *
 *      export default function Portfolio() {
 *        return (
 *          <div>
 *            <h1 className="text-2xl font-bold mb-4">System Architecture</h1>
 *            <MermaidDiagram />
 *          </div>
 *        );
 *      }
 *
 * ✅ Features:
 * - Fully interactive Mermaid.js diagram
 * - Clickable nodes that redirect to your GitHub files
 * - Pan & Zoom with mouse drag + scroll
 * - Auto responsive inside container
 */

"use client";
import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

const MermaidDiagram: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const transformRef = useRef({ scale: 1, x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      // Mermaid.js setup
      mermaid.initialize({
        startOnLoad: false, // Changed to false to prevent conflicts
        theme: "default",
        securityLevel: "loose", // allows links
        themeVariables: {
          primaryColor: "#D0E8FF",
          edgeLabelBackground: "#ffffff",
          tertiaryColor: "#fff",
        },
      });

      if (ref.current && isMounted) {
      const graphDefinition = `
flowchart TD
    %% Client Layer
    subgraph "Client"    
        direction TB
        User[("User")] 
        Browser["Vite‐bundled React App\\n(React 18, TypeScript, Tailwind CSS,\\nFramer Motion, Wouter, Radix UI)"]:::frontend
        subgraph "React Application"    
            direction TB
            Main["main.tsx"]  
            App["App.tsx"]  
            Components["components/"]  
            Hooks["useScrollAnimation.ts"]  
            Utils["emailService.ts"]  
        end
        subgraph "Static Assets"    
            direction TB
            Public["public/"]  
            Resume["MAREPALLI_SANTHOSH_RESUME99.pdf"]  
            Robots["robots.txt"]  
            Sitemap["sitemap.xml"]  
        end
    end

    %% Hosting Layer
    subgraph "Hosting / CDN (Vercel)"    
        direction TB
        CDN["Global CDN / Static Hosting"]:::backend
    end

    %% Serverless Layer
    subgraph "Serverless Functions"    
        direction TB
        APIIndex["index.js"]  
        ContactFunc["contact.js"]  
    end

    %% Third‐Party Services
    subgraph "External Services"
        direction TB
        Resend["Resend Email API"]:::external
        GitHubAPI["GitHub REST API"]:::external
        Analytics["Analytics Service"]:::external
    end

    %% Config & Docs
    subgraph "Config & Documentation"
        direction TB
        ViteConfig["vite.config.ts"]  
        TailwindConfig["tailwind.config.ts"]  
        PostCSS["postcss.config.js"]  
        TSConfig["tsconfig.json"]  
        VercelConfig["vercel.json"]  
        PackageJSON["package.json"]  
        Readme["README.md"]  
    end

    %% Connections
    User -->|"Interacts via UI"| Browser
    Browser -->|"GET index.html, JS, CSS, assets"| CDN
    Browser -->|"POST /api/contact (JSON)"| ContactFunc
    ContactFunc -->|"Send email (API call)"| Resend
    Browser -->|"GET stars data"| GitHubAPI
    ContactFunc -->|"Log metrics"| Analytics
    APIIndex --> ContactFunc

    %% Click Events
    click Browser "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/tree/main/client/src"
    click Main "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/src/main.tsx"
    click App "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/src/App.tsx"
    click Components "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/tree/main/client/src/components"
    click Hooks "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/src/hooks/useScrollAnimation.ts"
    click Utils "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/src/utils/emailService.ts"
    click Public "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/tree/main/client/public"
    click Resume "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/public/MAREPALLI_SANTHOSH_RESUME99.pdf"
    click Robots "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/public/robots.txt"
    click Sitemap "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/client/public/sitemap.xml"
    click ContactFunc "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/api/contact.js"
    click APIIndex "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/api/index.js"
    click ViteConfig "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/vite.config.ts"
    click TailwindConfig "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/tailwind.config.ts"
    click PostCSS "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/postcss.config.js"
    click TSConfig "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/tsconfig.json"
    click VercelConfig "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/vercel.json"
    click PackageJSON "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/package.json"
    click Readme "https://github.com/marepallisanthosh999333/marepallisanthosh.engineer/blob/main/README.md"

    %% Styles
    classDef frontend fill:#D0E8FF,stroke:#0366d6,color:#0366d6;
    classDef backend fill:#D0F8D0,stroke:#228B22,color:#0B6623;
    classDef external fill:#F0F0F0,stroke:#666,color:#333;
    classDef config fill:#FFF8D0,stroke:#DAA520,color:#8B661E;
      `;

        try {
          const { svg } = await mermaid.render("mermaid-diagram", graphDefinition);
          
          if (ref.current && isMounted) {
            ref.current.innerHTML = svg;

            // Add a small delay before enabling pan/zoom to ensure SVG is fully rendered
            setTimeout(() => {
              if (ref.current && isMounted) {
                const svgElement = ref.current.querySelector("svg") as SVGSVGElement;
                if (svgElement) {
                  svgRef.current = svgElement;
                  
                  // Set SVG attributes for better interaction
                  svgElement.style.width = '100%';
                  svgElement.style.height = '100%';
                  svgElement.style.cursor = 'grab';
                  svgElement.style.willChange = 'transform'; // Optimize for animations
                  svgElement.style.backfaceVisibility = 'hidden'; // Prevent flicker
                  
                  // Create transform group if it doesn't exist
                  let transformGroup = svgElement.querySelector('g.pan-zoom-group') as SVGGElement;
                  if (!transformGroup) {
                    transformGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    transformGroup.setAttribute('class', 'pan-zoom-group');
                    
                    // Move all existing content into the transform group
                    const children = Array.from(svgElement.children);
                    children.forEach(child => {
                      if (child !== transformGroup) {
                        transformGroup.appendChild(child);
                      }
                    });
                    svgElement.appendChild(transformGroup);
                  }

                  const updateTransform = () => {
                    const { scale, x, y } = transformRef.current;
                    if (transformGroup) {
                      transformGroup.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
                      transformGroup.style.transformOrigin = 'center center';
                      transformGroup.style.transition = 'none'; // Remove any transition for smooth dragging
                    }
                  };

                  // Smooth animation function
                  const requestAnimationFrame = window.requestAnimationFrame || ((callback) => setTimeout(callback, 16));
                  
                  const smoothUpdate = () => {
                    updateTransform();
                    if (isDraggingRef.current) {
                      animationFrameRef.current = requestAnimationFrame(smoothUpdate);
                    }
                  };

                  // Mouse wheel zoom
                  const handleWheel = (e: WheelEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const rect = svgElement.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    
                    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                    const newScale = Math.max(0.3, Math.min(3, transformRef.current.scale * zoomFactor));
                    
                    if (newScale !== transformRef.current.scale) {
                      const scaleChange = newScale / transformRef.current.scale;
                      transformRef.current.x = mouseX - (mouseX - transformRef.current.x) * scaleChange;
                      transformRef.current.y = mouseY - (mouseY - transformRef.current.y) * scaleChange;
                      transformRef.current.scale = newScale;
                      updateTransform();
                    }
                  };

                  // Touch support for mobile devices
                  let lastTouchDistance = 0;
                  let touchStartTime = 0;
                  const touchSensitivity = 0.6; // Further reduced for ultra-smooth mobile experience

                  const getTouchDistance = (touches: TouchList) => {
                    if (touches.length < 2) return 0;
                    const touch1 = touches[0];
                    const touch2 = touches[1];
                    return Math.sqrt(
                      Math.pow(touch2.clientX - touch1.clientX, 2) + 
                      Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                  };

                  const getTouchCenter = (touches: TouchList) => {
                    if (touches.length === 1) {
                      return { x: touches[0].clientX, y: touches[0].clientY };
                    }
                    const x = (touches[0].clientX + touches[1].clientX) / 2;
                    const y = (touches[0].clientY + touches[1].clientY) / 2;
                    return { x, y };
                  };

                  const handleTouchStart = (e: TouchEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    touchStartTime = Date.now();
                    isDraggingRef.current = true;
                    velocityRef.current = { x: 0, y: 0 };
                    
                    const center = getTouchCenter(e.touches);
                    lastMousePosRef.current = { x: center.x, y: center.y };
                    
                    if (e.touches.length === 2) {
                      lastTouchDistance = getTouchDistance(e.touches);
                    }
                    
                    svgElement.style.cursor = 'grabbing';
                    
                    // Start smooth animation loop
                    if (animationFrameRef.current) {
                      cancelAnimationFrame(animationFrameRef.current);
                    }
                    animationFrameRef.current = requestAnimationFrame(smoothUpdate);
                  };

                  const handleTouchMove = (e: TouchEvent) => {
                    if (isDraggingRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const center = getTouchCenter(e.touches);
                      
                      if (e.touches.length === 2) {
                        // Pinch to zoom with improved sensitivity
                        const newDistance = getTouchDistance(e.touches);
                        if (lastTouchDistance > 0) {
                          const rect = svgElement.getBoundingClientRect();
                          const centerX = center.x - rect.left;
                          const centerY = center.y - rect.top;
                          
                          // Improved zoom factor calculation for smoother zooming
                          const rawZoomFactor = newDistance / lastTouchDistance;
                          const zoomSensitivity = 0.5; // Reduce zoom sensitivity
                          const zoomFactor = 1 + (rawZoomFactor - 1) * zoomSensitivity;
                          const newScale = Math.max(0.3, Math.min(3, transformRef.current.scale * zoomFactor));
                          
                          if (newScale !== transformRef.current.scale) {
                            const scaleChange = newScale / transformRef.current.scale;
                            transformRef.current.x = centerX - (centerX - transformRef.current.x) * scaleChange;
                            transformRef.current.y = centerY - (centerY - transformRef.current.y) * scaleChange;
                            transformRef.current.scale = newScale;
                          }
                        }
                        lastTouchDistance = newDistance;
                      } else if (e.touches.length === 1) {
                        // Single finger pan with smoothing
                        const rawDeltaX = center.x - lastMousePosRef.current.x;
                        const rawDeltaY = center.y - lastMousePosRef.current.y;
                        
                        // Apply smoothing and reduced sensitivity
                        const deltaX = rawDeltaX * touchSensitivity;
                        const deltaY = rawDeltaY * touchSensitivity;
                        
                        // Add momentum for smoother movement
                        const smoothingFactor = 0.8;
                        velocityRef.current.x = velocityRef.current.x * smoothingFactor + deltaX * (1 - smoothingFactor);
                        velocityRef.current.y = velocityRef.current.y * smoothingFactor + deltaY * (1 - smoothingFactor);
                        
                        transformRef.current.x += velocityRef.current.x;
                        transformRef.current.y += velocityRef.current.y;
                      }
                      
                      lastMousePosRef.current = { x: center.x, y: center.y };
                    }
                  };

                  const handleTouchEnd = (e: TouchEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Check for double tap to reset
                    const touchEndTime = Date.now();
                    const touchDuration = touchEndTime - touchStartTime;
                    
                    if (touchDuration < 300 && e.changedTouches.length === 1) {
                      // Potential double tap - check if there was a recent tap
                      const now = Date.now();
                      const lastTapTime = (svgElement as any).lastTapTime || 0;
                      
                      if (now - lastTapTime < 500) {
                        // Double tap detected - reset view
                        transformRef.current = { scale: 1, x: 0, y: 0 };
                        updateTransform();
                      }
                      (svgElement as any).lastTapTime = now;
                    }
                    
                    if (e.touches.length === 0) {
                      isDraggingRef.current = false;
                      svgElement.style.cursor = 'grab';
                      lastTouchDistance = 0;
                      
                      // Stop animation loop
                      if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                        animationFrameRef.current = null;
                      }
                      
                      // Final update
                      updateTransform();
                    }
                  };

                  // Mouse drag pan
                  const handleMouseDown = (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isDraggingRef.current = true;
                    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
                    velocityRef.current = { x: 0, y: 0 };
                    svgElement.style.cursor = 'grabbing';
                    svgElement.style.userSelect = 'none';
                    
                    // Prevent text selection during drag
                    document.body.style.userSelect = 'none';
                    
                    // Start smooth animation loop
                    if (animationFrameRef.current) {
                      cancelAnimationFrame(animationFrameRef.current);
                    }
                    animationFrameRef.current = requestAnimationFrame(smoothUpdate);
                  };

                  const handleMouseMove = (e: MouseEvent) => {
                    if (isDraggingRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Balanced sensitivity for smooth movement
                      const deltaX = (e.clientX - lastMousePosRef.current.x) * 1.5; // Reduced for better control
                      const deltaY = (e.clientY - lastMousePosRef.current.y) * 1.5; // Reduced for better control
                      
                      // Store velocity for potential momentum
                      velocityRef.current.x = deltaX;
                      velocityRef.current.y = deltaY;
                      
                      transformRef.current.x += deltaX;
                      transformRef.current.y += deltaY;
                      
                      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
                      
                      // The smoothUpdate animation loop will handle the transform update
                    }
                  };

                  const handleMouseUp = (e: MouseEvent) => {
                    if (isDraggingRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    isDraggingRef.current = false;
                    svgElement.style.cursor = 'grab';
                    
                    // Stop animation loop
                    if (animationFrameRef.current) {
                      cancelAnimationFrame(animationFrameRef.current);
                      animationFrameRef.current = null;
                    }
                    
                    // Final update
                    updateTransform();
                    
                    // Restore text selection
                    document.body.style.userSelect = '';
                    svgElement.style.userSelect = '';
                  };

                  // Handle mouse leave to stop dragging
                  const handleMouseLeave = () => {
                    if (isDraggingRef.current) {
                      isDraggingRef.current = false;
                      svgElement.style.cursor = 'grab';
                      
                      // Stop animation loop
                      if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                        animationFrameRef.current = null;
                      }
                      
                      updateTransform();
                      document.body.style.userSelect = '';
                      svgElement.style.userSelect = '';
                    }
                  };

                  // Reset on double click
                  const handleDoubleClick = (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    transformRef.current = { scale: 1, x: 0, y: 0 };
                    updateTransform();
                  };

                  // Add event listeners
                  svgElement.addEventListener('wheel', handleWheel, { passive: false });
                  svgElement.addEventListener('mousedown', handleMouseDown);
                  svgElement.addEventListener('mouseleave', handleMouseLeave);
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  svgElement.addEventListener('dblclick', handleDoubleClick);
                  
                  // Touch event listeners for mobile support
                  svgElement.addEventListener('touchstart', handleTouchStart, { passive: false });
                  svgElement.addEventListener('touchmove', handleTouchMove, { passive: false });
                  svgElement.addEventListener('touchend', handleTouchEnd, { passive: false });
                  svgElement.addEventListener('touchcancel', handleTouchEnd, { passive: false });

                  // Store cleanup function
                  (svgElement as any).cleanup = () => {
                    // Cancel any ongoing animation
                    if (animationFrameRef.current) {
                      cancelAnimationFrame(animationFrameRef.current);
                      animationFrameRef.current = null;
                    }
                    
                    // Remove mouse event listeners
                    svgElement.removeEventListener('wheel', handleWheel);
                    svgElement.removeEventListener('mousedown', handleMouseDown);
                    svgElement.removeEventListener('mouseleave', handleMouseLeave);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    svgElement.removeEventListener('dblclick', handleDoubleClick);
                    
                    // Remove touch event listeners
                    svgElement.removeEventListener('touchstart', handleTouchStart);
                    svgElement.removeEventListener('touchmove', handleTouchMove);
                    svgElement.removeEventListener('touchend', handleTouchEnd);
                    svgElement.removeEventListener('touchcancel', handleTouchEnd);
                  };
                }
              }
            }, 200);
          }
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          if (ref.current && isMounted) {
            ref.current.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">
              <p>Error loading diagram. Please refresh the page.</p>
            </div>`;
          }
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      // Cleanup event listeners
      if (ref.current) {
        const svgElement = ref.current.querySelector("svg") as SVGSVGElement;
        if (svgElement && (svgElement as any).cleanup) {
          (svgElement as any).cleanup();
        }
      }
    };
  }, []);

  return (
    <div 
      className="w-full h-[80vh] overflow-hidden border rounded-xl shadow-md bg-white relative"
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      onWheel={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        ref={ref} 
        className="mermaid w-full h-full"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          cursor: 'default',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      />
      
      {/* Note: Mobile instructions are handled by the parent ProjectStructure component */}
    </div>
  );
};

export default MermaidDiagram;
