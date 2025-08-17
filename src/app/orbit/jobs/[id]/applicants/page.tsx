import ApplicantsClientPage from "./client";

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  return <ApplicantsClientPage jobId={awaitedParams.id} />;
}
