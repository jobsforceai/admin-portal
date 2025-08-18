"use client";

import { getSubmission, gradeSubmission } from "@/actions/adminActions";
import { Submission } from "@/types";
import { useEffect, useState, useTransition, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

type Props = {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onGraded: () => void;
};

export default function SubmissionGradingModal({
  applicationId,
  isOpen,
  onClose,
  onGraded,
}: Props) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, startGradingTransition] = useTransition();
  const [gradedAnswers, setGradedAnswers] = useState<
    { questionId: string; manualScore: number; notes: string }[]
  >([]);
  const [graderNotes, setGraderNotes] = useState("");

  const questionsMap = useMemo(() => {
    if (!submission) return new Map();
    const map = new Map();
    submission.assignmentId.sections.forEach((section) => {
      section.questions.forEach((question) => {
        map.set(question.id, { ...question, sectionType: section.type });
      });
    });
    return map;
  }, [submission]);

  useEffect(() => {
    if (isOpen && applicationId) {
      const fetchSubmission = async () => {
        setIsLoading(true);
        const token = sessionStorage.getItem("adminToken");
        if (!token) {
          toast.error("Authentication token not found.");
          setIsLoading(false);
          return;
        }
        const result = await getSubmission(applicationId, token);
        if (result.success && result.data) {
          setSubmission(result.data);
        } else {
          toast.error(result.message);
          onClose();
        }
        setIsLoading(false);
      };
      fetchSubmission();
    }
  }, [isOpen, applicationId, onClose]);

  useEffect(() => {
    if (submission) {
      const initialGradedAnswers = submission.answers.map((answer) => {
        const question = questionsMap.get(answer.questionId);
        let score = answer.manualScore;

        if (question && question.sectionType === "multiple-choice") {
          // For MCQs, the score is determined by correctness, not manual input initially.
          if (question.correctAnswer === answer.answer) {
            const section = submission.assignmentId.sections.find((s) =>
              s.questions.some((q) => q.id === question.id)
            );
            score = section?.pointsPerQuestion || 0;
          } else {
            score = 0;
          }
        } else if (score === undefined) {
          // For other question types, if no manual score is set, use AI suggested score.
          score = answer.aiSuggestedScore ?? 0;
        }

        return {
          questionId: answer.questionId,
          manualScore: score ?? 0,
          notes: answer.notes || "",
        };
      });
      setGradedAnswers(initialGradedAnswers);
      setGraderNotes(submission.graderNotes || "");
    }
  }, [submission, questionsMap]);

  const handleGradeChange = (
    questionId: string,
    field: "manualScore" | "notes",
    value: string | number
  ) => {
    setGradedAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, [field]: value } : answer
      )
    );
  };

  const handleSubmitGrade = () => {
    // Validation check
    for (const answer of gradedAnswers) {
      const score = answer.manualScore;
      if (!Number.isInteger(score) || score < 0) {
        const question = questionsMap.get(answer.questionId);
        toast.error(
          `Invalid score for question: "${
            question?.prompt || answer.questionId
          }". Scores must be positive integers.`
        );
        return;
      }
    }

    startGradingTransition(async () => {
      const token = sessionStorage.getItem("adminToken");
      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      const gradingData = {
        gradedAnswers: gradedAnswers.map((answer) => ({
          ...answer,
          manualScore: Number(answer.manualScore),
        })),
        graderNotes,
      };

      const result = await gradeSubmission(applicationId, gradingData, token);

      if (result.success) {
        toast.success("Submission graded successfully!");
        onGraded();
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <Toaster richColors />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Grade Submission</h2>
        {isLoading ? (
          <p>Loading submission...</p>
        ) : !submission ? (
          <p>No submission data found.</p>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold">
                Assignment: {submission.assignmentId.title}
              </h3>
            </div>
            {submission.answers.map((answer, index) => {
              const question = questionsMap.get(answer.questionId);
              if (!question) return null;

              const isMcq = question.sectionType === "multiple-choice";
              const isCorrect = isMcq && question.correctAnswer === answer.answer;

              return (
                <div
                  key={answer.questionId}
                  className="mb-6 p-4 border rounded-md"
                >
                  <p className="font-semibold">
                    Q{index + 1}: {question.prompt}
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 rounded flex items-center">
                    <p className="font-semibold text-sm mb-1 mr-2">Answer:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {answer.answer}
                    </p>
                    {isMcq && (
                      <span className="ml-3">
                        {isCorrect ? (
                          <CheckCircle className="text-green-500" />
                        ) : (
                          <XCircle className="text-red-500" />
                        )}
                      </span>
                    )}
                  </div>

                  {answer.aiJustification && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="font-semibold text-sm text-blue-800 mb-1">
                        AI Analysis
                      </p>
                      <p className="text-sm text-blue-700">
                        {answer.aiJustification}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Suggested Score:</strong>{" "}
                        {answer.aiSuggestedScore ?? "N/A"}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Score
                    </label>
                    <input
                      type="number"
                      value={
                        gradedAnswers.find(
                          (a) => a.questionId === answer.questionId
                        )?.manualScore || 0
                      }
                      onChange={(e) =>
                        handleGradeChange(
                          answer.questionId,
                          "manualScore",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      readOnly={isMcq} // Make score for MCQs read-only
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      value={
                        gradedAnswers.find(
                          (a) => a.questionId === answer.questionId
                        )?.notes || ""
                      }
                      onChange={(e) =>
                        handleGradeChange(
                          answer.questionId,
                          "notes",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Overall Grader Notes
              </label>
              <textarea
                value={graderNotes}
                onChange={(e) => setGraderNotes(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:.border-indigo-500 sm:text-sm"
                rows={4}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGrade}
                disabled={isGrading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isGrading ? "Saving..." : "Save Grade"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}