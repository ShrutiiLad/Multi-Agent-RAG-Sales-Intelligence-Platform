export const WORKING_POINT = "6b31dlcw-8000.inc1.devtunnels.ms";
// export const STAGING_POINT = "echo-ai-b.azurewebsites.net";
// export const RELEASE_POINT = "echo-backend-prod.azurewebsites.net";
// export const DOCKER_POINT = "echo-ai-b-docker.azurewebsites.net/"

// https://4lnw4n5c-8000.inc1.devtunnels.ms/

export const USING_POINT = WORKING_POINT;

export const CORE_URL = "https://" + USING_POINT;
export const MEDIA_URL = CORE_URL;
export const BASE_URL = CORE_URL + "/";
export const API_URL = BASE_URL + "api/";
export const AUTH_URL = BASE_URL + "auth/";
export const WEBSOCKET_URL = "wss://" + USING_POINT + "/c/";

export const getHeaders = (token: string) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  };
};

export const getEmptyContentHeaders = (token: string) => {
  return {
    Authorization: `Token ${token}`,
  };
};
//This is a new commit