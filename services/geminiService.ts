
import { GoogleGenAI, Type } from "@google/genai";

// Initialization and API key usage strictly follows the @google/genai guidelines
export async function getDailyMotivation(): Promise<string> {
  const fallbacks = [
    "A disciplina é a ponte entre o sonho e a faixa preta.",
    "No tatame da vida, a única derrota é desistir de lutar.",
    "Sua guarda é sua resiliência; não deixe os problemas passarem.",
    "O segredo da evolução não é a força, mas a consistência no detalhe."
  ];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Gere uma frase curta, impactante e mística de motivação para um lutador de Jiu-Jitsu. Use gírias como 'raspagem', 'guarda', 'finalização' ou 'tatame' como metáforas para a vida. Máximo 15 palavras.",
      config: {
        temperature: 0.9,
        topP: 0.95,
      },
    });
    return response.text?.replace(/"/g, '') || fallbacks[0];
  } catch (error) {
    return fallbacks[0];
  }
}

export async function analyzeStorageHealth(dataSummary: string): Promise<{ healthScore: number; recommendations: string; potentialSavings: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a densidade de objetos e latência deste bucket Google Cloud da federação: ${dataSummary}. Identifique se há metadados excessivos ou logs de auditoria obsoletos. Retorne um diagnóstico técnico com analogias de Jiu-Jitsu.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER, description: "De 0 a 100" },
            recommendations: { type: Type.STRING },
            potentialSavings: { type: Type.STRING }
          },
          required: ["healthScore", "recommendations", "potentialSavings"],
        },
      },
    });
    return JSON.parse(response.text || '{"healthScore": 100, "recommendations": "Cloud Estável", "potentialSavings": "0KB"}');
  } catch (error) {
    return { healthScore: 50, recommendations: "IA Offline. Recomenda-se purga manual de instâncias.", potentialSavings: "Estimando..." };
  }
}

export async function moderateAnnouncement(content: string): Promise<{ authorized: boolean; reason: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a seguinte mensagem para um mural de avisos de uma academia de Jiu-Jitsu: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            authorized: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["authorized", "reason"],
        },
      },
    });
    return JSON.parse(response.text || '{"authorized": true, "reason": "Erro no retorno da IA"}');
  } catch (error) {
    console.warn("IA Error:", error);
    return { authorized: true, reason: "Aprovado automaticamente (Falha na rede neural)." };
  }
}

export async function processFinancialStatus(userName: string, userRole: string, daysDiff: number): Promise<{ message: string; paymentLink: string; action: 'none' | 'warn' | 'block' }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = daysDiff > 0 ? `está com ${daysDiff} dias de ATRASO` : `vence em ${Math.abs(daysDiff)} dias`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um diagnóstico financeiro para ${userName} (${userRole}) que ${context}. Use gírias de Jiu-Jitsu.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            paymentLink: { type: Type.STRING },
            action: { type: Type.STRING, enum: ['none', 'warn', 'block'] }
          },
          required: ["message", "paymentLink", "action"]
        }
      }
    });
    return JSON.parse(response.text || '{"message": "Mantenha a guarda alta.", "paymentLink": "#", "action": "none"}');
  } catch (error) {
    return { 
      message: "Mantenha sua guarda financeira alta.", 
      paymentLink: "https://stripe.com", 
      action: daysDiff > 5 ? 'block' : 'warn' 
    };
  }
}
