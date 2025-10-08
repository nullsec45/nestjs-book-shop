export type UniqueStrategy = "time" | "uuid" | "short";
export interface SlugOptions {
  separator?: string;     
  lower?: boolean;        
  uniqueStrategy?: UniqueStrategy; 
  uniqueLength?: number;   
  presetId?: string;       
}


export function slugWithId(input: string, options: SlugOptions = {}): string {
  const {
    separator = "-",
    lower = true,
    uniqueStrategy = "short",
    uniqueLength = 6,
    presetId,
  } = options;

  let slug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")             
    .replace(/[^a-zA-Z0-9]+/g, separator)        
    .replace(new RegExp(`${separator}+`, "g"), separator) 
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), ""); 

  if (lower) slug = slug.toLowerCase();

  const id =
    presetId ??
    (() => {
      if (uniqueStrategy === "uuid" && typeof crypto?.randomUUID === "function") {
        return crypto.randomUUID().split("-")[0];
      }
      if (uniqueStrategy === "time") {
        return (
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 4)
        );
      }
      let s = "";
      while (s.length < uniqueLength) {
        s += Math.random().toString(36).slice(2);
      }
      return s.slice(0, uniqueLength);
    })();

  return slug ? `${slug}${separator}${id}` : id;
}