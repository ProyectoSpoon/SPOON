declare module 'react-tsparticles' {
    import { ReactElement } from 'react';
    import { ISourceOptions, Engine } from 'tsparticles-engine';
  
    export interface ParticlesProps {
      id?: string;
      width?: string;
      height?: string;
      options?: ISourceOptions;
      className?: string;
      canvasClassName?: string;
      init?: (engine: Engine) => Promise<void>;
    }
  
    export default function Particles(props: ParticlesProps): ReactElement;
  }
  
  declare module 'tsparticles-slim' {
    export * from 'tsparticles-engine';
  }
  