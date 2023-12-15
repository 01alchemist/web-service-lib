declare module "process.env" {
  const env_obj: Record<string, string>;
  export default env_obj;
}

declare interface Window {
  ENV: Record<string, string | undefined>;
}
