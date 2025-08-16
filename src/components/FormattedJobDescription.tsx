"use client";

import React from "react";

interface FormattedJobDescriptionProps {
  description: string;
}

const FormattedJobDescription: React.FC<FormattedJobDescriptionProps> = ({
  description,
}) => {
  const sections = description.split("\n").reduce< 
    { title: string; points: string[] }[] 
  >((acc, line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return acc;

    if (trimmedLine.startsWith("•")) {
      // It's a bullet point
      if (acc.length > 0) {
        acc[acc.length - 1].points.push(
          trimmedLine.substring(1).trim()
        );
      }
    } else if (trimmedLine.endsWith(".")) {
      // It's a paragraph, treat it as a point under the last title
      if (acc.length > 0) {
        acc[acc.length - 1].points.push(trimmedLine);
      } else {
        // Or if it's the very first line
        acc.push({ title: "Overview", points: [trimmedLine] });
      }
    } else {
      // It's a title
      acc.push({ title: trimmedLine, points: [] });
    }
    return acc;
  }, []);

  return (
    <div className="prose prose-blue max-w-none">
      {sections.map((section, index) => (
        <div key={index} className="mb-6">
          <h3 className="font-bold text-xl mb-2 text-gray-800">
            {section.title}
          </h3>
          {section.points.length > 0 && (
            <ul className="list-disc list-inside space-y-2">
              {section.points.map((point, pIndex) => (
                <li key={pIndex} className="text-gray-700">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormattedJobDescription;
