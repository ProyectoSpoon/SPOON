'use client'

import { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface ParticlesBackgroundProps {
  variant?: 'default' | 'sparse' | 'dense';
}

export const ParticlesBackground = ({ 
  variant = 'default' 
}: ParticlesBackgroundProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    fullScreen: false,
    background: {
      color: {
        value: "transparent",
      },
    },
    particles: {
      number: {
        value: variant === 'sparse' ? 15 : variant === 'dense' ? 50 : 30,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#F4821F"
      },
      opacity: {
        value: 0.3,
        random: true
      },
      size: {
        value: 3,
        random: true
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        outMode: "out",
        bounce: false
      }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 150,
          links: {
            opacity: 0.3
          }
        }
      }
    },
    detectRetina: true
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesConfig}
      className="absolute inset-0 pointer-events-none"
    />
  );
};