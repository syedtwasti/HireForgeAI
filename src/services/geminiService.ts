import { GoogleGenAI, Type } from "@google/genai";
import type { Content } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const generateCoverLetter = async (
  company: string, 
  role: string, 
  description: string, 
  userSkills: string = "general professional skills"
): Promise<string> => {
  try {
    const prompt = `
      Write a professional and engaging cover letter for the position of ${role} at ${company}.
      
      Job Description:
      ${description}
      
      My Skills/Background:
      ${userSkills}
      
      Keep it concise (under 300 words), professional, and enthusiastic. 
      Do not include placeholders like [Your Name] or [Address], start directly with "Dear Hiring Manager,".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate cover letter. Please try again.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return "Error generating cover letter. Please check your API key.";
  }
};

export const generateInterviewGuide = async (
  company: string,
  role: string,
  description: string
): Promise<string> => {
  try {
    const prompt = `
      Create a comprehensive interview preparation guide for the role of ${role} at ${company}.
      
      Leverage your existing knowledge about ${company} (culture, products, industry standing) combined with the Job Description below.
      
      Job Description provided:
      ${description}
      
      The guide must include:
      1. **Company & Role Insight**: Brief analysis of ${company}'s current focus and what they likely value in this ${role} role.
      2. **Key Technical/Soft Skills**: What specific skills from the description should be emphasized.
      3. **5 Potential Interview Questions**: Specific to ${company} and this role, with brief tips on how to answer.
      4. **3 Questions to Ask the Interviewer**: Strategic questions showing deep interest in ${company}.
      
      Format the output clearly with headings and bullet points. Keep it practical and ready to use.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate interview guide. Please try again.";
  } catch (error) {
    console.error("Error generating interview guide:", error);
    return "Error generating interview guide. Please check your API key.";
  }
};

export const generateAvatar = async (imageBase64: string, stylePrompt: string): Promise<string | null> => {
  try {
    // Extract base64 data (remove data:image/xxx;base64, prefix if present)
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const mimeType = imageBase64.includes(';') ? imageBase64.split(';')[0].split(':')[1] : 'image/png';

    const prompt = `Transform this image into a professional LinkedIn profile picture headshot. 
    Maintain the person's identity but improve lighting, background, and attire to be professional.
    Style details: ${stylePrompt || 'Professional business attire, neutral background, soft studio lighting'}.
    Output a high quality photorealistic image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      },
    });

    // Iterate through parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
};

export const parseAndImproveResume = async (fileBase64: string, mimeType: string): Promise<any> => {
  try {
    const base64Data = fileBase64.split(',')[1] || fileBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this resume document. Extract all the information and rewriting the content to be more professional, impactful, and concise using strong action verbs.
            
            Return the result strictly as a JSON object matching this schema:
            {
              fullName: string,
              email: string,
              phone: string,
              summary: string,
              skills: string,
              experience: [{ id: string, title: string, company: string, date: string, details: string }],
              education: [{ id: string, title: string, company: string, date: string, details: string }],
              projects: [{ id: string, name: string, technologies: string, link: string, description: string }]
            }
            
            Ensure dates are properly formatted. If a field is missing, use an empty string.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            summary: { type: Type.STRING },
            skills: { type: Type.STRING },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  date: { type: Type.STRING },
                  details: { type: Type.STRING },
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  date: { type: Type.STRING },
                  details: { type: Type.STRING },
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  technologies: { type: Type.STRING },
                  link: { type: Type.STRING },
                  description: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

export const createChatSession = (history: Content[] = []) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: "You are Claire, a friendly, encouraging, and highly knowledgeable job search assistant. You help users with career advice, resume tips, interview preparation, and staying motivated. Keep answers concise and helpful."
    }
  });
};