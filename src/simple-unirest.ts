import unirest from "unirest";

type RequestType = "json" | "html";

interface UnirestRequest<T> extends Promise<{ body: T }> {
  type: (t: RequestType) => UnirestRequest<T>;
  field: (payload: Object) => UnirestRequest<T>;
  send: (payload: Object | Buffer | string) => UnirestRequest<T>;
  end: (resolve: (result: any) => void) => UnirestRequest<T>;
}

interface SimpleUnirest {
  get: <T = unknown>(url: string) => UnirestRequest<T>;
  post: <T = unknown>(url: string) => UnirestRequest<T>;
}

function getSimpleUnirest(endpoint: string): SimpleUnirest {
  // const auth = 'Basic ' + Buffer.from(apiKey + ':' + 'X').toString('base64')
  const headers = {
    //   Authorization: auth,
  };

  return {
    get: (url: string) => unirest.get(endpoint + url).headers(headers),
    post: (url: string) => unirest.post(endpoint + url).headers(headers),
  };
}

export { getSimpleUnirest };
