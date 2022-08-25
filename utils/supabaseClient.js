import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const fetchRepoMetaData = async ({
  setIsLoading,
  setPackages,
  inputText,
}) => {
  setIsLoading(true);
  const archOfficial = async () =>
    supabase
      .from("arch_official")
      .select("pkgname,repo,arch,pkgdesc")
      .textSearch("pkgname", inputText)
      .order("pkgname", { ascending: true })
      .order("repo", { ascending: true })
      .order("arch", { ascending: true })
      .then(({ data, error }) => {
        if (!error) {
          return data.map((e) => {
            return {
              pkgname: e["pkgname"],
              repo: e["repo"],
              arch: e["arch"],
              description: e["pkgdesc"],
              isAUR: false,
            };
          });
        }
        return [];
      });
  const aur = async () =>
    supabase
      .from("aur")
      .select("ID,Name,Description")
      .textSearch("Name", inputText)
      .order("Name", { ascending: true })
      .order("ID", { ascending: true })
      .then(({ data, error }) => {
        if (!error) {
          return data.map((e) => {
            return {
              pkgname: e["Name"],
              ID: e["ID"],
              description: e["Description"],
              isAUR: true,
            };
          });
        }
        return [];
      });
  const data = [].concat.apply(
    [],
    (await Promise.allSettled([archOfficial(), aur()]))
      .filter((e) => e.status === "fulfilled")
      .map((e) => e.value)
  );
  setPackages(data);
  setIsLoading(false);
};
