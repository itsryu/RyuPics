export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH_KEY: string;
      MONGODB_URI: string;
      DOMAIN_URL: string;
      LOCAL_URL: string;
      PORT: string;
      STATE: string;
      
    }
  }
}