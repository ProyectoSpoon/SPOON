// src/types/group-config.types.ts

export interface ConfigField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
    required: boolean;
    value: any;
    options?: { label: string; value: any }[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      custom?: (value: any) => boolean;
    };
  }
  
  export interface ConfigTemplate {
    id: string;
    name: string;
    description: string;
    version: string;
    fields: ConfigField[];
    inheritFrom?: string;
  }
  
  export interface ConfigSection {
    id: string;
    title: string;
    description: string;
    order: number;
    fields: ConfigField[];
    status: 'pending' | 'incomplete' | 'complete';
    template?: string;
  }
  
  export interface RestaurantConfig {
    id: string;
    restaurantId: string;
    groupId?: string;
    sections: ConfigSection[];
    inheritedFrom?: string;
    overrides: {
      [key: string]: {
        fieldId: string;
        value: any;
      };
    };
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      version: string;
    };
  }
  
  export interface GroupConfig {
    id: string;
    name: string;
    template: ConfigTemplate;
    defaultConfig: Partial<RestaurantConfig>;
    overrides: {
      [restaurantId: string]: {
        [fieldId: string]: any;
      };
    };
  }
  
  export interface ConfigurationState {
    templates: ConfigTemplate[];
    groupConfigs: GroupConfig[];
    restaurantConfigs: RestaurantConfig[];
    activeConfig: RestaurantConfig | null;
    loading: boolean;
    error: string | null;
  }