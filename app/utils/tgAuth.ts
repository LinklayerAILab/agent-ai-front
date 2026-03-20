



export function createQueryStringFromJson(json: Record<string, string | number>) {
    
    const queryString = Object.keys(json)
      .filter(key => json[key] != null) // Filter out null and undefined
      .map((key) => {
        const value = json[key];
        return `${key}=${encodeURIComponent(value.toString())}`;
      })
      .join('&');
    return queryString;
}
