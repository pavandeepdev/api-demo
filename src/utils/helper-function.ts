export function buildQueryString(params: Record<string, any>): string {
  // Ensure params is an object and has keys
  if (
    !params ||
    typeof params !== 'object' ||
    Object.keys(params).length === 0
  ) {
    return '';
  }

  // Convert each key-value pair to a URL-encoded string
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (value === null || value === undefined) {
        return ''; // Skip null or undefined values
      }
      if (Array.isArray(value)) {
        // Encode array values
        return value
          .map((val) => encodeURIComponent(key) + '=' + encodeURIComponent(val))
          .join('&');
      }
      // Encode normal key-value pairs
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .filter((param) => param) // Remove any empty strings
    .join('&');

  // Prepend '?' if the query string is not empty
  return queryString ? '?' + queryString : '';
}