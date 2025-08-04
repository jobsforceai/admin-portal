import { getAllCouncellers } from "@/actions/superAdminActions";
import CouncellersClientPage from "./client";

type SearchParams = Promise<{
  page?: string;
  search?: string;
}>;

export default async function CouncellersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, search: searchParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const search = searchParam || "";
  const councellersData = await getAllCouncellers(page, 10, search);

  return <CouncellersClientPage data={councellersData} />;
}