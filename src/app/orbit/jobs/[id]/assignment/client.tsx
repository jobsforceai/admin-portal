"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { createAssignment, getAssignment, updateAssignment } from "@/actions/adminActions";
import { useAdmin } from "@/hooks/useAdmin";
import { Plus, Trash2, FileJson } from "lucide-react";
import { Assignment } from "@/types";

type Option = {
  key: string;
  text: string;
};

type Question = {
  id: string;
  prompt: string;
  options?: Option[];
  correctAnswer?: string;
  modelAnswer?: string;
};

type Section = {
  title: string;
  type: "multiple-choice" | "short-answer" | "practical" | "roleplay";
  pointsPerQuestion: number;
  questions: Question[];
};

export default function CreateAssignmentClientPage({ jobId }: { jobId: string }) {
  const admin = useAdmin();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState<number>(85);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (admin) {
      const fetchAssignment = async () => {
        setIsLoading(true);
        const token = sessionStorage.getItem("adminToken");
        const result = await getAssignment(jobId, token);

        if (result.success && result.data) {
          const assignment = result.data as Assignment;
          setTitle(assignment.title);
          setPassingScore(assignment.passingScore);
          setSections(assignment.sections);
          setIsEditMode(true);
        } else if (!result.success) {
          toast.error(result.message);
        }
        setIsLoading(false);
      };
      fetchAssignment();
    }
  }, [admin, jobId]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "",
        type: "multiple-choice",
        pointsPerQuestion: 2,
        questions: [],
      },
    ]);
  };

  const updateSection = (index: number, updatedSection: Partial<Section>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updatedSection };
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const addQuestion = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions.push({
      id: `Q${newSections[sectionIndex].questions.length + 1}`,
      prompt: "",
    });
    setSections(newSections);
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updatedQuestion: Partial<Question>) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions[questionIndex] = {
      ...newSections[sectionIndex].questions[questionIndex],
      ...updatedQuestion,
    };
    setSections(newSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter(
      (_, i) => i !== questionIndex
    );
    setSections(newSections);
  };
  
  const addOption = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...sections];
    const question = newSections[sectionIndex].questions[questionIndex];
    if (!question.options) {
      question.options = [];
    }
    const newKey = String.fromCharCode(65 + question.options.length); // A, B, C...
    question.options.push({ key: newKey, text: "" });
    setSections(newSections);
  };

  const updateOption = (sectionIndex: number, questionIndex: number, optionIndex: number, updatedOption: Partial<Option>) => {
    const newSections = [...sections];
    const question = newSections[sectionIndex].questions[questionIndex];
    if (question.options) {
      question.options[optionIndex] = { ...question.options[optionIndex], ...updatedOption };
      setSections(newSections);
    }
  };

  const removeOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const newSections = [...sections];
    const question = newSections[sectionIndex].questions[questionIndex];
    if (question.options) {
      question.options = question.options.filter((_, i) => i !== optionIndex);
      setSections(newSections);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validation
    if (!title.trim()) {
      toast.error("Assignment title is required.");
      return;
    }
    if (sections.length === 0) {
      toast.error("An assignment must have at least one section.");
      return;
    }

    for (const section of sections) {
      if (!section.title.trim()) {
        toast.error("Every section must have a title.");
        return;
      }
      if (section.questions.length === 0) {
        toast.error(`Section "${section.title}" must have at least one question.`);
        return;
      }
      for (const question of section.questions) {
        if (!question.id.trim() || !question.prompt.trim()) {
          toast.error("Every question must have an ID and a prompt.");
          return;
        }
        if (section.type === "multiple-choice") {
          if (!question.options || question.options.length < 2) {
            toast.error(`A multiple-choice question must have at least two options.`);
            return;
          }
          for (const option of question.options) {
            if (!option.key.trim() || !option.text.trim()) {
              toast.error("All options must have a key and text.");
              return;
            }
          }
          if (!question.correctAnswer || !question.correctAnswer.trim()) {
            toast.error(`A multiple-choice question must have a correct answer specified.`);
            return;
          }
        }
      }
    }

    startTransition(async () => {
      const assignmentData = {
        title,
        passingScore,
        sections,
      };

      const token = sessionStorage.getItem("adminToken");
      const result = isEditMode
        ? await updateAssignment(jobId, assignmentData, token)
        : await createAssignment(jobId, assignmentData, token);

      if (result.success) {
        toast.success(result.message);
        if (!isEditMode) {
          // Clear form only on create
          setTitle("");
          setPassingScore(85);
          setSections([]);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleJsonImport = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      // Basic validation to check for key properties
      if (parsedJson.title && parsedJson.passingScore && Array.isArray(parsedJson.sections)) {
        setTitle(parsedJson.title);
        setPassingScore(parsedJson.passingScore);
        setSections(parsedJson.sections);
        setIsJsonModalOpen(false);
        toast.success("Successfully imported from JSON.");
      } else {
        toast.error("Invalid JSON structure for an assignment.");
      }
    } catch (error) {
      toast.error("Invalid JSON format. Please check the console for details.");
      console.error("JSON Parsing Error:", error);
    }
  };

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  if (!admin.roles.includes("hiring_manager")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-2xl text-red-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        {isEditMode ? "Edit Assignment" : "Create Assignment"} for Job
      </h1>
      <div className="mb-4">
        <button
          onClick={() => setIsJsonModalOpen(true)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center"
        >
          <FileJson size={18} className="mr-2" /> Import from JSON
        </button>
      </div>

      {isJsonModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Import Assignment from JSON</h2>
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded-md text-black bg-white"
              placeholder="Paste your assignment JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="px-4 py-2 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleJsonImport}
                className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Parse and Import
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
              <input type="number" id="passingScore" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
          </div>

          <hr />

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Section {sectionIndex + 1}</h2>
                <button type="button" onClick={() => removeSection(sectionIndex)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Section Title" value={section.title} onChange={(e) => updateSection(sectionIndex, { title: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black" />
                <select value={section.type} onChange={(e) => updateSection(sectionIndex, { type: e.target.value as Section["type"] })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black">
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="practical">Practical</option>
                  <option value="roleplay">Roleplay</option>
                </select>
                <input type="number" placeholder="Points per Question" value={section.pointsPerQuestion} onChange={(e) => updateSection(sectionIndex, { pointsPerQuestion: Number(e.target.value) })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black" />
              </div>

              <div className="mt-4">
                {section.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="p-3 my-2 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                      <button type="button" onClick={() => removeQuestion(sectionIndex, questionIndex)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <input type="text" placeholder="Question ID" value={question.id} readOnly className="w-full mb-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-black cursor-not-allowed" />
                    <textarea placeholder="Question Prompt" value={question.prompt} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { prompt: e.target.value })} className="w-full mb-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-black" />

                    {section.type === "multiple-choice" && (
                      <div>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2 mb-2">
                            <input type="text" placeholder="Key" value={option.key} readOnly className="w-1/4 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-black cursor-not-allowed" />
                            <input type="text" placeholder="Text" value={option.text} onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, { text: e.target.value })} className="w-3/4 px-3 py-2 bg-white border border-gray-300 rounded-md text-black" />
                            <button type="button" onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)} className="text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(sectionIndex, questionIndex)} className="text-sm text-indigo-600 hover:text-indigo-800">
                          Add Option
                        </button>
                        <input type="text" placeholder="Correct Answer Key" value={question.correctAnswer} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { correctAnswer: e.target.value })} className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-black" />
                      </div>
                    )}

                    {section.type !== "multiple-choice" && (
                      <textarea placeholder="Model Answer" value={question.modelAnswer} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { modelAnswer: e.target.value })} className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-black" />
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addQuestion(sectionIndex)} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                  <Plus size={16} className="mr-1" /> Add Question
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addSection} className="w-full flex justify-center py-2 px-4 border border-dashed rounded-md text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50">
            <Plus size={20} className="mr-2" /> Add Section
          </button>

          <div>
            <button type="submit" disabled={isPending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              {isPending ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Assignment" : "Create Assignment")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}