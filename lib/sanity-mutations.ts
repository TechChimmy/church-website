import { getSanityClient } from "@/sanity/lib/client";

export async function sanityCreateDoc(params: {
  type: string;
  data: Record<string, any>;
}): Promise<any> {
  const client = getSanityClient();
  return client.create({
    _type: params.type,
    ...params.data,
  });
}

export async function sanityPatchDoc(params: {
  id: string;
  type: string;
  patch: { set?: Record<string, any> };
}): Promise<any> {
  const client = getSanityClient();
  if (params.patch?.set) {
    return client.patch(params.id).set(params.patch.set).commit();
  }
  return null;
}

export async function sanityDeleteDoc(id: string): Promise<any> {
  const client = getSanityClient();
  return client.delete(id);
}




