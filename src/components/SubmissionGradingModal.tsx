"use client";

import { useState } from "react";
import { Submission } from "@/types";
import { X } from "lucide-react";

// Assuming GradedAnswer is defined in types, if not it should be:
// export interface GradedAnswer {
//   questionId: string;
//   manualScore: number;
//   notes: string;
// }

interface SubmissionGradingModalProps {
  submission: Submission;
  onClose: () => void;
  onSubmit: (gradingData: {
    gradedAnswers: { questionId: string; manualScore: number; notes: string }[];
    graderNotes?: string;
  }) => void;
  isGrading: boolean;
}

export default function SubmissionGradingModal({
  submission,
  onClose,
  onSubmit,
  isGrading,
}: SubmissionGradingModalProps) {
  const [gradedAnswers, setGradedAnswers] = useState(() =>
    submission.answers.map((answer) => ({
      questionId: answer.questionId,
      manualScore: answer.manualScore ?? answer.aiSuggestedScore ?? 0,
      notes: answer.notes || "",
    }))
  );
  const [graderNotes, setGraderNotes] = useState(submission.graderNotes || "");

  const handleScoreChange = (questionId: string, score: number) => {
    const newScore = isNaN(score) || score < 0 ? 0 : score;
    setGradedAnswers((prev) =>
      prev.map((ga) =>
        ga.questionId === questionId ? { ...ga, manualScore: newScore } : ga
      )
    );
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    setGradedAnswers((prev) =>
      prev.map((ga) => (ga.questionId === questionId ? { ...ga, notes } : ga))
    );
  };

  const handleSubmit = () => {
    onSubmit({ gradedAnswers, graderNotes });
  };

  const findQuestionAndAnswer = (questionId: string) => {
    for (const section of submission.assignmentId.sections) {
      const question = section.questions.find((q) => q.id === questionId);
      if (question) {
        const answer = submission.answers.find(
          (a) => a.questionId === questionId
        );
        return { question, answer, section };
      }
    }
    return { question: null, answer: null, section: null };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Grade Submission: {submission.assignmentId.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {gradedAnswers.map((gradedAnswer) => {
            const { question, answer, section } = findQuestionAndAnswer(
              gradedAnswer.questionId
            );
            if (!question || !section) return null;

            return (
              <div key={question.id} className="border rounded-md p-4">
                <p className="font-semibold text-gray-800">{question.prompt}</p>
                {section.type === "multiple-choice" && (
                  <div className="mt-2 text-sm space-y-1">
                    {question.options?.map((opt) => (
                      <p
                        key={opt.key}
                        className={`${
                          answer?.answer === opt.key ? "font-bold" : ""
                        } ${
                          opt.key === (question as { correctAnswer?: string }).correctAnswer
                            ? "text-green-600"
                            : answer?.answer === opt.key
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {opt.key}: {opt.text}
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-sm text-gray-500">
                    Applicant&apos;s Answer:
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {answer?.answer || "Not answered"}
                  </p>
                </div>
                <div className="mt-3 bg-blue-50 p-3 rounded-md">
                  <p className="font-medium text-sm text-blue-500">
                    Model Answer:
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {question.modelAnswer ||
                      (question as { correctAnswer?: string }).correctAnswer ||
                      "N/A"}
                  </p>
                </div>

                {answer?.aiJustification && (
                  <div className="mt-3 bg-yellow-50 p-3 rounded-md">
                    <p className="font-medium text-sm text-yellow-800">
                      AI Analysis:
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {answer.aiJustification}
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      <strong>Suggested Score:</strong>{" "}
                      {answer.aiSuggestedScore ?? "N/A"}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Score (out of {section.pointsPerQuestion})
                    </label>
                    <input
                      type="number"
                      max={section.pointsPerQuestion}
                      min={0}
                      value={gradedAnswer.manualScore}
                      onChange={(e) =>
                        handleScoreChange(
                          question.id,
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="mt-1 block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black"
                    />
                  </div>
                  <div className="flex-grow">
                    <label className="text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={gradedAnswer.notes}
                      onChange={(e) =>
                        handleNotesChange(question.id, e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="border-t pt-4">
            <label className="text-lg font-semibold text-gray-800">
              Overall Grader Notes
            </label>
            <textarea
              value={graderNotes}
              onChange={(e) => setGraderNotes(e.target.value)}
              className="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={isGrading}
            className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isGrading ? "Submitting..." : "Submit Grade"}
          </button>
        </div>
      </div>
    </div>
  );
}