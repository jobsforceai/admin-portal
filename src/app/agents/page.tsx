import { getAllAgents } from "@/actions/superAdminActions";
import AgentsClientPage from "./client";

type SearchParams = Promise<{
  page?: string;
  search?: string;
}>;

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, search: searchParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const search = searchParam || "";
  const agentsData = await getAllAgents(page, 10, search);

  return <AgentsClientPage data={agentsData} />;
}