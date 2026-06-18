export const HOST = "http://localhost:3005";

const authRoute = `${HOST}/api/auth`;
const MESSAGES_ROUTE = `${HOST}/api/messages`;

export const onBoardUserRoute = `${authRoute}/onboarduser`;
export const CHECK_USER_ROUTE = `${authRoute}/check-user`;
export const GET_ALL_CONTACTS = `${authRoute}/get-contacts`;
export const GET_CALL_TOKEN = `${authRoute}/generate-token`;

export const ADD_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-message`;
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages`;
export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGES_ROUTE}/get-initial-contacts`;
export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-audio-message`;
export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-image-message`;

// WhatsApp Profile Lookup Routes
const WHATSAPP_PROFILES_ROUTE = `${HOST}/api/whatsapp-profiles`;
export const START_BATCH_JOB = `${WHATSAPP_PROFILES_ROUTE}/batch`;
export const GET_JOB_STATUS = (jobId) => `${WHATSAPP_PROFILES_ROUTE}/jobs/${jobId}`;
export const GET_JOB_RESULTS = (jobId) => `${WHATSAPP_PROFILES_ROUTE}/jobs/${jobId}/results`;
export const GET_ALL_PROFILES = WHATSAPP_PROFILES_ROUTE;
export const GET_SINGLE_PROFILE = (phoneNumber) => `${WHATSAPP_PROFILES_ROUTE}/${phoneNumber}`;
export const PROXY_IMAGE = `${HOST}/api/proxy-image`;
