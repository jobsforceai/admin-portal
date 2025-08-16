import JobApplicantsClientPage from "./client";

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobApplicantsClientPage jobId={id} />;
}
