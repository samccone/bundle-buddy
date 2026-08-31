declare module "viz-annotation/*";

// TS 6 reports side-effect imports it cannot resolve; CRA only ships
// declarations for *.module.css.
declare module "*.css";
