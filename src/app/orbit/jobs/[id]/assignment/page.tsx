import CreateAssignmentClientPage from "./client";

export default async function CreateAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreateAssignmentClientPage jobId={id} />;
}