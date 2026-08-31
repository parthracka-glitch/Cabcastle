/// <reference types="react-scripts" />

declare module "*.jsx" {
  import React from "react";
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "*.js" {
  const content: any;
  export default content;
}

declare module "./website/components/*" {
  import React from "react";
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "./website/pages/*" {
  import React from "react";
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "./crm/components/*" {
  import React from "react";
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "./crm/pages/*" {
  import React from "react";
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "@website/*";
declare module "@crm/*";
declare module "@shared/*";
declare module "@/components/*";
declare module "@/context/*";
