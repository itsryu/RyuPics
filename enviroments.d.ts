export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      DOMAIN_URL: string;
      LOCAL_URL: string;
      PORT: string;
      STATE: string;
      AUTH_KEY: string;
    }
  }
}