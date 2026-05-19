import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Process Menu Item function running!")

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record

    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      })
    }

    console.log(`Processing: ${record.name} (${record.id})`)

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // ── STEP 1: Gemini Nutritional Analysis ──
    const geminiKey = Deno.env.get("GEMINI_API_KEY")
    let nutritionalData = null

    if (geminiKey && geminiKey !== "your_new_gemini_key") {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a nutritional analysis expert. Analyze this dish and return ONLY valid JSON (no markdown, no code fences) with this structure:
{"calories": number, "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg", "sodium": "Xmg", "notes": "brief health note"}

Dish: ${record.name}
Description: ${record.description || "No description"}`
                }]
              }]
            })
          }
        )

        if (geminiRes.ok) {
          const result = await geminiRes.json()
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ""
          const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
          try {
            nutritionalData = JSON.parse(cleaned)
            console.log("Gemini analysis complete:", nutritionalData)
          } catch {
            console.error("Failed to parse Gemini response:", text)
          }
        } else {
          console.error("Gemini API error:", await geminiRes.text())
        }
      } catch (err) {
        console.error("Gemini call failed:", err.message)
      }
    } else {
      console.log("No Gemini API key set, skipping nutrition analysis")
    }

    // ── STEP 2: Tripo 3D Model Generation ──
    const tripoKey = Deno.env.get("TRIPO_API_KEY")
    let modelUrl = null

    if (tripoKey && tripoKey !== "your_new_tripo_key") {
      try {
        console.log("Starting Tripo 3D generation...")
        const tripoRes = await fetch("https://api.tripo3d.ai/v2/openapi/task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tripoKey}`
          },
          body: JSON.stringify({
            type: "text_to_model",
            prompt: `Photorealistic 3D model of ${record.name}. ${record.description || ""}. Restaurant quality food dish on a clean plate, studio lighting.`
          })
        })

        if (tripoRes.ok) {
          const tripoResult = await tripoRes.json()
          const taskId = tripoResult.data?.task_id

          if (taskId) {
            console.log(`Tripo task started: ${taskId}`)

            // Poll for up to 2 minutes (24 x 5s)
            for (let i = 0; i < 24; i++) {
              await new Promise(r => setTimeout(r, 5000))

              const statusRes = await fetch(
                `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
                { headers: { "Authorization": `Bearer ${tripoKey}` } }
              )

              if (statusRes.ok) {
                const statusData = await statusRes.json()
                const status = statusData.data?.status

                if (status === "success") {
                  modelUrl = statusData.data?.output?.model
                  console.log("Tripo model ready:", modelUrl)
                  break
                } else if (status === "failed") {
                  console.error("Tripo task failed")
                  break
                }
                console.log(`Tripo polling ${i + 1}/24 - status: ${status}`)
              }
            }
          }
        } else {
          console.error("Tripo API error:", await tripoRes.text())
        }
      } catch (err) {
        console.error("Tripo call failed:", err.message)
      }
    } else {
      console.log("No Tripo API key set, skipping 3D generation")
    }

    // ── STEP 3: Update the database ──
    const updateData = {
      status: modelUrl ? "ready" : (nutritionalData ? "processed" : "processing"),
    }
    if (nutritionalData) updateData.nutrition = nutritionalData
    if (modelUrl) updateData.model_url = modelUrl

    const { error: updateError } = await supabaseAdmin
      .from("menu_items")
      .update(updateData)
      .eq("id", record.id)

    if (updateError) {
      console.error("DB update failed:", updateError.message)
    } else {
      console.log(`Updated ${record.name}: status=${updateData.status}`)
    }

    return new Response(
      JSON.stringify({ message: "Processed", nutrition: nutritionalData, modelUrl, status: updateData.status }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Function error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
