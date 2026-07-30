import { getSanityClient } from "@/lib/sanity/client";

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
  patch: { set?: Record<string, any>; unset?: string[] };
}): Promise<any> {
  const client = getSanityClient();
  let patcher = client.patch(params.id);
  
  if (params.patch?.set) {
    patcher = patcher.set(params.patch.set);
  }
  
  if (params.patch?.unset && params.patch.unset.length > 0) {
    patcher = patcher.unset(params.patch.unset);
  }
  
  return patcher.commit();
}

export async function sanityDeleteDoc(id: string): Promise<any> {
  const client = getSanityClient();
  return client.delete(id);
}




