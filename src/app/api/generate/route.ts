import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const PROMPTS: Record<string, string> = {
  "3months": `
This is a photo of a person at a personal training gym.
Please edit this image to show how this person would naturally look after 3 months of:
- Regular personal training (3 times per week)
- Balanced diet with proper nutrition
- Adequate sleep and recovery

Guidelines for the transformation:
- Reduce body fat by approximately 3-5% visibly
- Show subtle muscle definition improvement
- Keep the transformation realistic and achievable
- Maintain the same pose, clothing, background, and lighting
- The face and identity must remain exactly the same
- Do NOT make extreme changes - the result should be believable as a 3-month progress
- Focus on: slightly slimmer waist, more toned arms, improved posture
`,
  "4months": `
This is a photo of a person at a personal training gym.
Please edit this image to show how this person would naturally look after 4 months of:
- Regular personal training (3 times per week)
- Balanced diet with proper nutrition
- Adequate sleep and recovery

Guidelines for the transformation:
- Reduce body fat by approximately 5-7% visibly
- Show moderate muscle definition improvement
- Keep the transformation realistic and achievable
- Maintain the same pose, clothing, background, and lighting
- The face and identity must remain exactly the same
- Do NOT make extreme changes - the result should be believable as a 4-month progress
- Focus on: noticeably slimmer waist, toned arms and shoulders, improved overall physique
`,
  "6months": `
This is a photo of a person at a personal training gym.
Please edit this image to show how this person would naturally look after 6 months of:
- Regular personal training (3 times per week)
- Balanced diet with proper nutrition
- Adequate sleep and recovery

Guidelines for the transformation:
- Reduce body fat by approximately 7-10% visibly
- Show clear muscle definition improvement
- Keep the transformation realistic and achievable
- Maintain the same pose, clothing, background, and lighting
- The face and identity must remain exactly the same
- Do NOT make extreme changes - the result should be believable as a 6-month progress
- Focus on: significantly slimmer waist, well-defined arms and shoulders, visible core definition, improved overall body composition
`,
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "APIキーが設定されていません" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const period = (formData.get("period") as string) || "3months";

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "画像がアップロードされていません" },
        { status: 400 }
      );
    }

    // 画像をBase64に変換
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // Before画像のData URL
    const beforeDataUrl = `data:${mimeType};base64,${base64Image}`;

    // Google Gen AI クライアント
    const ai = new GoogleGenAI({ apiKey });

    const prompt = PROMPTS[period] || PROMPTS["3months"];

    // 画像生成リクエスト
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // レスポンスから画像を探す
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json(
        { success: false, error: "画像の生成に失敗しました" },
        { status: 500 }
      );
    }

    let afterDataUrl = "";

    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType: responseMimeType, data } = part.inlineData;
        afterDataUrl = `data:${responseMimeType};base64,${data}`;
        break;
      }
    }

    if (!afterDataUrl) {
      // 画像が返されなかった場合、テキストレスポンスを確認
      const textPart = parts.find((p) => p.text);
      const errorMessage = textPart?.text || "画像の生成に失敗しました。別の写真で試してみてください。";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      before: beforeDataUrl,
      after: afterDataUrl,
      period: period,
    });
  } catch (error) {
    console.error("Generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "エラーが発生しました";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
