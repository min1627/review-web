const META_API_VERSION = "v18.0";
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

export interface CreativeParams {
  name: string;
  pageId: string;
  imageHash: string;
  message: string;
  link?: string;
  callToAction?: string;
}

export interface AdParams {
  name: string;
  adsetId: string;
  creativeId: string;
  status?: "ACTIVE" | "PAUSED";
}

export class MetaAdsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(
    endpoint: string,
    options: {
      method?: "GET" | "POST";
      params?: Record<string, string>;
      body?: FormData | string;
      contentType?: string;
    } = {}
  ) {
    const { method = "GET", params = {}, body, contentType } = options;
    const url = new URL(`${META_API_BASE}${endpoint}`);

    if (method === "GET") {
      url.searchParams.set("access_token", this.accessToken);
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {};
    if (contentType) headers["Content-Type"] = contentType;

    let fetchBody: FormData | string | undefined = undefined;
    if (method === "POST") {
      if (body instanceof FormData) {
        body.append("access_token", this.accessToken);
        fetchBody = body;
      } else {
        const postParams = new URLSearchParams({
          access_token: this.accessToken,
          ...params,
        });
        if (body) {
          const parsed = JSON.parse(body);
          for (const [k, v] of Object.entries(parsed)) {
            postParams.set(k, typeof v === "string" ? v : JSON.stringify(v));
          }
        }
        fetchBody = postParams.toString();
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: fetchBody,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const apiError = data.error || {};
      throw new Error(
        apiError.message || `Meta API error (${response.status})`
      );
    }

    return data;
  }

  async getAdAccounts(): Promise<AdAccount[]> {
    const data = await this.request("/me/adaccounts", {
      params: {
        fields: "id,name,account_status,currency,timezone_name",
      },
    });
    return data.data || [];
  }

  async uploadImage(
    accountId: string,
    imageBuffer: Buffer,
    fileName: string = "ad_creative.png"
  ): Promise<string> {
    const formData = new FormData();
    const uint8 = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8], { type: "image/png" });
    formData.append("filename", blob, fileName);

    const data = await this.request(`/${accountId}/adimages`, {
      method: "POST",
      body: formData,
    });

    // Response: { images: { filename: { hash: "xxx", ... } } }
    const images = data.images || {};
    const firstImage = Object.values(images)[0] as { hash?: string } | undefined;
    if (!firstImage?.hash) {
      throw new Error("Failed to get image hash from Meta API");
    }
    return firstImage.hash;
  }

  async createCreative(
    accountId: string,
    params: CreativeParams
  ): Promise<string> {
    const objectStorySpec: Record<string, unknown> = {
      page_id: params.pageId,
      link_data: {
        image_hash: params.imageHash,
        message: params.message,
        ...(params.link ? { link: params.link } : {}),
        ...(params.callToAction
          ? {
              call_to_action: {
                type: params.callToAction,
                ...(params.link ? { value: { link: params.link } } : {}),
              },
            }
          : {}),
      },
    };

    const data = await this.request(`/${accountId}/adcreatives`, {
      method: "POST",
      params: {
        name: params.name,
        object_story_spec: JSON.stringify(objectStorySpec),
      },
    });

    return data.id;
  }

  async createAd(accountId: string, params: AdParams): Promise<string> {
    const data = await this.request(`/${accountId}/ads`, {
      method: "POST",
      params: {
        name: params.name,
        adset_id: params.adsetId,
        creative: JSON.stringify({ creative_id: params.creativeId }),
        status: params.status || "PAUSED",
      },
    });

    return data.id;
  }
}
