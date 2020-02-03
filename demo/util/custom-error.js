export const CUSTOM_ERROR_TYPE = {
    SERVER_ERROR: 'SERVER_ERROR',
    API_RESPONSE_TOO_LONG: 'API_RESPONSE_TOO_LONG',
    HTML_STRUCTURE: 'HTML_STRUCTURE',
    FRONT_END_BUSINESS_LOGIC: 'FRONT_END_BUSINESS_LOGIC'
};

export class CustomError extends Error {
    constructor(type, reason) {
        super(reason);
        this.type = type;
        this.reason = reason;
    }
}