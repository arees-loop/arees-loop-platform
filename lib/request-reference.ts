/** Short public request identifiers. The secret tracking claim remains separate. */
export const REQUEST_REFERENCE_PATTERN=/^(?:AR-(?:AIR|SEA|HOT|VISA|IDL|LIC)-[A-F0-9]{10}|(?:AIR|SEA|HOT|VIS|LIC)-[0-9]{8})$/;
export const TRAVEL_REFERENCE_PATTERN=/^(?:AR-(?:AIR|SEA|VISA|IDL|LIC)-[A-F0-9]{10}|(?:AIR|SEA|VIS|LIC)-[0-9]{8})$/;
export const TICKET_REFERENCE_PATTERN=/^(?:AR-(?:AIR|SEA)-[A-F0-9]{10}|(?:AIR|SEA)-[0-9]{8})$/;
export function isValidRequestReference(value:string):boolean {
 return REQUEST_REFERENCE_PATTERN.test(value);
}
